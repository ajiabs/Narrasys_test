/**
 * Created by githop on 10/24/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.factory('playbackService', playbackService);

	function playbackService($interval, youTubePlayerManager, html5PlayerManager, playbackState, analyticsSvc, ittUtils) {

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
			getCurrentTime: getCurrentTime,
			createInstance: createInstance,
			registerStateChangeListener: registerStateChangeListener
		};

		//public methods
		function setPlayer(arr, id, mainPlayer) {
			_playerInterface = _getPlayerManagerFromMediaSrc(arr);
			playbackState.setVideoType(_playerInterface.type);
			if (mainPlayer) {
				_mainPlayerId = id;
				_pollBufferedPercent();
			}

			return _playerInterface.setPlayerId(id, mainPlayer);
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

		function _getPlayerManagerFromMediaSrc(arr) {
			var len = _playerManagers.length, pm = null;

			while (len--) {
				if (ittUtils.existy(_playerManagers[len].parseMediaSrc(arr))) {
					pm = _playerManagers[len];
					break;
				}
			}

			return pm;
		}
	}


})();


