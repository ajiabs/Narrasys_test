/**
 * Created by githop on 10/24/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.factory('playbackService', playbackService);

	function playbackService($interval, youTubePlayerManager, html5PlayerManager, playbackState, analyticsSvc) {

		var _video = {};
		var _player = '';
		var _playerInterface = {};
		var _playerId;
		var _cbs = [];
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
			registerStateChangeListener: registerStateChangeListener
		};

		//public methods

		function setPlayer(type, id) {
			_playerId = id;
			playbackState.setVideoType(type);

			if (type === 'html5') {
				// html5PlayerManager.create(id, mainPlayer, _stateChangeCB);
				_playerInterface = html5PlayerManager;
				_player = 'html5';
			} else {
				_player = 'youtube';
				_playerInterface = youTubePlayerManager;
			}
			_pollBufferedPercent();
		}

		function play() {
			return _playerInterface.play(_playerId);
		}

		function pause() {
			_playerInterface.pause(_playerId)
		}

		function seek(t) {
			_playerInterface.seekTo(_playerId, t);
		}

		function registerStateChangeListener(cb) {
			_cbs.push(cb);
		}

		function getCurrentTime() {
			_playerInterface.getCurrentTime(_playerId);
		}


		// private methods

		function _stateChangeCB(state) {
			switch (state) {
				case 'unstarted':
					break;
				case 'ended':
					break;
				case 'playing':
					break;
				case 'paused':
					break;
				case 'buffering':
					analyticsSvc.captureEpisodeActivity("stall");
					break;
				case 'video cued':
					break;
			}
			_cbs.forEach(function(cb) {
				cb(state);
			});
		}

		function _pollBufferedPercent() {
			$interval(function() {
				playbackState.setBufferedPercent(_playerInterface.getBufferedPercent(_playerId));
			}, 200);
		}
	}


})();


