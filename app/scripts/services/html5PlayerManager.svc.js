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


	function html5PlayerManager($interval, PLAYERSTATES, playbackState) {
		var _players = {};
		var _mainPlayerId;
		var _checkInterval = 50.0;
		var _stateChangeCallbacks = [];
		var _type = 'html5';

		return {
			type: _type,
			setPlayerId: setPlayerId,
			create: create,
			play: play,
			pause: pause,
			getCurrentTime: getCurrentTime,
			getPlayerState: getPlayerState,
			seekTo: seek,
			pauseOtherEmbeds: pauseOtherEmbeds,
			pauseOtherPlayers: pauseOtherPlayers,
			getBufferedPercent: getBufferedPercent,
			isReady: isReady,
			registerStateChangeListener: registerStateChangeListener
		};

		function registerStateChangeListener(cb) {
			_stateChangeCallbacks.push(cb);
		}

		function setPlayerId(id, mainPlayer, mediaSrcArr) {
			if (mainPlayer) {
				_players = {};
				_mainPlayerId = id;
				_players[id] = { isMainPlayer: true };
			} else {
				_players[id] = { isMainPlayer: false };
			}

			return _getPlayerDiv(id, mediaSrcArr);
		}

		function create(divID) {
			var plr = document.getElementById(divID);
			plr.onpause = onPause;
			plr.onplaying = onPlaying;
			plr.onwaiting = onBuffering;
			// plr.onstalled = onBuffering;
			// plr.onended = onEnded;
			plr.meta = {
				playerState: -1,
				currentPlayPos: 0,
				lastPlayPos: 0
			};
			_players[divID] = plr;

			plr.onStateChange = _onStateChange;

			// var checkBuffering = _checkBuffering(plr);

			// var interval = $interval(checkBuffering, _checkInterval);

			plr.controls = true;
			if (_mainPlayerId === divID) {
				_mainPlayerId = divID;
				plr.controls = false;
			}

			return plr;
		}

		/*
		 HTML5 media event handlers
		 */

		function onPlaying() {
			var instance = _getInstance(this.id);
			instance.meta.playerState = 1;
			_emitStateChange(instance);
		}

		function onPause() {
			var instance = _getInstance(this.id);
			instance.meta.playerState = 2;
			_emitStateChange(instance);
		}

		function onBuffering() {
			var instance = _getInstance(this.id);
			instance.meta.playerState = 3;
			_emitStateChange(instance);
		}

        function isReady() {
			var instance = _getInstance(this.id);
			return (instance.readyState > 1);
		}

		/*
		 Playback exported methods
		 */

		function play(pid) {
			var instance = _getInstance(pid);
			instance.play();
		}

		function pause(pid) {
			var instance = _getInstance(pid);
			instance.pause();
		}

		function getCurrentTime(pid) {
			var instance = _getInstance(pid);
			if (instance !== undefined) {
				return instance.currentTime;
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
			instance.currentTime = t;
		}

		function pauseOtherEmbeds(id) {
			for (var p in _players) {
				if (p !== id) {
					pause(p);
				}
			}
		}
		/**
		 * @ngdoc method
		 * @name #pauseOtherPlayers
		 * @param {String} pid the current player
		 * @description
		 * loop over all players and pause them if they are not the current player
		 */
		function pauseOtherPlayers(pid) {
			Object.keys(_players).forEach(function(playerId) {
				if (playerId !== pid) {
					pause(playerId);
				}
			});
		}

		function getBufferedPercent(pid) {
			var instance = _getInstance(pid);
			if (instance && instance.meta && instance.meta.playerState !== -1) {
				if (instance.buffered.length > 0) {
					var bufLen = instance.buffered.length;
					var bufStart = instance.buffered.start(bufLen -1);
					var bufEnd   = instance.buffered.end(bufLen -1);

					if (bufEnd < 0) {
						bufEnd = bufEnd - bufStart;
						bufStart = 0;
					}
					return bufEnd / playbackState.getDuration() * 100;
				}
			}

		}

		/*
		 private methods
		 */

		function _getPlayerDiv(id, mediaSrcArr) {
			var videoObj = _getHtml5VideoObject(mediaSrcArr);
			var videoElement = '<video id="' + id  +'">';
			var classAttr, srcAttr, typeAttr;
			Object.keys(videoObj).forEach(function(fileType) {
				classAttr = fileType;
				srcAttr = videoObj[fileType][0];

				if (srcAttr == null) {
					return;
				}

				if (fileType === 'm3u8') {
					typeAttr = 'application/x-mpegURL';
				} else {
					typeAttr = 'video/' + fileType;
				}

				videoElement += '<source class="' + classAttr + '" src="' + srcAttr + '" type="' + typeAttr + '"/>';
			});

			videoElement += '<p>Oh no! Your browser does not support the HTML5 Video element.</p>';
			videoElement += '</video>';
			return videoElement;
		}

		function _formatPlayerStateChangeEvent(event, pid) {
			return {
				emitterId: pid,
				state: PLAYERSTATES[event]
			};
		}

		function _emitStateChange(instance) {
			instance.onStateChange(_formatPlayerStateChangeEvent(instance.meta.playerState, instance.id));
		}

		function _onStateChange(event) {
			angular.forEach(_stateChangeCallbacks, function(cb) {
				cb(event);
			});
		}

		function _getInstance(pid) {
			if (_players[pid]) {
				return _players[pid];
			}
		}

		function _getHtml5VideoObject(mediaSrcArr) {
			var extensionMatch = /(mp4|m3u8|webm)/;

			return mediaSrcArr.reduce(function(videoObject, mediaSrc) {
				var fileTypeKey = mediaSrc.match(extensionMatch)[1];
				videoObject[fileTypeKey].push(mediaSrc);
				return videoObject;
			}, {mp4: [], webm: [], m3u8: []});
		}

		//seems not to work very well.
		function _checkBuffering(player) {
			console.log('closure wired up');
			return function() {
				player.meta.currentPlayPos = player.currentTime;
				var offset = 1 / _checkInterval;

				if (!player.meta.playerState === 3 &&
					player.meta.currentPlayPos < (player.meta.lastPlayPos + offset) &&
					!player.paused) {
					console.log('buffering detected!');
					player.meta.playerState = 3;
					_emitStateChange(player);
				}
				// if (player.meta.playerState === 3 &&
				// 	player.meta.currentPlayPos > (player.meta.lastPlayPos + offset) &&
				// 	!player.paused) {
				// 	console.log('no longer buffering');
				// }
				player.meta.lastPlayPos = player.meta.currentPlayPos;
			}
		}
	}
})();
