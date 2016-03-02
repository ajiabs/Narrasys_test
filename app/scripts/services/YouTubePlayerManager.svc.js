/**
 * Created by githop on 12/3/15.
 */

(function () {
	'use strict';

	angular.module('com.inthetelling.story')
		.factory('youTubePlayerManager', youTubePlayerManager);

	function youTubePlayerManager($q, $location, appState, timelineSvc, YoutubePlayerApi, errorSvc) {

		var _youTubePlayerManager;
		var _players = {};
		var _mainPlayerId;

		_youTubePlayerManager = {
			create: create,
			destroy: destroy,
			play: play,
			playerState: playerState,
			pause: pause,
			pauseEmbeds: pauseEmbeds,
			pauseOtherEmbeds: pauseOtherEmbeds,
			setPlaybackQuality: setPlaybackQuality,
			setPlayerId: setPlayerId,
			getVideoLoadedFraction: getVideoLoadedFraction,
			seekTo: seekTo,
			getCurrentTime: getCurrentTime,
			isMuted: isMuted,
			mute: mute,
			unMute: unMute,
			setVolume: setVolume
		};

		//private methods

		function _createInstance(divId, videoID, stateChangeCB, qualityChangeCB, onReadyCB) {

			var _controls = 1;
			if (divId === _mainPlayerId) {
				_controls = 0;
			}

			var host = $location.host();
			return YoutubePlayerApi.load().then(function() {
				return new YT.Player(divId, {
					videoId: videoID,
					//enablejsapi=1&controls=0&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&wmode=transparent
					playerVars: {
						'controls': _controls,
						'enablejsapi': 1,
						'modestbranding': 1,
						'showinfo': 0,
						'rel': 0,
						'iv_load_policy': 3,
						'origin': host,
						'wmode': 'transparent'
					},
					events: {
						onReady: onReadyCB,
						onStateChange: stateChangeCB,
						onPlaybackQualityChange: qualityChangeCB
					}
				});
			});
		}

		function _getYTInstance(pid) {
			if (_players[pid] && _players[pid].ready === true) {
				return _players[pid].yt;
			}
		}

		function _existy(x) {
			return x != null;  // jshint ignore:line
		}

		function _shallowEqual(x, y) {
			if (x === y) {
				return true;
			}

			if (!_existy(x) || typeof x != 'object' || !_existy(y) || typeof y != 'object') {
				return false;
			}

			var xKeys = Object.keys(x).length,
				yKeys = Object.keys(y).length;

			for (var k in x) {
				if (!(y.hasOwnProperty(k)) || x[k] !== y[k]) {
					return false;
				}
			}

			return xKeys == yKeys;
		}

		function _getPidFromInstance(ytInstance) {
			var _key;

			angular.forEach(_players, function(p, key) {
				//for some reason, angular.equals was not working in this context.
				//context: when embedding two identical youtube videos seemed to break
				if (_shallowEqual(p.yt, ytInstance)) {
					return _key = key;
				}
			});

			return _key;
		}

		//public methods

		function create(divId, videoId, stateCb, qualityChangeCB, onReadyCB) {
			_createInstance(divId, videoId, onPlayerStateChange, onPlayerQualityChange, onReady)
				.then(handleSuccess)
				.catch(tryAgain)
				.catch(lastTry);

			function handleSuccess(ytInstance) {
				_players[divId] = {yt: ytInstance, ready: false };

			}

			function tryAgain() {
				return _createInstance(divId, videoId, onPlayerStateChange, onPlayerQualityChange, onReady)
					.then(handleSuccess);
			}

			function lastTry(e) {
				var errorMsg = 'Network timeout initializing video player. Please try again.';
				errorSvc.error({data: errorMsg}, e);
			}

			//available 'states'
			//YT.PlayerState.ENDED
			//YT.PlayerState.PLAYING
			//YT.PlayerState.PAUSED
			//YT.PlayerState.BUFFERING
			//YT.PlayerState.CUED

			function onPlayerStateChange(event) {
				var main = _mainPlayerId;
				var embed;
				var state = event.data;
				var pid = _getPidFromInstance(event.target);

				console.log('all players', _players);

				if (pid !== _mainPlayerId) {
					embed = pid;
				}

				var embedPlayerState = playerState(embed);
				var mainPlayerState = playerState(main);

				if (pid === main) {
					if (mainPlayerState === YT.PlayerState.PLAYING) {
						pauseEmbeds();
					}
				}

				if (pid === embed) {
					if (appState.timelineState === 'playing') {
						timelineSvc.pause();
						pauseOtherEmbeds(embed);
					}

					if (embedPlayerState === YT.PlayerState.PLAYING) {
						pauseOtherEmbeds(embed);
					}
				}

				//html5 main video w youtube embed
				if (_players[embed] !== undefined &&
					_players[main] === undefined &&
					state !== YT.PlayerState.UNSTARTED) {
					if (appState.timelineState === 'playing' && appState.embedYTPlayerAvailable) {
						timelineSvc.pause();
					}
				}

				stateCb(event);

			}

			function onReady(event) {

				var pid = _getPidFromInstance(event.target);


				if (pid === _mainPlayerId) {
					appState.mainYTPlayerReady = true;
				}

				if (pid !== _mainPlayerId) {
					appState.embedYTPlayerReady = true;
					appState.embedYTPlayerAvailable = true;
				}

				_players[pid].ready = true;

				onReadyCB(event);
			}

			function onPlayerQualityChange(event) {
				var pid = _getPidFromInstance(event.target);
				if (event.data === 'medium' && /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)) {
					setPlaybackQuality(pid, 'large');
				}

				qualityChangeCB(event);

			}
		}

		function getCurrentTime(pid) {
			var p = _getYTInstance(pid);
			if (p !== undefined) {
				return p.getCurrentTime();
			}
		}

		function playerState(pid) {
			var p = _getYTInstance(pid);
			if (p !== undefined) {
				return p.getPlayerState();
			}
		}

		function play(pid) {
			var p = _getYTInstance(pid);
			if (p !== undefined) {
				return p.playVideo();
			}
		}

		function pause(pid) {
			var p = _getYTInstance(pid);
			if (p !== undefined) {
				return p.pauseVideo();
			}
		}

		function setPlaybackQuality(pid, size) {
			var p = _getYTInstance(pid);
			if (p !== undefined) {
				p.setPlaybackQuality(size);
			}
		}

		function getVideoLoadedFraction(pid) {
			var p = _getYTInstance(pid);
			if (p !== undefined) {
				return p.getVideoLoadedFraction();
			}
		}

		function seekTo(pid, t, bool) {
			var p = _getYTInstance(pid);
			if (p !== undefined) {
				p.seekTo(t, bool);
			}
		}

		function isMuted(pid) {
			var p = _getYTInstance(pid);

			if (p !== undefined) {
				return p.isMuted();
			}
		}

		function mute(pid) {
			var p = _getYTInstance(pid);

			if (p !== undefined) {
				return p.mute();
			}
		}

		function unMute(pid) {
			var p = _getYTInstance(pid);

			if (p !== undefined) {
				return p.unMute();
			}
		}

		function setVolume(pid, v) {
			var p = _getYTInstance(pid);

			if (p !== undefined) {
				p.setVolume(v);
			}
		}

		function pauseEmbeds() {
			for (var p in _players) {
				if (p !== _mainPlayerId) {
					var curPlayerState = playerState(p);
					if (curPlayerState !== YT.PlayerState.UNSTARTED &&
						curPlayerState !== YT.PlayerState.PAUSED &&
						curPlayerState !== YT.PlayerState.CUED) {
						pause(p);
					}
				}
			}
		}

		function pauseOtherEmbeds(id) {
			for (var p in _players) {
				if (p !== _mainPlayerId && p !== id) {
					var curPlayerState = playerState(p);
					if (curPlayerState !== YT.PlayerState.UNSTARTED &&
						curPlayerState !== YT.PlayerState.PAUSED &&
						curPlayerState !== YT.PlayerState.CUED) {
						pause(p);
					}
				}
			}
		}

		function destroy(pid) {
			var p = _getYTInstance(pid);
			if (p) {
				p.destroy();
				delete _players[pid];
			}
		}

		function _guid() {
			/* jshint ignore:start */
			var d = new Date().getTime();
			var uuid = 'xxxxxxxx'.replace(/[xy]/g, function (c) {
				var r = (d + Math.random() * 16) % 16 | 0;
				d = Math.floor(d / 16);
				return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
			});
			return uuid;
			/* jshint ignore:end */
		}

		function setPlayerId(id, mainPlayer) {
			var dfd = $q.defer();
			var _id;
			if (mainPlayer) {
				// clear out players obj in the case that we are main player
				// do not want stale players staying around.
				_players = {};
				_id = id;
				_mainPlayerId = _id;
				_players[_id] = {};
			} else {
				_id = _guid() + id;
				_players[_id] = {};

			}

			dfd.resolve(_id);
			return dfd.promise;
		}

		return _youTubePlayerManager;

	}

})();
