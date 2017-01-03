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
	 * @requires YoutubePlayerApi
	 * @requires errorSvc
	 * @requires PLAYERSTATES
	 * @requires youtubeSvc
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
				mainPlayer: false,
				playerState: '-1',
				div: '',
				ready: false,
				startAtTime: 0,
				duration: 0,
				ytUrl: '',
				time: 0,
				hasResumedFromStartAt: false,
				hasBeenPlayed: false,
				hasEnded: false,
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
			resetMetaProps: resetMetaProps,
			getMetaObj: getMetaObj,
			freezeMetaProps: angular.noop,
			unFreezeMetaProps: angular.noop,
			setPlaybackQuality: setPlaybackQuality,
			reset: reset,
			destroyInstance: destroyInstance,
			resetPlayerManager: resetPlayerManager,
			stop: stop

		};

		//public methods
		/**
		 * @ngdoc method
		 * @name #getPlayerDiv
		 * @methodOf iTT.service:youTubePlayerManager
		 * @description
		 * returns an HTML string with the ID from the input param
		 * @param {String} id the ID of the player
		 * @return {String} the HTML string to be used by ittVideo
		 */
		function getPlayerDiv(id) {
			return _players[id].meta.div;
		}

		/**
		 * @ngdoc method
		 * @name #registerStateChangeListener
		 * @methodOf iTT.service:youTubePlayerManager
		 * @param {Function} cb callback to fire
		 * @returns {Void} returns void
		 */
		function registerStateChangeListener(cb) {
			var len = _stateChangeCallbacks.length;

			while (len--) {
				if (cb.toString() === _stateChangeCallbacks[len].toString()) {
					return;
				}
			}

			_stateChangeCallbacks.push(cb);
		}
		/**
		 * @ngdoc method
		 * @name #unregisterStateChangeListener
		 * @methodOf iTT.service:youTubePlayerManager
		 * @param {Function} cb callback to unregister
		 * @returns {Void} returns void.
		 */
		function unregisterStateChangeListener(cb) {
			_stateChangeCallbacks = _stateChangeCallbacks.filter(function(fn) {
				return fn.toString() !== cb.toString();
			});
		}
		/**
		 * @ngdoc method
		 * @name #getMetaObj
		 * @methodOf iTT.service:youTubePlayerManager
		 * @description
		 * returns the entire metaObj, currently used only for debugging.
		 * @param {String} pid the pid of the player
		 * @returns {Object} The requested objects Meta Props.
		 */
		function getMetaObj(pid) {
			if (_existy(_players[pid]) && _existy(_players[pid].meta)) {
				return _players[pid].meta;
			}
		}
		/**
		 * @ngdoc method
		 * @name #getMetaProp
		 * @methodOf iTT.service:youTubePlayerManager
		 * @description
		 * used to get a particular property of a players's meta obj
		 * @param {String} pid the pid of the player
		 * @param {String} prop the prop to get
		 * @returns {String | Number | Void} returns the requested prop if defined.
		 */
		function getMetaProp(pid, prop) {
			if (_existy(_players[pid]) && _existy(_players[pid].meta)) {
				return _players[pid].meta[prop];
			}
		}
		/**
		 * @ngdoc method
		 * @name #setMetaProp
		 * @methodOf iTT.service:youTubePlayerManager
		 * @description
		 * sets the particular prop of a player's meta obj
		 * @param {String} pid the pid of the player
		 * @param {String} prop the prop to set
		 * @param {String|Number|Boolean} val the val to set
		 * @returns {Void} returns void
		 */
		function setMetaProp(pid, prop, val) {
			if (_existy(_players[pid] && _players[pid].meta)) {
				_players[pid].meta[prop] = val;
			}
		}
		/**
		 * @ngdoc method
		 * @name #seedPlayerManager
		 * @methodOf iTT.service:youTubePlayerManager
		 * @description
		 * Used to set the PID / divID for a YT instance, is called prior to create()
		 * @param {String} id Main Video Asset ID or Event ID, for embeds
		 * @param {Boolean} mainPlayer Determines type of player, embed or main
		 * @param {Array} mediaSrcArr array of youtube URLs
		 * @returns {Void} returns void.
		 */
		function seedPlayerManager(id, mainPlayer, mediaSrcArr) {

			//bail if we already have set the instance in the _players map.
			if (_players[id] && getMetaProp(id, 'startAtTime') > 0) {
				return;
			}

			if (mainPlayer) {
				_players = {};
				_mainPlayerId = id;
			}

			var newProps = {
				mainPlayer: mainPlayer,
				div: _getPlayerDiv(id),
				ytUrl: mediaSrcArr[0]
			};

			_players[id] = _createMetaObj(newProps, _youtubeMetaObj);
		}


		/**
		 * @ngdoc method
		 * @name #create
		 * @methodOf iTT.service:youTubePlayerManager
		 * @param {String} playerId unique ID of player.
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
			 * @ngdoc method
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
				if (event.data === YT.PlayerState.ENDED) {
					console.log('END EVENT');
				}
				console.log('yt State', PLAYERSTATES[event.data]);
				_emitStateChange(stateChangeEvent);
			}
			/**
			 * @private
			 * @ngdoc method
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

				var playerReadyEv = _formatPlayerStateChangeEvent({data: '6'}, pid);
				_emitStateChange(playerReadyEv);
			}

			/**
			 * @private
			 * @ngdoc method
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
			 * @ngdoc method
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
		/**
		 * @ngdoc method
		 * @name #setSpeed
		 * @methodOf iTT.service:youTubePlayerManager
		 * @description
		 * used to speed up / slow down the rate of video playback.
		 * @param {String} pid pid of player
		 * @param {Number} playbackRate the rate to set playback to.
		 * @returns {Void} returns void.
		 */
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
				return _tryCommand(p, 'getCurrentTime');
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
				return PLAYERSTATES[_tryCommand(p, 'getPlayerState')];
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
				_tryCommand(p, 'playVideo');
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
				_tryCommand(p, 'pauseVideo');
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
				_tryCommand(p, 'stopVideo');
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
		 * Used to seek the video to a desired time in seconds. Note: On safari, if seekTo is called with a time where
		 * the video data is already available (i.e. we seek within our buffered range), the onStateChange event will
		 * not fire a 'buffering' event, or a 'playing' event after the seek has completed and the playback resumes.
		 *
		 * Since a seeking will stop our event clock from running, and a 'playing' event will not be fired when the seek
		 * operation is finished, we need to manually restart the event clock, which is done in the timelineSvc _tick
		 * function.
		 * @param {String} pid The ID of the YT instance
		 * @param {Number} t The desired time to seek to
		 * the server if the t (seconds) parameter specifies a time outside of the currently
		 * buffered video data
		 * @returns {Void} no return value
		 */
		function seekTo(pid, t) {
			var p = _getYTInstance(pid);
			var ytId = getMetaProp(pid, 'ytId');
			var lastState = PLAYERSTATES[getMetaProp(pid, 'playerState')];
			var currentState = playerState(pid);

			if (currentState === 'buffering') {
				return;
			}

			if (_existy(p)) {

				if (currentState === 'video cued') {
					switch(lastState) {
						case 'paused':
							p.cueVideoById(ytId, t);
							break;
						case 'video cued':

							if (pid === _mainPlayerId) {
								registerStateChangeListener(seekPauseListener);
								p.loadVideoById(ytId, t);
							} else {
								p.cueVideoById(ytId, t);
							}
							break;
						case 'playing':
							p.loadVideoById(ytId, t);
							break;
					}
				} else {
					_tryCommand(p, 'seekTo', t);
				}

			}

			function seekPauseListener(event) {
				var hasEnded = getMetaProp(event.emitterId, 'hasEnded');
				var hasResumed = getMetaProp(event.emitterId, 'hasResumedFromStartAt');

				if (event.state === 'playing') {
					unregisterStateChangeListener(seekPauseListener);
					if (hasEnded === true || hasResumed === true) {
						pause(event.emitterId);
						setMetaProp(event.emitterId, 'hasEnded', false);
					}

				}
			}
		}
		/**
		 * @ngdoc method
		 * @name #toggleMute
		 * @methodOf iTT.service:youTubePlayerManager
		 * @description
		 * toggles the mute on / off
		 * @param {String} pid the pid of the player
		 * @returns {Void} returns void.
		 */
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
							pause(playerId);
						}
					}

				}
			});
		}
		/**
		 * @ngdoc method
		 * @name #destroyInstance
		 * @methodOf iTT.service:youTubePlayerManager
		 * @description
		 * Used to destroy YT instances and clear them from the _players object
		 * @param {String} pid The ID of the YT instance
		 * @param {Boolean} [doRemove=false] optional param to optionally reset the instance in the _players map.
		 * @returns {Void} No return value.
		 */
		function destroyInstance(pid, doRemove) {
			if (!_existy(doRemove)) {
				doRemove = false;
			}
			var p = _getYTInstance(pid);
			if (_existy(p)) {

				_tryCommand(p, 'destroy');
				if (doRemove === true) {
					_players[pid] = {};
				}

			}
		}
		/**
		 * @ngdoc method
		 * @name #resetPlayerManager
		 * @methodOf iTT.service:youTubePlayerManager
		 * @description
		 * Will destroy all instances of YT on the _players map and reset it to an empty object.
		 * @returns {Void} No return value.
		 */
		function resetPlayerManager() {
			angular.forEach(_players, function(pm, id) {
				destroyInstance(id, true);
			});
			_players = {};
		}

		//private methods
		/**
		 * @private
		 * @ngdoc method
		 * @methodOf iTT.service:youTubePlayerManager
		 * @name _createInstance
		 * @param {string} divId the unique ID of the element on the DOM
		 * @param {string} videoID the youtube video ID
		 * @param {Function} stateChangeCB callback to register to youtube's 'onStateChange' playerVar
		 * @param {Function} qualityChangeCB callback to register to youtube's 'onQualityChange' playerVar
		 * @param {Function} onReadyCB callback to register to youtube's 'onReady' playerVar
		 * @param {Function} onError callback to register to youtube's 'onError' playerVar
		 * @returns {Object} instance of YT.Player
		 * @private
		 */
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
		 * @ngdoc method
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
		 * @ngdoc method
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
		 * @private
		 * @ngdoc method
		 * @name _formatPlayerStateChange
		 * @methodOf iTT.service:youTubePlayerManager
		 * @param {Object} event youtube's state change event object. has target and data props.
		 * @param {string} pid the PID of the player
		 * @returns {Object} Object with emiiterId and state props
		 * @private
		 */
		function _formatPlayerStateChangeEvent(event, pid) {
			return {
				emitterId: pid,
				state: PLAYERSTATES[event.data]
			};
		}

		/**
		 * @private
		 * @ngdoc method
		 * @name _emitStateChange
		 * @methodOf iTT.service:youTubePlayerManager
		 * @param {Function} playerStateChange callback to fire
		 *@returns {Void} returns void 0.
		 */
		function _emitStateChange(playerStateChange) {
			_stateChangeCallbacks.forEach(function(cb) {
				cb(playerStateChange);
			});
		}

		/**
		 * @private
		 * @ngdoc method
		 * @name _getPlayerDiv
		 * @methodOf iTT.service:youTubePlayerManager
		 * @param {string } id of the player
		 * @returns {string} HTML div with ID of player
		 */
		function _getPlayerDiv(id) {
			return '<div id="' + id + '"></div>';
		}
		/**
		 * @private
		 * @ngdoc method
		 * @name _tryCommand
		 * @methodOf iTT.service:youTubePlayerManager
		 * @param {Object} instance of YT.Player
		 * @param {String} command string representation of method to invoke
		 * @param {String | Number} val the val to set
		 * @returns {Void |String | Number} returns void, or the getter value.
		 */
		function _tryCommand(instance, command, val) {
			var returnVal;
			try {
				if (_existy(val)) {
					instance[command](val);
				} else {
					//some getters return a value, i.e. getPlayerState
					returnVal = instance[command]();
				}
			} catch (err) {
				console.warn('error trying', command, 'full error:', err);
			}

			if (_existy(returnVal)) {
				return returnVal;
			}
		}

		/**
		 * @private
		 * @ngdoc method
		 * @name _createMetaObj
		 * @methodOf iTT.service:youTubePlayerManager
		 * @param {Object} props array of objects (properties) to set on the copy of the meta object.
		 * @returns {Object} returns copy of new meta object
		 */
		function _createMetaObj(props, base) {
			var newMetaObj = angular.copy(base);
			newMetaObj.meta = angular.extend(newMetaObj.meta, props);
			return newMetaObj;
		}

		return _youTubePlayerManager;

	}

})();
