/**
 * Created by githop on 12/3/15.
 */

(function () {
	'use strict';
	/**
	 * @ngdoc service
	 * @name iTT.service:youTubePlayerManager
	 * @description
	 * A service for working with youtube iframes
	 * {@link https://github.com/InTheTelling/client/blob/master/app/scripts/services/YouTubePlayerManager.svc.js source}
	 * @requires $location
	 * @requires timelineSvc
	 * @requires YoutubePlayerApi
	 * @requires errorSvc
	 */
	angular.module('com.inthetelling.story')
		.factory('youTubePlayerManager', youTubePlayerManager);

	function youTubePlayerManager($location, YoutubePlayerApi, errorSvc, PLAYERSTATES, playbackState, youtubeSvc, ittUtils) {

		var _youTubePlayerManager;
		var _players = {};
		var _mainPlayerId;
		var _stateChangeCallbacks = [];
		var _type = 'youtube';

		_youTubePlayerManager = {
			type: _type,
			seedPlayerManager: seedPlayerManager,
			create: create,
			play: play,
			pause: pause,
			seekTo: seekTo,
			pauseOtherPlayers: pauseOtherPlayers,
			getCurrentTime: getCurrentTime,
			getPlayerState: playerState,
			getBufferedPercent: getVideoLoadedFraction,
			toggleMute: toggleMute,
			setVolume: setVolume,
			getPlayerDiv: getPlayerDiv,
			setSpeed: setSpeed,
			registerStateChangeListener: registerStateChangeListener,
			destroy: destroy,
			stop: stop,
			reset: reset,
			setPlaybackQuality: setPlaybackQuality
		};

		//public methods

		function getPlayerDiv(id) {
			return _players[id].div;
		}

		function registerStateChangeListener(cb) {
			_stateChangeCallbacks.push(cb);
		}

		/**
		 * @ngdoc method
		 * @name #seedPlayer
		 * @methodOf iTT.service:youTubePlayerManager
		 * @description
		 * Used to set the PID / divID for a YT instance, is called prior to create()
		 * @param {String} id Main Video Asset ID or Event ID (for embeds)
		 * @param {Boolean} mainPlayer Determines type of player, embed or main
		 * @returns {String} Div ID of YT instance.
		 */
		function seedPlayerManager(id, mainPlayer, mediaSrcArr) {
			if (mainPlayer) {
				_players = {};
				_mainPlayerId = id;
			}
			var uniqId = id + '+' + ittUtils.generateUUID().slice(0,4);
			_players[id] = { isMainPlayer: mainPlayer, ytUrl: mediaSrcArr[0], uniqId: uniqId };
			//id must be unique because we can use the same event in multiple places
			// _players[id].div = _getPlayerDiv(id + '+' +  ittUtils.generateUUID());
			_players[id].div = _getPlayerDiv(uniqId);

			console.log('set playerManager', _players);
		}

		/**
		 * @ngdoc method
		 * @name #create
		 * @methodOf iTT.service:youTubePlayerManager
		 * @description
		 * Used to create an instance of the YT object which is necessary to
		 * interface with the youtube Iframe API
		 * @returns {void} has no return value
		 */
		function create(playerId) {

			var ytId = youtubeSvc.extractYoutubeId(_players[playerId].ytUrl);
			_createInstance(playerId, _players[playerId].uniqId, ytId, onPlayerStateChange, onPlayerQualityChange, onReady, onError)
				.then(handleSuccess)
				.catch(tryAgain);

			function handleSuccess(ytInstance) {
				_players[playerId].yt = ytInstance;
				_players[playerId].ready = false;
				_players[playerId].ytId = ytId;
			}

			function tryAgain() {
				return _createInstance(playerId, ytId, onPlayerStateChange, onPlayerQualityChange, onReady, onError)
					.then(handleSuccess)
					.catch(lastTry);
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


			/**
			 * @private
			 * @ngdoc
			 * @name onPlayerStateChange
			 * @methodOf iTT.service:youTubePlayerManager
			 * @description
			 * Event handler responsible responsible for handling events emitted from a youtube player instance
			 * Responsible for interaction between our app and youtube iframes. Toggles playback
			 * between main and embedded videos
			 * @param {Object} event an object with target and data properties with metadata regarding the event and
			 * player that emitted it.
			 * @returns {Void} has no return value
			 */
			function onPlayerStateChange(event) {
				var pid = _getPidFromInstance(event.target);
				var stateChangeEvent = _formatPlayerStateChangeEvent(event, pid);
				_emitStateChange(stateChangeEvent);
			}
			/**
			 * @private
			 * @ngdoc
			 * @name onReady
			 * @methodOf iTT.service:youTubePlayerManager
			 * @description
			 * Event Handler called when YT instance is ready
			 * @param {Object} event an object with target and data properties with metadata regarding the event and
			 * player that emitted it.
			 * @returns {Void} has no return value
			 */
			function onReady(event) {
				var pid = _getPidFromInstance(event.target);
				console.log('hmm', _players[pid]);
				_players[pid].ready = true;
				var ytId = _players[pid].ytId;
				var startAt = playbackState.getStartAtTime(pid);
				var stateChangeEvent = _formatPlayerStateChangeEvent({data: -1}, pid);
				if (startAt > 0) {
					//will emit a 'video cued' event.
					event.target.cueVideoById(ytId, startAt);
				}
				_emitStateChange(stateChangeEvent);


			}

			/**
			 * @private
			 * @ngdoc
			 * @name onPlayerQualityChange
			 * @methodOf iTT.service:youTubePlayerManager
			 * @description
			 * Event Handler called when changing playback quality
			 * @param {Object} event an object with target and data properties with metadata regarding the event and
			 * player that emitted it.
			 * @returns {Void} has no return value
			 */
			function onPlayerQualityChange(event) {
				var pid = _getPidFromInstance(event.target);
				if (event.data === 'medium' && /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)) {
					setPlaybackQuality(pid, 'large');
				}

				// qualityChangeCB(event);

			}
			/**
			 * @private
			 * @ngdoc
			 * @name onError
			 * @methodOf iTT.service:youTubePlayerManager
			 * @description
			 * Error Handler for youtube iframe API errors
			 * @param {Object} event an object with target and data properties with metadata regarding the event and
			 * player that emitted it.
			 * @returns {Void} has no return value
			 */
			function onError(event) {
				var brokePlayerPID = _getPidFromInstance(event.target);
				if (event.data === 5) {
					//only reset for HTML5 player errors
					console.warn('resetting for chrome!!!');
					reset(brokePlayerPID);
				}
			}
		}

		function setSpeed(pid, playbackRate) {
			var p = _getYTInstance(pid);
			// getAvailablePlayBackRates returns an array of numbers, with at least 1 element; i.e. the default playback rate
			if (_existy(p) && p.getAvailablePlaybackRates().length > 1) {
				p.setPlaybackRate(playbackRate);
			}
		}

		/**
		 * @ngdoc method
		 * @name #getCurrentTime
		 * @methodOf iTT.service:youTubePlayerManager
		 * @description
		 * Used to get the current time of youtube video.
		 * @param {String} pid The ID of the YT instance
		 * @returns {Number} The current time of video in seconds.
		 */
		function getCurrentTime(pid) {
			var p = _getYTInstance(pid);
			if (_existy(p)) {
				return p.getCurrentTime();
			}
		}
		/**
		 * @ngdoc method
		 * @name #playerState
		 * @methodOf iTT.service:youTubePlayerManager
		 * @description
		 * Used to get the playerState of a YT instance. Possible states:
		 * -1 = unstarted
		 * 0 = ended,
		 * 1 = playing,
		 * 2 = paused,
		 * 3 = buffering,
		 * 5 = video cued
		 * @param {String} pid The ID of the YT instance
		 * @returns {Number} Int representing current player state.
		 */
		function playerState(pid) {
			var p = _getYTInstance(pid);
			if (_existy(p)) {
				return PLAYERSTATES[p.getPlayerState()];
			}
		}
		/**
		 * @ngdoc method
		 * @name #play
		 * @methodOf iTT.service:youTubePlayerManager
		 * @description
		 * Used to resume playback
		 * @param {String} pid The ID of the YT instance
		 * @returns {Void} no return value
		 */
		function play(pid) {
			var p = _getYTInstance(pid);
			if (_existy(p)) {

				return p.playVideo();
			}
		}
		/**
		 * @ngdoc method
		 * @name #pause
		 * @methodOf iTT.service:youTubePlayerManager
		 * @description
		 * Used to pause playback
		 * @param {String} pid The ID of the YT instance
		 * @returns {Void} no return value
		 */
		function pause(pid) {
			var p = _getYTInstance(pid);

			// console.log('pause instance?', p);
			if (_existy(p)) {
				return p.pauseVideo();
			}
		}
		/**
		 * @ngdoc method
		 * @name #stop
		 * @methodOf iTT.service:youTubePlayerManager
		 * @description
		 * Stops video playback and download of video stream
		 * @params pid The id of the player
		 * @returns {Void} no return value
		 */
		function stop(pid) {
			var p = _getYTInstance(pid);
			if (_existy(p)) {
				return p.stopVideo();
			}
		}
		/**
		 * @ngdoc method
		 * @name #reset
		 * @methodOf iTT.service:youTubePlayerManager
		 * @description
		 * Used to reset the player after detecting
		 * onError event.
		 * @params pid The id of the player
		 * @returns {Void} no return value
		 */
		function reset(pid) {

			var obj = _players[pid];
			var instance = _players[pid].yt;

			if (_existy(instance)) {
				console.log('debug info', instance.getDebugText());
				var videoId = instance.getVideoData().video_id;
				var lastTime = instance.getCurrentTime();

				if (obj.isMainPlayer) {
					instance.cueVideoById(videoId, lastTime);
				} else {
					instance.loadVideoById(videoId, lastTime);
				}
			}
		}
		/**
		 * @ngdoc method
		 * @name #setPlaybackQuality
		 * @methodOf iTT.service:youTubePlayerManager
		 * @description
		 * Used to pick a desired video quality
		 * @param {String} pid The ID of the YT instance
		 * @returns {Void} no return value
		 */
		function setPlaybackQuality(pid, size) {
			var p = _getYTInstance(pid);
			if (_existy(p)) {
				p.setPlaybackQuality(size);
			}
		}
		/**
		 * @ngdoc method
		 * @name #getVideoLoadedFraction
		 * @methodOf iTT.service:youTubePlayerManager
		 * @description
		 * Used to determine the percent of buffered video
		 * @param {String} pid The ID of the YT instance
		 * @returns {Number} Numerical value representing
		 * percent of video that is currently buffered
		 */
		function getVideoLoadedFraction(pid) {
			var p = _getYTInstance(pid);
			if (_existy(p)) {
				return p.getVideoLoadedFraction() * 100;
			}
		}
		/**
		 * @ngdoc method
		 * @name #seekTo
		 * @methodOf iTT.service:youTubePlayerManager
		 * @description
		 * Used to seek the video to a desired time in seconds
		 * @param {String} pid The ID of the YT instance
		 * @param {Number} t The desired time to seek to
		 * @param {Boolean} allowSeekAhead Determines whether the player will make a new request to
		 * the server if the t (seconds) parameter specifies a time outside of the currently
		 * buffered video data
		 * @returns {Void} no return value
		 */
		function seekTo(pid, t, allowSeekAhead) {
			var p = _getYTInstance(pid);
			if (_existy(p)) {
				//handle seek before video has been played
				if (p.getPlayerState() === YT.PlayerState.CUED) {
					p.cueVideoById(_players[pid].ytId, t);
				} else {
					p.seekTo(t, allowSeekAhead);
				}

			}
		}

		function toggleMute(pid) {
			var p = _getYTInstance(pid);
			if (p.isMuted()) {
				p.unMute();
			} else {
				p.mute();
			}
		}

		/**
		 * @ngdoc method
		 * @name #setVolume
		 * @methodOf iTT.service:youTubePlayerManager
		 * @description
		 * Setter for volume level
		 * @param {String} pid The ID of the YT instance
		 * @param {Number} v Number between 1 and 100
		 * @returns {Void} No return value.
		 */
		function setVolume(pid, v) {
			var p = _getYTInstance(pid);

			if (_existy(p)) {
				p.setVolume(v);
			}
		}
		/**
		 * @ngdoc method
		 * @name #pauseOtherPlayers
		 * @methodOf iTT.service:youTubePlayerManager
		 * @description
		 * Loops through all YT instances except main player and
		 * player with same PID as the id param and calls
		 * pause() on each one. In other words, will pause all
		 * embeds except the one you interacted with.
		 * @param {String} pid The ID of the YT instance
		 * @returns {Void} No return value.
		 */
		function pauseOtherPlayers(pid) {

			Object.keys(_players).forEach(function(playerId) {
				if (playerId !== pid) {

					var otherPlayerState = playerState(playerId);
					console.log('other player state', otherPlayerState);
					if (_existy(otherPlayerState)) {
						if (otherPlayerState === 'playing') {
							console.log('pause other players');
							pause(playerId);
						}
					}

				}
			});
		}
		/**
		 * @ngdoc method
		 * @name #destroy
		 * @methodOf iTT.service:youTubePlayerManager
		 * @description
		 * Used to destroy YT instances and clear them from the _players object
		 * @param {String} pid The ID of the YT instance
		 * @returns {Void} No return value.
		 */
		function destroy(pid) {
			var p = _getYTInstance(pid);
			if (_existy(p)) {
				p.destroy();
				delete _players[pid];
			}
		}

		//private methods

		function _createInstance(playerId, divId, videoID, stateChangeCB, qualityChangeCB, onReadyCB, onError) {

			var _controls = 1;
			if (playerId === _mainPlayerId) {
				_controls = 0;
			}

			var host = $location.host();
			return YoutubePlayerApi.load().then(function() {
				return new YT.Player(divId, {
					videoId: videoID,
					//enablejsapi=1&controls=0&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&wmode=transparent
					playerVars: {
						'controls': _controls,
						'fs': _controls,
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
						onPlaybackQualityChange: qualityChangeCB,
						onError: onError
					}
				});
			});
		}
		/**
		 * @private
		 * @ngdoc
		 * @name _getYTInstance
		 * @methodOf iTT.service:youTubePlayerManager
		 * @description
		 * Used to retrieve an instance of the YT player out of the _players object.
		 * @param {String} pid the ID of the instance to retrieve
		 * player that emitted it.
		 * @returns {Object} Youtube Player Instance Object.
		 */
		function _getYTInstance(pid) {
			if (_players[pid] && _players[pid].ready === true) {
				return _players[pid].yt;
			}
		}

		function _existy(x) {
			return x != null;  // jshint ignore:line
		}
		/**
		 * @private
		 * @ngdoc
		 * @name _getPidFromInstance
		 * @methodOf iTT.service:youTubePlayerManager
		 * @description
		 * Used to retrieve a PID from a YT Instance
		 * @params {Object} ytInstance
		 * @returns {String} PID of YT Instance
		 */
		function _getPidFromInstance(ytInstance) {
			var gotPid = ytInstance.getIframe().id.split('+')[0];
			console.log("got pid?", gotPid);
			return gotPid
		}

		/**
		 * @param event
		 * @param pid
		 * @return {{emitterId: string, state: string}}
		 * @private
		 */
		function _formatPlayerStateChangeEvent(event, pid) {
			return {
				emitterId: pid,
				state: PLAYERSTATES[event.data]
			};
		}

		function _emitStateChange(playerStateChange) {
			_stateChangeCallbacks.forEach(function(cb) {
				cb(playerStateChange);
			});
		}

		function _getPlayerDiv(id) {
			return '<div id="' + id + '"></div>';
		}

		return _youTubePlayerManager;

	}

})();
