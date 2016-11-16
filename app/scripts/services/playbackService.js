/**
 * Created by githop on 10/24/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.factory('playbackService', playbackService);

	function playbackService($interval, youTubePlayerManager, html5PlayerManager, playbackState, analyticsSvc, ittUtils, urlService) {

		var _video = {};
		var _player = '';
		var _playerInterface = {};
		var _mainPlayerId;
		var _stateChangeCallbacks = [];
		var _playerManagers = [html5PlayerManager, youTubePlayerManager];

		angular.forEach(_playerManagers, function(playerManager) {
			playerManager.registerStateChangeListener(_stateChangeCB)
		});

		return {
			setPlayer: setPlayer,
			play: play,
			pause: pause,
			seek: seek,
			getPlayerDiv: getPlayerDiv,
			getCurrentTime: getCurrentTime,
			createInstance: createInstance,
			registerStateChangeListener: registerStateChangeListener,
			getPlayerState: getPlayerState,
			getPlayerType: getPlayerType,
			setSpeed: setSpeed,
			toggleMute: toggleMute,
			setVolume: setVolume
		};

		//public methods
		function setPlayer(mediaSrcArr, id, mainPlayer) {
			var parsedMedia = urlService.parseMediaSrcArr(mediaSrcArr);

			_playerInterface = _getPlayerManagerFromMediaSrc(parsedMedia);
			playbackState.setState(id, mainPlayer, _playerInterface.type);
			if (mainPlayer) {
				_mainPlayerId = id;
				_pollBufferedPercent();
			}


			console.log('type', _playerInterface.type, parsedMedia);
			_playerInterface.setPlayerId(id, mainPlayer, parsedMedia[0].mediaSrcArr);

			return parsedMedia[0].mediaSrcArr;
		}

		function createInstance(playerId) {

			angular.forEach(_playerManagers, function(pm) {
				if (pm.type === playbackState.getVideoType(playerId)) {
					pm.create(playerId);
				}
			});

			// _playerInterface.create(playerId);
		}

		//called from timlineSvc -> playbackService -> playerManager
		function play(playerId) {

			angular.forEach(_playerManagers, function(pm) {
				pm.play(_setPid(playerId));
			});

			// return _playerInterface.play(_setPid(playerId));
		}

		function pause(playerId) {
			console.log('playbackService#pause', _playerInterface.type);
			_playerInterface.pause(_setPid(playerId))
		}

		function seek(t, playerId) {
			_playerInterface.seekTo(_setPid(playerId), t);
		}

		function registerStateChangeListener(cb) {
			_stateChangeCallbacks.push(cb);
		}

		function getCurrentTime(playerId) {
			_playerInterface.getCurrentTime(_setPid(playerId));
		}

		function getPlayerDiv(playerId) {
			return _playerInterface.getPlayerDiv(_setPid(playerId));
		}

		function getPlayerState(playerId) {
			return _playerInterface.getPlayerState(_setPid(playerId));
		}

		function getPlayerType() {
			return _playerInterface.type;
		}

		function setSpeed(playbackRate, playerId) {
			return _playerInterface.setSpeed(_setPid(playerId), playbackRate);
		}

		function toggleMute(playerId) {
			return _playerInterface.toggleMute(_setPid(playerId));
		}

		function setVolume(vol, playerId) {
			_playerInterface.setVolume(_setPid(playerId), vol);
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

			switch (state) {
				case 'unstarted':
					break;
				case 'ended':
					break;
				case 'playing':
					if (!playbackState.getHasBeenPlayed(emitterId)) {
						playbackState.setHasBeenPlayed(true, emitterId);
					}
					angular.forEach(_playerManagers, function(pm) {
						pm.pauseOtherPlayers(emitterId);
					});
					break;
				case 'paused':
					break;
				case 'buffering':
					analyticsSvc.captureEpisodeActivity("stall");
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
				playbackState.setBufferedPercent(_playerInterface.getBufferedPercent(_mainPlayerId));
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


