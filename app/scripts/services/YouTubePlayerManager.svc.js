/**
 * Created by githop on 12/3/15.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.factory('youTubePlayerManager', youTubePlayerManager);

	function youTubePlayerManager(youtubeSvc, appState, timelineSvc) {

		var _youTubePlayerManager;
		var _players = {};

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
			getVideoLoadedFraction: getVideoLoadedFraction,
			seekTo: seekTo,
			getCurrentTime: getCurrentTime,
			isMuted: isMuted,
			mute: mute,
			unMute: unmute,
			setVolume: setVolume
		};

		function _createPlayer(elmId, sourceURL, stateChangeCB, qualityChangeCB, onReadyCB) {

			var videoID = youtubeSvc.extractYoutubeId(sourceURL);

			return new YT.Player(elmId, {
				videoId: videoID,

				//enablejsapi=1&controls=0&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&wmode=transparent
				playerVars: {
					'controls': 0,
					'enablejsonapi': 1,
					'modestbranding': 1,
					'showinfo': 0,
					'rel': 0,
					'iv_load_policy': 3
				},
				events: {
					onReady: onReadyCB,
					onStateChange: stateChangeCB,
					onPlaybackQualityChange: qualityChangeCB
				}
			});
		}

		function create(playerId, sourceURL, stateCb, qualityChangeCB, onReadyCB) {

			_players[playerId] = _createPlayer(playerId, sourceURL, onPlayerStateChange, qualityChangeCB, onReady);
			var currentPlayer = _players[playerId];
			return currentPlayer;

			//available 'states'
			//YT.PlayerState.ENDED
			//YT.PlayerState.PLAYING
			//YT.PlayerState.PAUSED
			//YT.PlayerState.BUFFERING
			//YT.PlayerState.CUED

			function onPlayerStateChange(event) {
				var main = 'main-player';
				var embed;
				var state = event.data;
				var target = event.target;
				var pid = target.m.id;

				if (pid !== 'main-player') {
					embed = pid;
				}

				var embedPlayerState = playerState(embed);
				var mainPlayerState = playerState(main);

				if (pid === main) {
					if (mainPlayerState === YT.PlayerState.PLAYING) {
						pauseOtherEmbeds(embed);
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
				var pid = target.m.id;

				if (pid === 'main-player') {
					appState.mainYTPlayerReady = true;
				}

				if (pid !== 'main-player') {
					appState.embedYTPlayerReady = true;
					appState.embedYTPlayerAvailable = true;
				}

				onReadyCB(event);
			}

		}

		function getPlayer(pid) {
			if (_players[pid]) {
				return _players[pid];
			}
		}

		function getCurrentTime(pid) {
			var p = getPlayer(pid);
			if ( p !== undefined ) {
				return p.getCurrentTime();
			}
		}

		function playerState(pid) {
			var p = getPlayer(pid);
			if ( p !== undefined ) {
				return p.getPlayerState();
			}
		}

		function play(pid) {
			var p = getPlayer(pid);
			if ( p !== undefined ) {
				return p.playVideo();
			}
		}

		function pause(pid) {
			var p = getPlayer(pid);
			if ( p !== undefined ) {
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

		function unmute(pid) {
			var p = getPlayer(pid);

			if (p !== undefined) {
				return p.unmute();
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
				if (p !== 'main-player') {
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
				if (p !== 'main-player' && p !== id) {
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
			}

			if (pid !== 'main-player') {
				appState.embedYTPlayerAvailable = false;
			}
		}

		return _youTubePlayerManager;

	}


})();
