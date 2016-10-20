/**
 * Created by githop on 1/18/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.factory('html5PlayerManager', html5PlayerManager);

	var readyStates = {
		0: 'HAVE_NOTHING',
		1: 'HAVE_METADATA',
		2: 'HAVE_CURRENT_DATA',
		3: 'HAVE_FUTURE_DATA',
		4: 'HAVE_ENOUGH_DATA'
	};


	function html5PlayerManager(appState, timelineSvc) {
		var _html5Video;
		var _players = {};
		var _mainPlayerId;

		_html5Video = {
			create: create,
			play: play,
			pause: pause,
			getCurrentTime: getCurrentTime,
			getPlayerState: getPlayerState,
			seekTo: seek,
			pauseOtherEmbeds: pauseOtherEmbeds,
			getBufferPercent: getBufferPercent
		};

		function create(divID, mainPlayer) {
			var plr = document.getElementById(divID);
			plr.onplay = onPlay;
			plr.onpause = onPause;
			plr.onplaying = onPlaying;
			plr.onseeked = onSeeked;
			plr.onseeking = onSeeking;
			plr.ontimeupdate = onTimeUpdate;
			plr.onended = onEnded;
			plr.onloadstart = onLoadStart;
			plr.onloadeddata = onLoadedData;
			plr.onprogress = onProgress;
			plr.oncanplay = onCanPlay;
			plr.onstalled = onStalled;
			plr.onwaiting = onWaiting;
			plr.meta = { playerState: -1, currentTime: 0, playCount: 0 };
			_players[divID] = plr;

			if (mainPlayer === true) {
				_mainPlayerId = divID;
			}

			return plr;
		}

		/*
		 HTML5 media event handlers
		 */
		function onPlay(evt) {
			var player = _derivePlayerFromEvt(evt);
			player.meta.playerState = 1;
		}

		function onPlaying(evt) {
			var player = _derivePlayerFromEvt(evt);
			player.meta.playerState = 1;
			pauseOtherEmbeds(evt.target.id);
			if (evt.target.id !== _mainPlayerId && appState.timelineState === 'playing') {
				timelineSvc.pause();
			}
		}

		function onPause(evt) {
			// console.trace('onPause', evt);
			var player = _derivePlayerFromEvt(evt);
			player.meta.playerState = 2;
		}

		function onLoadStart(evt) {
			var player = _derivePlayerFromEvt(evt);
			player.meta.readyState = 'ready';
		}

		function onLoadedData(evt) {
			//console.log('data load', evt);
		}

		function onProgress(evt) {
			//console.log('progress', evt.type);
		}

		function onCanPlay(evt) {
			appState.playerReady = true;
			// var player = _derivePlayerFromEvt(evt);
            //
			// if (evt.target.id !== _mainPlayerId) {
			// 	appState.embedHtml5PlayerAvailable = true;
			// }

			// player.meta.playerState = 5;
			//first play? overwrite playerState
			// if (player.meta.playCount === 0) {
			// 	player.meta.playerState = -1;
			// }

			// player.meta.playCount++;
		}

		function onSeeked(evt) {

		}

		function onSeeking(evt) {
			appState.playerReady = false;
			var player = _derivePlayerFromEvt(evt);
			// player.meta.playerState = 3;
		}

		function onTimeUpdate(evt) {
			var player = _derivePlayerFromEvt(evt);
			player.meta.currentTime = player.currentTime;
		}

		function onEnded(evt) {
			var player = _derivePlayerFromEvt(evt);
			player.meta.playerState = 0;
		}

		function onStalled(evt) {
		}

		function onWaiting(evt) {
			appState.playerReady = false;
			// appState.timelineState = 'buffering';
			//playbackChannel.doSend('stall', evt.type);
			var player = _derivePlayerFromEvt(evt);
			player.meta.playerState = 3;
		}

		/*
		 private methods
		 */
		function _getInstance(pid) {
			if (_players[pid]) {
				return _players[pid];
			}
		}

		function _derivePlayerFromEvt(event) {
			var pid = event.target.id;
			var player = _players[pid];

			return player;
		}

		/*
		 Playback exported methods
		 */

		function play(pid) {
			var instance = _getInstance(pid);

			if (instance !== undefined) {

				instance.play();
			}

			var mockEvent = { target: { id: pid } };
			onPlay(mockEvent);
		}

		function pause(pid) {
			// console.trace('html5Vid#pause');
			var instance = _getInstance(pid);
			if (instance !== undefined && !instance.paused) {

				instance.pause();
			}



			var mockEvent = { target: { id: pid } };
			onPause(mockEvent);
		}

		function getCurrentTime(pid) {
			var instance = _getInstance(pid);
			if (instance !== undefined) {
				return instance.meta.currentTime;
			}
		}

		function getPlayerState(pid) {
			var instance = _getInstance(pid);
			if (instance !== undefined) {
				return instance.meta.playerState;
			}
		}

		function seek(pid, t) {
			var instance = _getInstance(pid);
			if (instance !== undefined) {
				instance.currentTime = t;
			}
		}

		function pauseOtherEmbeds(id) {
			for (var p in _players) {
				if (p !== id) {
					pause(p);
				}
			}
		}

		function getBufferPercent(pid) {
			var instance = _getInstance(pid);
			if (instance && instance.meta.playerState !== -1) {
				if (instance.buffered.length > 0) {
					var bufLen = instance.buffered.length;
					var bufStart = instance.buffered.start(bufLen -1);
					var bufEnd   = instance.buffered.end(bufLen -1);

					if (bufEnd < 0) {
						bufEnd = bufEnd - bufStart;
						bufStart = 0;
					}
					return bufEnd / appState.duration * 100;
				}
			}

		}


		return _html5Video;
	}
})();
