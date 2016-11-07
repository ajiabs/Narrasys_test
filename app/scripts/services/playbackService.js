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
			registerStateChangeListener: registerStateChangeListener
		};

		//public methods
		function setPlayer(mediaSrcArr, id, mainPlayer) {
			var parsedMedia = urlService.parseMediaSrc(mediaSrcArr);

			_playerInterface = _getPlayerManagerFromMediaSrc(parsedMedia);
			playbackState.setVideoType(_playerInterface.type);
			if (mainPlayer) {
				_mainPlayerId = id;
				_pollBufferedPercent();
			}

			return {
				parsedMediaSrc: parsedMedia[0].mediaSrcArr,
				playerDiv: _playerInterface.setPlayerId(id, mainPlayer, parsedMedia[0].mediaSrcArr)
			};
		}

		function createInstance(mediaSrcArr, playerId) {
			_playerInterface.create(mediaSrcArr, playerId);
		}

		//called from timlineSvc -> playbackService -> playerManager
		function play() {
			return _playerInterface.play(_mainPlayerId);
		}

		function pause() {
			_playerInterface.pause(_mainPlayerId)
		}

		function seek(t) {
			_playerInterface.seekTo(_mainPlayerId, t);
		}

		function registerStateChangeListener(cb) {
			_stateChangeCallbacks.push(cb);
		}

		function getCurrentTime() {
			_playerInterface.getCurrentTime(_mainPlayerId);
		}

		function getPlayerDiv(id) {
			return _playerInterface.getPlayerDiv(id);
		}


		// private methods
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
				case 'quality changed':
					//do not propagate up to timelineSvc
					return;
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


