/**
 * Created by githop on 10/24/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.factory('playbackService', playbackService);

	function playbackService(youTubePlayerManager, html5PlayerManager, playbackChannel, PLAYERSTATES, STATECHANGE) {

		var _video = {};
		var _player = '';
		var _playerInterface = {};

		return {
			setPlayer: setPlayer,
			play: play,
			pause: pause,
			seek: seek,
			getCurrentTime: getCurrentTime
		};

		function setPlayer(videoObj, id, mainPlayer) {
			if (videoObj.urls.youtube && videoObj.urls.youtube.length) {
				_player = 'youtube';
			} else {
				_player = 'html5';
			}

			_createInterface(_player, id, mainPlayer);
		}

		function stateChangeCB(state) {
			playbackChannel.send(STATECHANGE, {state: PLAYERSTATES[state]});
		}


		function play(id) {
			return _playerInterface.play(id);
		}

		function pause(id) {
			_playerInterface.pause(id)
		}

		function seek(id, t) {
			_playerInterface.seekTo(id, t);
		}

		function _createInterface(type, id, mainPlayer) {
			if (type === 'html5') {
				html5PlayerManager.create(id, mainPlayer, stateChangeCB);
				_playerInterface = html5PlayerManager;
			} else {
				// youTubePlayerManager;
			}
		}

		function getCurrentTime(id) {
			_playerInterface.getCurrentTime(id);
		}
	}


})();


