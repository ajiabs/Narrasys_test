/**
 * Created by githop on 10/24/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.factory('playbackService', playbackService);

	function playbackService($interval, youTubePlayerManager, html5PlayerManager, ittUtils, urlService, PLAYERSTATES_WORD) {

		var _playerInterfaces = {};
		var _mainPlayerId;
		var _stateChangeCallbacks = [];
		var _playerManagers = [html5PlayerManager, youTubePlayerManager];
		var _timelineState = '';

		angular.forEach(_playerManagers, function(playerManager) {
			playerManager.registerStateChangeListener(_stateChangeCB);
		});

		return {
			seedPlayer: seedPlayer,
			createInstance: createInstance,
			play: play,
			pause: pause,
			seek: seek,
			getCurrentTime: getCurrentTime,
			getPlayerState: getPlayerState,
			toggleMute: toggleMute,
			setVolume: setVolume,
			getPlayerDiv: getPlayerDiv,
			setSpeed: setSpeed,
			registerStateChangeListener: registerStateChangeListener,
			startAtTime: startAtTime,
			getMetaProp: getMetaProp,
			setMetaProp: setMetaProp,
			getTimelineState: getTimelineState,
			setTimelineState: setTimelineState,
			freezeMetaProps: freezeMetaProps,
			unFreezeMetaProps: unFreezeMetaProps
		};

		//public methods
		function seedPlayer(mediaSrcArr, id, mainPlayer) {
			var parsedMedia = urlService.parseMediaSrcArr(mediaSrcArr);

			var pm = _getPlayerManagerFromMediaSrc(parsedMedia);
			_playerInterfaces[id] = pm;
			if (mainPlayer) {
				_mainPlayerId = id;
				_pollBufferedPercent();
			}

			pm.seedPlayerManager(id, mainPlayer, parsedMedia[0].mediaSrcArr);
		}

		function createInstance(playerId) {
			_playerInterfaces[playerId].create(playerId);
		}

		//called from timlineSvc -> playbackService -> playerManager
		function play(playerId) {
			_playerInterfaces[_setPid(playerId)].play(_setPid(playerId));
		}

		function pause(playerId) {
			_playerInterfaces[_setPid(playerId)].pause(_setPid(playerId));
		}

		function seek(t, playerId) {
			_playerInterfaces[_setPid(playerId)].seekTo(_setPid(playerId), t);
		}

		function registerStateChangeListener(cb) {
			_stateChangeCallbacks.push(cb);
		}

		function getCurrentTime(playerId) {
			return _playerInterfaces[_setPid(playerId)].getCurrentTime(_setPid(playerId));
		}

		function getPlayerDiv(playerId) {
			return _playerInterfaces[_setPid(playerId)].getPlayerDiv(_setPid(playerId));
		}

		function getPlayerState(playerId) {
			return _playerInterfaces[_setPid(playerId)].getPlayerState(_setPid(playerId));
		}

		function setSpeed(playbackRate, playerId) {
			return _playerInterfaces[_setPid(playerId)].setSpeed(_setPid(playerId), playbackRate);
		}

		function toggleMute(playerId) {
			return _playerInterfaces[_setPid(playerId)].toggleMute(_setPid(playerId));
		}

		function setVolume(vol, playerId) {
			_playerInterfaces[_setPid(playerId)].setVolume(_setPid(playerId), vol);
		}

		function startAtTime(playerId) {
			if (playerId !== _mainPlayerId) {
				var startAtTime = getCurrentTime(playerId);
				setMetaProp('startAtTime', startAtTime, playerId);
				setMetaProp('hasResumedFromStartAt', false, playerId);
				freezeMetaProps(playerId);
			}
		}

		function getMetaProp(prop, id) {
			var pid = _setPid(id);
			if (ittUtils.existy(_playerInterfaces[pid])) {
				return _playerInterfaces[pid].getMetaProp(pid, prop);
			}
		}

		function setMetaProp(prop, val, id) {
			var pid = _setPid(id);
			if (ittUtils.existy(_playerInterfaces[pid])) {
				_playerInterfaces[pid].setMetaProp(pid, prop, val);
			}
		}

		function getTimelineState() {
			return _timelineState;
		}

		function setTimelineState(state) {
			_timelineState = state;
		}

		function freezeMetaProps(playerId) {
			_playerInterfaces[_setPid(playerId)].freezeMetaProps(_setPid(playerId));
		}

		function unFreezeMetaProps(playerId) {
			_playerInterfaces[_setPid(playerId)].unFreezeMetaProps(_setPid(playerId));
		}

		// private methods
		function _setPid(pid) {
			if (ittUtils.existy(pid)) {
				return pid;
			}
			return _mainPlayerId;
		}

		//respond to events emitted from playerManager
		//playerManager -> playbackSvc -> timelineSvc (if main)
		function _stateChangeCB(stateChangeEvent) {
			var state = stateChangeEvent.state;
			var emitterId = stateChangeEvent.emitterId;
			setMetaProp('playerState', PLAYERSTATES_WORD[state], emitterId);

			switch (state) {
				case 'unstarted':
					break;
				case 'ended':
					break;
				case 'playing':
					if (getMetaProp('hasBeenPlayed', emitterId) === false) {
						setMetaProp('hasBeenPlayed', true, emitterId);
					}
					angular.forEach(_playerManagers, function(pm) {
						pm.pauseOtherPlayers(emitterId);
					});
					break;
				case 'paused':
					break;
				case 'buffering':
					break;
				case 'video cued':
					break;
			}

			if (emitterId === _mainPlayerId) {
				angular.forEach(_stateChangeCallbacks, function(cb) {
					cb(state);
				});
			}
		}

		function _pollBufferedPercent() {
			$interval(function() {
				setMetaProp('bufferedPercent', getMetaProp('bufferedPercent', _mainPlayerId), _mainPlayerId);
			}, 200);
		}

		function _getPlayerManagerFromMediaSrc(parsedMediaSrc) {
			var len = _playerManagers.length, pm = null;
			while (len--) {
				if (parsedMediaSrc.length > 0 && _playerManagers[len].type === parsedMediaSrc[0].type) {
					pm = _playerManagers[len];
					break;
				}
			}
			return pm;
		}
	}


})();


