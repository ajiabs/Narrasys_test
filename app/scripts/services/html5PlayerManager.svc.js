/**
 * Created by githop on 1/18/16.
 */

(function() {
	'use strict';
	/*jshint validthis: true */

	/**
	 * @ngdoc service
	 * @name iTT.service:html5PlayerManager
	 * @description
	 * Implements the PlayerManager interface, wraps HTML5 videos
	 * @property {String} type the type of playerManager
	 * @requires $interval
	 * @requires PLAYERSTATES
	 * @requires ittUtils
	 */
	angular.module('com.inthetelling.story')
		.factory('html5PlayerManager', html5PlayerManager);

	// var readyStates = {
	// 	0: 'HAVE_NOTHING',
	// 	1: 'HAVE_METADATA',
	// 	2: 'HAVE_CURRENT_DATA',
	// 	3: 'HAVE_FUTURE_DATA',
	// 	4: 'HAVE_ENOUGH_DATA'
	// }

	function html5PlayerManager($interval, PLAYERSTATES, ittUtils) {
		var _players = {};
		var _mainPlayerId;
		// var _checkInterval = 50.0;
		var _stateChangeCallbacks = [];
		var _type = 'html5';
		var _existy = ittUtils.existy;

		var _html5MetaObj = {
			instance: null,
			meta: {
				mainPlayer: false,
				playerState: '-1',
				videoObj: {},
				div: '',
				ready: false,
				startAtTime: 0,
				hasResumedFromStartAt: false,
				duration: 0,
				time: 0,
				hasBeenPlayed: false,
				bufferedPercent: 0,
				timeMultiplier: 1,
				videoType: _type
			}
		};

		var _validMetaKeys = Object.keys(_html5MetaObj.meta);

		return {
			type: _type,
			seedPlayerManager: seedPlayerManager,
			create: create,
			play: play,
			pause: pause,
			seekTo: seek,
			pauseOtherPlayers: pauseOtherPlayers,
			getCurrentTime: getCurrentTime,
			getPlayerState: getPlayerState,
			getBufferedPercent: getBufferedPercent,
			toggleMute: toggleMute,
			setVolume: setVolume,
			getPlayerDiv: getPlayerDiv,
			setSpeed: setSpeed,
			registerStateChangeListener: registerStateChangeListener,
			unregisterStateChangeListener: unregisterStateChangeListener,
			getMetaProp: getMetaProp,
			setMetaProp: setMetaProp,
			freezeMetaProps: freezeMetaProps,
			unFreezeMetaProps: unFreezeMetaProps,
			resetMetaProps: resetMetaProps,
			getMetaObj: getMetaObj,
			resetPlayerManager: resetPlayerManager,
			stop: angular.noop
		};

		//public methods

		/**
		 * @ngdoc method
		 * @name #create
		 * @methodOf iTT.service:html5PlayerManager
		 * @param {string} divID unique ID of video tag
		 * @returns {Void} no return value
		 */
		function create(divID) {

			if (Object.isFrozen(_players[divID].meta)) {
				unFreezeMetaProps(divID);
			}

			var plr = document.getElementById(divID);
			_attachEventListeners(plr);

			plr.onStateChange = _onStateChange;
			plr.controls = true;

			if (_mainPlayerId === divID) {
				_mainPlayerId = divID;
				plr.controls = false;
			}

			plr.load();
			_players[divID].instance = plr;


			// temp to test out video source change.
			// $timeout(function() {
			// 	console.info('BEGIN QUALITY CHANGE!');
			// 	_changeVideoQuality(divID, 1);
			// 	_players[divID].meta.playerState = 2;
			// 	_emitStateChange(plr);
			// }, 8 * 1000);

			// var checkBuffering = _checkBuffering(plr);

			// var interval = $interval(checkBuffering, _checkInterval);
		}
		/**
		 * @ngdoc method
		 * @name #registerStateChangeListener
		 * @methodOf iTT.service:html5PlayerManager
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
		 * @methodOf iTT.service:html5PlayerManager
		 * @param {Function} cb callback to unregister
		 */
		function unregisterStateChangeListener(cb) {
			_stateChangeCallbacks = _stateChangeCallbacks.filter(function(fn) {
				return fn.toString() !== cb.toString();
			});
		}
		/**
		 * @ngdoc method
		 * @name #getPlayerDiv
		 * @methodOf iTT.service:html5PlayerManager
		 * @description
		 * returns an HTML string with the ID from the input param
		 * @param {String} id the pid of the player
		 * @returns {String} the HTML string to be used by ittVideo
		 */
		function getPlayerDiv(id) {
			return getMetaProp(id, 'div');
		}

		/**
		 * @ngdoc method
		 * @name #freezeMetaProps
		 * @methodOf iTT.service:html5PlayerManager
		 * @description Freezes the player's meta data object
		 * @param {String} pid the pid of the player to freeze.
		 * @returns {Void} returns void
		 */
		function freezeMetaProps(pid) {
			Object.freeze(_players[pid].meta);
		}

		/**
		 * @ngdoc method
		 * @name #unFreezeMetaProps
		 * @methodOf iTT.service:html5PlayerManager
		 * @description
		 * Unfreeze metaObj by copying (shallow) all of the props into a new object.
		 * @param {String} pid the pid of the player to unfreeze
		 * @returns {Void} returns void.
		 */
		function unFreezeMetaProps(pid) {
			var newMeta, prop, frozenMeta;
			frozenMeta = _players[pid].meta;
			newMeta = {};

			for (prop in frozenMeta) {
				if (frozenMeta.hasOwnProperty(prop)) {
					newMeta[prop] = frozenMeta[prop];
				}
			}

			_players[pid].meta = newMeta;
		}

		/**
		 * @ngdoc method
		 * @name #getMetaObj
		 * @methodOf iTT.service:html5PlayerManager
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
		 * @methodOf iTT.service:html5PlayerManager
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
		 * @methodOf iTT.service:html5PlayerManager
		 * @description
		 * sets the particular prop of a player's meta obj
		 * @param {String} pid the pid of the player
		 * @param {String} prop the prop to set
		 * @param {String|Number|Boolean} val the val to set the prop with.
		 * @returns {Void} returns void
		 */
		function setMetaProp(pid, prop, val) {
			if (_validMetaKeys.indexOf(prop) === -1) {
				throw new Error(prop + ' is not a valid prop for HTML5 meta info');
			}

			if (_existy(_players[pid] && _players[pid].meta)) {
				try {
					_players[pid].meta[prop] = val;
				} catch (e) {
					console.log('catch read only error:', e, 'prop', prop, 'val', val);
				}

			}
		}
		/**
		 * @ngdoc method
		 * @name #seedPlayerManager
		 * @methodOf iTT.service:html5PlayerManager
		 * @description
		 * Used to set the PID / divID for a html5 video element, is called prior to create()
		 * @param {String} id Main Video Asset ID or Event ID (for embeds)
		 * @param {Boolean} mainPlayer Determines type of player, embed or main
		 * @param {Array} mediaSrcArr array of youtube URLs
		 * @returns {Void} returns void.
		 */
		function seedPlayerManager(id, mainPlayer, mediaSrcArr) {

			//bail if we were frozen prior to attempting to re-init player.
			if (_players[id] && getMetaProp(id, 'startAtTime') > 0) {
				console.log('player state html5 pm', getPlayerState(id));
				return;
			}

			if (mainPlayer) {
				_players = {};
				_mainPlayerId = id;
			}

			var plrInfo = _initPlayerDiv(id, mediaSrcArr, 0);
			//store relevant info the particular player in the 'meta' obj.
			var newProps = {
					mainPlayer: mainPlayer,
					videoObj: plrInfo.videoObj,
					div: plrInfo.videoElm
			};

			_players[id] = _createMetaObj(newProps, _html5MetaObj);
		}

		/*
		 HTML5 media event handlers
		 */

		/**
		 * @ngdoc method
		 * @name onEnded
		 * @methodOf iTT.service:html5PlayerManager
		 * @description
		 * HTML5 media event handler bound to HTML5 video element,
		 * used to handle appropriate side effects and pipe events up stream
		 * @private
		 * @returns {Void} Returns void but will emit a 'ended' event as side-effect
		 */
		function onEnded() {
			var instance = _getInstance(this.id);
			setMetaProp(this.id, 'playerState', 0);
			_emitStateChange(instance);
		}
		/**
		 * @ngdoc method
		 * @name onCanPlay
		 * @methodOf iTT.service:html5PlayerManager
		 * @description
		 * Used to determine when the video can be played for the first time
		 * @private
		 * @returns {Void} Returns void but will emit a 'player ready' evetn as side-effect.
		 */
		function onCanPlay() {
			var instance = _getInstance(this.id);
			if (getMetaProp(this.id, 'ready') === false) {
				_emitStateChange(instance, 6);
			}
		}

		/**
		 * @ngdoc method
		 * @private
		 * @name onPlaying
		 * @methodOf iTT.service:html5PlayerManager
		 * @description
		 * Event handler that responds to a 'playing' HTML5 media event.
		 * @returns {Void} returns void but will emit a 'playing' event.
		 */
		function onPlaying() {
			var instance = _getInstance(this.id);
			setMetaProp(this.id, 'playerState', 1);
			_emitStateChange(instance);
		}

		/**
		 * @ngdoc method
		 * @private
		 * @name onPause
		 * @methodOf iTT.service:html5PlayerManager
		 * @description
		 * Event handler for 'pause' event.
		 * @returns {Void} returns void but will emit a 'paused' event
		 */
		function onPause() {
			var instance = _getInstance(this.id);
			setMetaProp(this.id, 'playerState', 2);
			console.trace('onPause wtf');
			_emitStateChange(instance);
		}

		/**
		 * @ngdoc method
		 * @name onBuffering
		 * @methodOf iTT.service:html5PlayerManager
		 * @description
		 * Event handler for 'buffering' event, note that HTML5 media api does not have a 'buffering' event, this is
		 * bound to the 'onWaiting' event.
		 * @returns {Void} returns void but will emit a 'buffering' event.
		 */
		function onBuffering() {
			var instance = _getInstance(this.id);
			setMetaProp(this.id, 'playerState', 3);
			_emitStateChange(instance);
		}

		/*
		 Playback exported methods
		 */

		/**
		 * @ngdoc method
		 * @name #play
		 * @methodOf iTT.service:html5PlayerManager
		 * @description
		 * Will play the video.
		 * @param {String} pid the PID of the video to play
		 * @returns {Void} returns void.
		 */
		function play(pid) {
			var instance = _getInstance(pid);
			var timestamp = getMetaProp(pid, 'time');
			var playerRendered = getMetaProp(pid, 'ready');
			var waitUntilReady = $interval(function() {
				var delay;
				//make sure the player is in a state to accept commands
				if (_existy(instance) && instance.readyState === 4 && playerRendered === true) {
					delay = getMetaProp(pid, 'time');
					//check for a drift then seek to original time to fix.
					//only for main player, otherwise embed players will attempt
					//to resume playback according to the timeline time.
					if (pid === _mainPlayerId && timestamp <= delay) {
						instance.currentTime = timestamp;
					}
					instance.play();
					$interval.cancel(waitUntilReady);
				}
			}, 10);
		}
		/**
		 * @ngdoc method
		 * @name #pause
		 * @methodOf iTT.service:html5PlayerManager
		 * @description
		 * used to pause the player
		 * @param {String} pid the pid of the player
		 * @returns {Void} returns void.
		 */
		function pause(pid) {
			var instance = _getInstance(pid);
			instance.pause();
		}
		/**
		 * @ngdoc method
		 * @name #getCurrentTime
		 * @methodOf iTT.service:html5PlayerManager
		 * @description
		 * reports the current time of video playback.
		 * @param {String} pid the pid of the player
		 * @returns {Number} the time of playback.
		 */
		function getCurrentTime(pid) {
			var instance = _getInstance(pid);
			if (instance !== undefined) {
				return instance.currentTime;
			}
		}
		/**
		 * @ngdoc method
		 * @name #getPlayerState
		 * @methodOf iTT.service:html5PlayerManager
		 * @description returns the current state of the player
		 * @param {String} pid the player to query for state
		 * @returns {String} the player state
		 */
		function getPlayerState(pid) {
			// var instance = _getInstance(pid);
			var player = _getPlayer(pid);

			if (_existy(player)) {
				return PLAYERSTATES[player.meta.playerState];
			}
		}
		/**
		 * @ngdoc method
		 * @name #seek
		 * @methodOf iTT.service:html5PlayerManager
		 * @description
		 * will seek the video to the input time
		 * @param {String} pid the player to seek
		 * @param {Number} t the time to seek to.
		 * @returns {Void} returns void.
		 */
		function seek(pid, t) {
			var instance = _getInstance(pid);
			instance.currentTime = t;
		}
		/**
		 * @ngdoc method
		 * @name #setSpeed
		 * @methodOf iTT.service:html5PlayerManager
		 * @description
		 * used to speed up / slow down the rate of video playback.
		 * @param {String} pid the pid of the player
		 * @param {Number} playbackRate the rate of playback to set
		 * @returns {Void} returns void.
		 */
		function setSpeed(pid, playbackRate) {
			var instance = _getInstance(pid);
			instance.playbackRate = playbackRate;
		}
		/**
		 * @ngdoc method
		 * @name #toggleMute
		 * @methodOf iTT.service:html5PlayerManager
		 * @description
		 * toggles the mute on / off
		 * @param {String} pid the pid of the player
		 * @returns {Void} returns void.
		 */
		function toggleMute(pid) {
			var instance = _getInstance(pid);
			instance.muted = !instance.muted;
		}
		/**
		 * @ngdoc method
		 * @name #setVolume
		 * @methodOf iTT.service:html5PlayerManager
		 * @description
		 * used to set the volume.
		 * @param {String} pid the pid of the player
		 * @param {Number} vol the value to set the volume to
		 * @returns {Void} returns void.
		 */
		function setVolume(pid, vol) {
			var instance = _getInstance(pid);
			instance.volume = (vol / 100);
		}
		/**
		 * @ngdoc method
		 * @name #pauseOtherPlayers
		 * @methodOf iTT.service:html5PlayerManager
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
					var otherPlayerState = getPlayerState(playerId);
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
		 * @name #getBufferedPercent
		 * @methodOf iTT.service:html5PlayerManager
		 * @description
		 * Used to determine the percent of buffered video
		 * @param {String} pid The ID of the YT instance
		 * @returns {Number} Numerical value representing
		 * percent of video that is currently buffered
		 */
		function getBufferedPercent(pid) {
			var instance = _getInstance(pid);
			if (instance && getMetaProp(pid, 'playerState') !== -1) {
				if (instance.buffered.length > 0) {
					var bufLen = instance.buffered.length;
					var bufStart = instance.buffered.start(bufLen -1);
					var bufEnd   = instance.buffered.end(bufLen -1);

					if (bufEnd < 0) {
						bufEnd = bufEnd - bufStart;
						bufStart = 0;
					}
					return bufEnd / getMetaProp(pid, 'duration') * 100;
				}
			}

		}
		/**
		 * @ngdoc method
		 * @name #destroyInstance
		 * @methodOf iTT.service:html5PlayerManager
		 * @description
		 * Removes all event listeners attached to the video element and optionally sets the entry in the _players map
		 * to an empty object.
		 * @param {String} pid The ID of the html5 video
		 * @param {Boolean} [doRemove=false] optional param to optionally reset the instance in the _players map.
		 * @returns {Void} No return value.
		 */
		function destroyInstance(pid, doRemove) {
			if (!_existy(doRemove)) {
				doRemove = false;
			}
			_removeEventListeners(pid);
			if (doRemove === true) {
				_players[pid] = {};
			}
		}
		/**
		 * @ngdoc method
		 * @name #resetPlayerManager
		 * @methodOf iTT.service:html5PlayerManager
		 * @description
		 * Will clean up all video elements in the _players map and reset it to an empty object.
		 * @returns {Void} No return value.
		 */
		function resetPlayerManager() {
			angular.forEach(_players, function (pm, id) {
				destroyInstance(id, true);
			});
			_players = {};
		}

		function resetMetaProps(list, id) {
			if (_existy(_players[id])) {
				list.forEach(function(prop) {
					if (_players[id].meta.hasOwnProperty(prop)) {
						//reset to inital value on _metaObj
						setMetaProp(id, prop, _html5MetaObj.meta[prop]);
					}
				});
			}
		}

		/*
		 private methods
		 */

		/**
		 * @private
		 * @ngdoc method
		 * @name _initPlayerDiv
		 * @methodOf iTT.service:html5PlayerManager
		 * @description
		 * Used to create a HTML video tag with the src tags mapped to the URLs in the input array.
		 * @param {String} id the unique id
		 * @param {Array} mediaSrcArr array of URLs that could contain .mp4, .webm or .m3u8 files
		 * @returns {Object} Object with videoObj and videoElm properties
		 */
		function _initPlayerDiv(id, mediaSrcArr) {
			var videoObj = _getHtml5VideoObject(mediaSrcArr);
			var videoElm = _drawPlayerDiv(id, videoObj, 0);
			return {videoObj: videoObj, videoElm: videoElm};
		}

		/**
		 * @ngdoc method
		 * @name _drawPlayerDiv
		 * @methodOf iTT.service:html5PlayerManager
		 * @description
		 * Helper method that abstracts the functionality of creating a HTML5 video tag
		 * @param {String} id unique id
		 * @param {Object} videoObj Object with array of source URLs by file type
		 * @param {Number} quality index to select the proper source out of the availble sources
		 * @returns {string} returns HTML5 video element
		 * @private
		 */
		function _drawPlayerDiv(id, videoObj, quality) {
			var videoElement = document.createElement('video');
			videoElement.id = id;

			Object.keys(videoObj).forEach(function(fileType) {
				var classAttr, srcAttr, typeAttr, srcElement;

				classAttr = fileType;

				if (classAttr === 'mp4') {
					classAttr = 'mpeg4';
				}

				srcAttr = videoObj[fileType][quality];

				if (!_existy(srcAttr)) {
					return;
				}

				if (fileType === 'm3u8') {
					typeAttr = 'application/x-mpegURL';
				} else {
					typeAttr = 'video/' + fileType;
				}

				srcElement = document.createElement('source');
				srcElement.setAttribute('type', typeAttr);
				srcElement.setAttribute('src', srcAttr);
				srcElement.setAttribute('class', classAttr);
				videoElement.appendChild(srcElement);
			});

			var fallback = document.createElement('p');
			fallback.innerText = 'Oh no! Your browser does not support the HTML5 Video element.';
			videoElement.appendChild(fallback);
			return videoElement.outerHTML;
		}

		/**
		 * @ngdoc method
		 * @name _formatPlayerStateChangeEvent
		 * @methodOf iTT.service:html5PlayerManager
		 * @description
		 * Helper method for creating an object that conforms to our message API between
		 * the timelineSvc, playbackService, and individual playerManagers
		 * @param {Number} event Interger that corresponds to a playerStateChange
		 * @param {String} pid Unique ID of player
		 * @returns {Object} Object with emitterID String and state String props
		 * @private
		 */
		function _formatPlayerStateChangeEvent(event, pid) {
			return {
				emitterId: pid,
				state: PLAYERSTATES[event]
			};
		}
		/**
		 * @ngdoc method
		 * @name _emitStateChange
		 * @methodOf iTT.service:html5PlayerManager
		 * @param {Object} instance HTML5 Video element
		 * @param {Boolean} [forceState] optional Boolean if you want to send a message without setting the playerState
		 * on the meta object.
		 * @private
		 */
		function _emitStateChange(instance, forceState) {
			var player = _getPlayer(instance.id);
			var state;

			//for emitting a state but not setting it on the player.
			if (forceState) {
				state = forceState;
			} else {
				state = player.meta.playerState;
			}

			instance.onStateChange(_formatPlayerStateChangeEvent(state, instance.id));
		}
		/**
		 * @ngdoc method
		 * @name _onStateChange
		 * @methodOf iTT.service:html5PlayerManager
		 * @description
		 * Method bound to each instance of _player[id] to invoke the stateChangeCallback for any listeners
		 * @param {Object} event the message to send
		 * @private
		 */
		function _onStateChange(event) {
			angular.forEach(_stateChangeCallbacks, function(cb) {
				cb(event);
			});
		}
		/**
		 * @ngdoc method
		 * @name _getPlayer
		 * @methodOf iTT.service:html5PlayerManager
		 * @description
		 * Helper method for getting a particular player out of the _players map
		 * @param {String} pid the unique ID
		 * @returns {Object} Returns _players object with instance and meta props
		 * @private
		 */
		function _getPlayer(pid) {
			if (_players[pid]) {
				return _players[pid];
			}
		}
		/**
		 * @ngdoc method
		 * @name _getInstance
		 * @methodOf iTT.service:html5PlayerManager
		 * @param {String} pid Unique ID
		 * @returns {Object} returns HTML5 video element
		 * @private
		 */
		function _getInstance(pid) {
			if (_existy(_players[pid]) && _existy(_players[pid].instance)) {
				return _players[pid].instance;
			}
		}
		/**
		 * @ngdoc method
		 * @name _getHtml5VideoObject
		 * @methodOf iTT.service:html5PlayerManager
		 * @description
		 * reduces an array of URLs into an Object used in other helper methods ultimately to format a
		 * string of HTML with the provided input URLS as source tags.
		 * @param {Array} mediaSrcArr array of URLS
		 * @returns {Object} Object with mp4, webm, and m3u8 props, array of strings
		 * @private
		 */
		function _getHtml5VideoObject(mediaSrcArr) {
			var extensionMatch = /(mp4|m3u8|webm)/;

			return mediaSrcArr.reduce(function(videoObject, mediaSrc) {
				var fileTypeKey = mediaSrc.match(extensionMatch)[1];
				videoObject[fileTypeKey].push(mediaSrc);
				return videoObject;
			}, {mp4: [], webm: [], m3u8: []});
		}

		/**
		 * @ngdoc method
		 * @name _attachEventListeners
		 * @methodOf iTT.service:html5PlayerManager
		 * @description
		 * helper method to abstract attaching of event listeners to the necessary events and wiring up the relevant
		 * function
		 * @param {Object} videoElement HTML5 video element
		 * @private
		 */
		function _attachEventListeners(videoElement) {
			videoElement.addEventListener('pause', onPause);
			videoElement.addEventListener('playing', onPlaying);
			videoElement.addEventListener('waiting', onBuffering);
			videoElement.addEventListener('canplay', onCanPlay);
			videoElement.addEventListener('ended', onEnded);
		}
		/**
		 * @ngdoc method
		 * @name _attachEventListeners
		 * @methodOf iTT.service:html5PlayerManager
		 * @description
		 * helper method to remove attached event listeners.
		 * function
		 * @param {String} pid id of element to remove listeners from.
		 * @private
		 */
		function _removeEventListeners(pid) {
			var videoElement;
			var instance = _getInstance(pid);
			if (_existy(instance)) {
				videoElement = _players[pid].instance;
				videoElement.removeEventListener('pause', onPause);
				videoElement.removeEventListener('playing', onPlaying);
				videoElement.removeEventListener('waiting', onBuffering);
				videoElement.removeEventListener('canplay', onCanPlay);
				videoElement.removeEventListener('ended', onEnded);
			}
		}

		/**
		 * @private
		 * @ngdoc method
		 * @name _createMetaObj
		 * @methodOf iTT.service:html5PlayerManager
		 * @param {Object} props array of objects (properties) to set on the copy of the meta object.
		 * @returns {Object} returns copy of new meta object
		 */
		function _createMetaObj(props, base) {
			var newMetaObj = angular.copy(base);
			newMetaObj.meta = angular.extend(newMetaObj.meta, props);
			return newMetaObj;
		}

		// function _changeVideoQuality(id, quality) {
		// 	var player = _getPlayer(id);
		// 	var videoObj = player.meta.videoObj;
		// 	var videoChildren = player.instance.childNodes;
        //
		// 	angular.forEach(videoChildren, function(elm) {
		// 		var fileType = '';
		// 		if (elm.nodeName === 'SOURCE') {
		// 			fileType = elm.className;
		// 			elm.setAttribute('src', videoObj[fileType][quality]);
		// 		}
		// 	});
        //
		// 	var wasPlaying = player.meta.playerState === 1;
        //
		// 	//load new element into DOM.
		// 	player.instance.load();
		// 	if (wasPlaying) {
		// 		play(id);
		// 	}
		// }

		//seems not to work very well.
		// function _checkBuffering(player) {
		// 	return function() {
		// 		player.meta.currentPlayPos = player.currentTime;
		// 		var offset = 1 / _checkInterval;
        //
		// 		if (player.meta.playerState !== 3 &&
		// 			player.meta.currentPlayPos < (player.meta.lastPlayPos + offset) &&
		// 			!player.paused) {
		// 			player.meta.playerState = 3;
		// 			_emitStateChange(player);
		// 		}
		// 		// if (player.meta.playerState === 3 &&
		// 		// 	player.meta.currentPlayPos > (player.meta.lastPlayPos + offset) &&
		// 		// 	!player.paused) {
		// 		// }
		// 		player.meta.lastPlayPos = player.meta.currentPlayPos;
		// 	}
		// }
	}
})();
