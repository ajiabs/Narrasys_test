/**
 * Created by githop on 12/3/15.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.factory('youTubePlayerManager', youTubePlayerManager);

	function youTubePlayerManager($q, appState, timelineSvc) {

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
			unMute: unmute,
			setVolume: setVolume
		};

		function _createInstance(divId, videoID, stateChangeCB, qualityChangeCB, onReadyCB) {

			return new YT.Player(divId, {
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

		function create(divId, videoId, stateCb, qualityChangeCB, onReadyCB) {

			_players[divId] = _createInstance(divId, videoId, onPlayerStateChange, qualityChangeCB, onReady);
			var currentPlayer = _players[videoId];
			return currentPlayer;

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
				var pid = target.m.id;

				if (pid !== 'main-player') {
					embed = pid;
				}

				var embedPlayerState = playerState(embed);
				var mainPlayerState = playerState(main);

				if (pid === main) {
					if (mainPlayerState === YT.PlayerState.PLAYING && angular.isDefined(embed)) {
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

		function _guid() {
			function s4() {
				return Math.floor((1 + Math.random()) * 0x10000)
					.toString(16)
					.substring(1);
			}
			return s4() + s4();
		}



		function setPlayerId(id, mainPlayer) {
			var dfd = $q.defer();
			var _id;
			if (mainPlayer) {
				_id = id;
				_mainPlayerId = _id;
				_players[_id] = {};
			} else {
				_id = _guid() + id;
				_players[_id] = {};
			}

			console.log('PLAYERS', _players);
			dfd.resolve(_id);
			return dfd.promise;
		}
        //
		//function setEmbedId(ytVideoId) {
		//	var dfd = $q.defer();
        //
		//	var id = _guid() + ytVideoId;
		//	_players[id] = {};
		//	dfd.resolve(id);
        //
		//	return dfd.promise;
		//}
        //
		//function setMainPlayerId(id) {
		//	var dfd = $q.defer();
        //
		//	_mainPlayerId = id;
		//	_players[id] = {};
		//	dfd.resolve(id);
        //
		//	return dfd.promise;
		//}

		return _youTubePlayerManager;

	}


})();
