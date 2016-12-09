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

	function youTubePlayerManager($location, YoutubePlayerApi, errorSvc, PLAYERSTATES, youtubeSvc) {

		var _youTubePlayerManager;
		var _players = {};
		var _mainPlayerId;
		var _stateChangeCallbacks = [];
		var _type = 'youtube';

		var _youtubeMetaObj = {
			instance: null,
			meta: {
				playerState: '-1',
				div: '',
				ready: false,
				startAtTime: 0,
				hasResumedFromStartAt: false,
				ytUrl: '',
				time: 0,
				hasBeenPlayed: false,
				bufferedPercent: 0,
				timeMultiplier: 1,
				videoType: _type
			}
		};

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
			unregisterStateChangeListener: unregisterStateChangeListener,
			getMetaProp: getMetaProp,
			setMetaProp: setMetaProp,
			resetPlayers: resetPlayers,
			resetMetaProps: resetMetaProps,
			getMetaObj: getMetaObj,
			freezeMetaProps: angular.noop,
			unFreezeMetaProps: angular.noop,
			setPlaybackQuality: setPlaybackQuality,
			reset: reset,
			destroy: destroy,
			stop: stop

		};

		//public methods
		function getPlayerDiv(id) {
			return _players[id].meta.div;
		}

		function registerStateChangeListener(cb) {
			_stateChangeCallbacks.push(cb);
		}

		function unregisterStateChangeListener(cb) {
			_stateChangeCallbacks = _stateChangeCallbacks.filter(function(fn) {
				return fn.toString() !== cb.toString();
			});
		}

		function getMetaProp(pid, prop) {
			if (_existy(_players[pid]) && _existy(_players[pid].meta)) {
				return _players[pid].meta[prop];
			}
		}

		function setMetaProp(pid, prop, val) {
			if (_existy(_players[pid] && _players[pid].meta)) {
				_players[pid].meta[prop] = val;
			}
		}

		/**
		 * @ngdoc method
		 * @name #seedPlayer
		 * @methodOf iTT.service:youTubePlayerManager
		 * @description
		 * Used to set the PID / divID for a YT instance, is called prior to create()
		 * @param {String} id Main Video Asset ID or Event ID (for embeds)
		 * @param {Boolean} mainPlayer Determines type of player, embed or main
		 * @param {Array} mediaSrcArr array of youtube URLs
		 * @returns {String} Div ID of YT instance.
		 */
		function seedPlayerManager(id, mainPlayer, mediaSrcArr) {

			//bail if we already have set the instance in the _players map.
			if (_players[id] && _players[id].meta.ready) {
				return;
			}

			if (mainPlayer) {
				_players = {};
				_mainPlayerId = id;
			}

			_players[id] = {
				instance: null,
				meta: {
					mainPlayer: mainPlayer,
					playerState: '',
					div: _getPlayerDiv(id),
					ready: false,
					startAtTime: 0,
					duration: 0,
					hasResumedFromStartAt: false,
					ytUrl: mediaSrcArr[0],
					time: 0,
					hasBeenPlayed: false,
					bufferedPercent: 0,
					timeMultiplier: 1,
					videoType: _type
				}
			};
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
			var ytId = youtubeSvc.extractYoutubeId(getMetaProp(playerId, 'ytUrl'));
			_createInstance(playerId, ytId, onPlayerStateChange, onPlayerQualityChange, onReady, onError)
				.then(handleSuccess)
				.catch(tryAgain);

			function handleSuccess(ytInstance) {
				_players[playerId].instance = ytInstance;
				setMetaProp(playerId, 'ready', false);
				setMetaProp(playerId, 'ytId', ytId);
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
				setMetaProp(pid, 'playerState', event.data);
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
				setMetaProp(pid, 'ready', true);
				var ytId = getMetaProp(pid, 'ytId');
				var startAt = getMetaProp(pid, 'startAtTime');

				var stateChangeEvent = _formatPlayerStateChangeEvent({data: -1}, pid);
				var lastState = PLAYERSTATES[getMetaProp(pid, 'playerState')];

				//this code helps enable the starAtTime feature
				//ideally, the video will seek to the offset startAtTime, and call 'play' once, so the user can see
				//the current frame of the video, as opposed to the youtube thumbnail that is displayed on unstarted videos

				//elsewhwere in the app, we are checking the URL for a 't' parameter, which is the offset start time
				//if we find this param, we need to seek the youtube video to this offset. We use cueVideoById and pass
				//the youtube video ID and the offset time.
				function firstPauseListener(event) {
					//the 'playing' event here should be emitted by calling playVideo immediately after the video is cued.
					if (event.state === 'playing') {
						unregisterStateChangeListener(firstPauseListener);
						pause(event.emitterId);
					}
				}

				if (startAt > 0) {
					if (lastState === 'playing') {
						//loadVideoById week seek to offset time at 'startAt' and resume playback
						event.target.loadVideoById(ytId, startAt);
					} else {
						registerStateChangeListener(firstPauseListener);
						//cueVideoById will seek to offset and emit a 'video cued' event
						// that the timelineSvc responds to by calling timelineSvc#updateEventStates()
						//which will ensure that we are in the proper scene that occurs at the offset time.
						event.target.cueVideoById(ytId, startAt);
						//will emit a 'playing' event, which our firstPauseListener is waiting for
						event.target.playVideo();
					}
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
			var instance = _players[pid].instance;

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


		function getMetaObj(pid) {
			if (_existy(_players[pid]) && _existy(_players[pid].meta)) {
				return _players[pid].meta;
			}
		}

		function resetPlayers() {
			_players = {};
		}

		function resetMetaProps(list, id) {
			if (_existy(_players[id])) {

				list.forEach(function(prop) {
					if (_players[id].meta.hasOwnProperty(prop)) {
						//reset to inital value on _metaObj
						setMetaProp(id, prop, _youtubeMetaObj.meta[prop]);
					}
				});
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
		 * the server if the t (seconds) parameter specifies a time outside of the currently
		 * buffered video data
		 * @returns {Void} no return value
		 */
		function seekTo(pid, t) {
			var p = _getYTInstance(pid);
			if (_existy(p)) {

				var currentState = p.getPlayerState();
				p.seekTo(t);

				if (currentState === YT.PlayerState.CUED || currentState === YT.PlayerState.UNSTARTED) {
					registerStateChangeListener(seekPauseListener);
				}
			}

			function seekPauseListener(event) {
				if (event.state === 'playing') {
					unregisterStateChangeListener(seekPauseListener);
					pause(event.emitterId);
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
					if (_existy(otherPlayerState)) {
						if (otherPlayerState === 'playing') {
							try {
								pause(playerId);
							} catch (e) {
								console.log('pauseOtherPlayers', e);
							}

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

		function _createInstance(divId, videoID, stateChangeCB, qualityChangeCB, onReadyCB, onError) {

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
			if (_players[pid] && _players[pid].meta.ready === true) {
				return _players[pid].instance;
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
			return ytInstance.getIframe().id;
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
