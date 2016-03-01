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
			getPlayer: getPlayer,
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

		function create(divId, videoId, stateCb, qualityChangeCB, onReadyCB) {
			_createInstance(divId, videoId, onPlayerStateChange, onPlayerQualityChange, onReady)
				.then(handleSuccess)
				.catch(tryAgain)
				.catch(lastTry);

			function handleSuccess(ytInstance) {
				_players[divId] = ytInstance;
			}

			function tryAgain() {
				return _createInstance(divId, videoId, onPlayerStateChange, onPlayerQualityChange, onReady)
					.then(handleSuccess);
			}

			function lastTry(e) {
				console.log('too long!');
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
				var target = event.target;
				var pid = target.l.id;


				console.log('new pid', pid);
				console.log('onPlayerSTateChange ev',event);

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
				var target = event.target;
				var pid = target.l.id;

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
				var pid = event.target.l.id;
				if (event.data === 'medium' && /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)) {
					setPlaybackQuality(pid, 'large');
				}

				qualityChangeCB(event);

			}
		}

		function getPlayer(pid) {
			if (_players[pid] && _players[pid].ready === true) {
				return _players[pid];
			}
		}

		function getCurrentTime(pid) {
			var p = getPlayer(pid);
			if (p !== undefined) {
				return p.getCurrentTime();
			}
		}

		function playerState(pid) {
			var p = getPlayer(pid);
			if (p !== undefined) {
				return p.getPlayerState();
			}
		}

		function play(pid) {
			console.log('play!!', _players);
			var p = getPlayer(pid);
			if (p !== undefined) {
				console.log('playing!');
				return p.playVideo();
			}
		}

		function pause(pid) {
			var p = getPlayer(pid);
			if (p !== undefined) {
				return p.pauseVideo();
			}
		}

		function setPlaybackQuality(pid, size) {
			var p = getPlayer(pid);
			if (p !== undefined) {
				p.setPlaybackQuality(size);
			}
		}

		function getVideoLoadedFraction(pid) {
			var p = getPlayer(pid);
			if (p !== undefined) {
				return p.getVideoLoadedFraction();
			}
		}

		function seekTo(pid, t, bool) {
			var p = getPlayer(pid);
			if (p !== undefined) {
				p.seekTo(t, bool);
			}
		}

		function isMuted(pid) {
			var p = getPlayer(pid);

			if (p !== undefined) {
				return p.isMuted();
			}
		}

		function mute(pid) {
			var p = getPlayer(pid);

			if (p !== undefined) {
				return p.mute();
			}
		}

		function unMute(pid) {
			var p = getPlayer(pid);

			if (p !== undefined) {
				return p.unMute();
			}
		}

		function setVolume(pid, v) {
			var p = getPlayer(pid);

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
			var p = getPlayer(pid);
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
