/**
 * Created by githop on 10/24/16.
 */

(function() {
	'use strict';
	/**
	 * @ngdoc service
	 * @name iTT.service:playbackService
	 * @description
	 * playbackService exports an interface for the timelineSvc and consumes the interfaces exported from
	 * the playerManagers. The exported methods of the playbackService are called by timelineSvc or ittVideo directive.
	 *
	 * Videos in the app (either the main video or embeds) are kept track of using the db record _id. See the _players
	 * object in the playerManagers for an example.
	 *
	 * Most of the exported playback methods (seek, play, pause...etc) accept an optional playerId param. If
	 * left blank the playerId will be set to the id of the episode.masterAsset, aka the main video. This case is used
	 * in mostly the timlineSvc, (as it syncs the main video with our episode events) and to query state of video
	 * playback in the UI.
	 * ```
	 *	//no input parameter, will command main video.
	 *  //sending a command
	 *  playbackService.playVideo()
	 *  //querying playback state
	 *  playbackService.getMetaprop('duration');
	 * ```
	 * @requires $interval
	 * @requires iTT.service:youTubePlayerManager
	 * @requires iTT.service:html5PlayerManager
	 * @requires iTT.service:ittUtils
	 * @requires iTT.service:urlService
	 * @requires PLAYERSTATES_WORD
	 * @requires PLAYERSTATES
	 */
	angular.module('com.inthetelling.story')
		.factory('playbackService', playbackService);

	function playbackService($interval, youTubePlayerManager, html5PlayerManager, ittUtils, urlService, PLAYERSTATES_WORD, PLAYERSTATES) {

		var _playerInterfaces = {};
		var _mainPlayerId;
		var _stateChangeCallbacks = [];
		var _playerManagers = [html5PlayerManager, youTubePlayerManager];
		var _timelineState = '';
		var _mainPlayerBufferingPoll;
		var _playbackServiceHasBeenReset;

		angular.forEach(_playerManagers, function(playerManager) {
			playerManager.registerStateChangeListener(_stateChangeCB);
		});

		return {
			seedPlayer: seedPlayer,
			createInstance: createInstance,
			play: play,
			pause: pause,
			seek: seek,
			getCurrentTime: getCurrentTime,
			getPlayerState: getPlayerState,
			toggleMute: toggleMute,
			setVolume: setVolume,
			getPlayerDiv: getPlayerDiv,
			setSpeed: setSpeed,
			registerStateChangeListener: registerStateChangeListener,
			unregisterStateChangeListener: unregisterStateChangeListener,
			getMetaProp: getMetaProp,
			setMetaProp: setMetaProp,
			getTimelineState: getTimelineState,
			setTimelineState: setTimelineState,
			freezeMetaProps: freezeMetaProps,
			unFreezeMetaProps: unFreezeMetaProps,
			getMetaObj: getMetaObj,
			pauseOtherPlayers: pauseOtherPlayers,
			handle$Destroy: handle$Destroy,
			resetPlaybackService: resetPlaybackService,
			stop: stop,
			allowPlayback: allowPlayback
		};
		/*
			PUBLIC METHODS
		 */

		/**
		 * @ngdoc method
		 * @name #seedPlayer
		 * @methodOf iTT.service:playbackService
		 * @description
		 * Called from ittVideo during initialization. Used to store and setup particular data relevant to creating
		 * an instance of playerManager.
		 * @param {String} id Main Video Asset ID or Event ID, for embeds
		 * @param {Boolean} mainPlayer Determines type of player, embed or main
		 * @param {Array} mediaSrcArr array of youtube URLs
		 * @returns {Void} returns void.
		 */
		function seedPlayer(mediaSrcArr, id, mainPlayer) {

			if (mainPlayer === true) {
				if (ittUtils.existy(_playerInterfaces[id])) {
					//bail if we have already set the main player.
					return;
				}
			}
			var parsedMedia = urlService.parseMediaSrcArr(mediaSrcArr);

			var pm = _getPlayerManagerFromMediaSrc(parsedMedia);
			_playerInterfaces[id] = pm;
			_playbackServiceHasBeenReset = false;
			if (mainPlayer) {
				_mainPlayerId = id;
				_pollBufferedPercent();
			}

			pm.seedPlayerManager(id, mainPlayer, parsedMedia[0].mediaSrcArr);
		}

		/**
		 * @ngdoc method
		 * @name #createInstance
		 * @methodOf iTT.service:playbackService
		 * @description
		 * Invokes the 'create' method on the playerManager with the input id, stores the entry in the
		 * _playerInterfaces map.
		 * @param {String} [playerId=mainPlayerId] Optional input param.
		 */
		function createInstance(playerId) {
			_playerInterfaces[playerId].create(playerId);
		}

		//called from timlineSvc -> playbackService -> playerManager
		/**
		 * @ngdoc method
		 * @name #play
		 * @methodOf iTT.service:playbackService
		 * @description
		 * Invokes the 'play' method on the playerManager with the passed input id.
		 * @param {String} [playerId=mainPlayerId] Optional input param.
		 */
		function play(playerId) {
			_playerInterfaces[_setPid(playerId)].play(_setPid(playerId));
		}
		/**
		 * @ngdoc method
		 * @name #pause
		 * @methodOf iTT.service:playbackService
		 * @description
		 * Invokes the 'pause' method on the playerManager with the passed input id.
		 * @param {String} [playerId=mainPlayerId] Optional input param.
		 */
		function pause(playerId) {
			_playerInterfaces[_setPid(playerId)].pause(_setPid(playerId));
		}
		/**
		 * @ngdoc method
		 * @name #seek
		 * @methodOf iTT.service:playbackService
		 * @description
		 * Invokes the 'seek' method on the playerManager with the passed input id.
		 * @param {Number} t time to seek playback to.
		 * @param {String} [playerId=mainPlayerId] Optional input param.
		 */
		function seek(t, playerId) {
			_playerInterfaces[_setPid(playerId)].seekTo(_setPid(playerId), t);
		}
		/**
		 * @ngdoc method
		 * @name #allowPlayback
		 * @methodOf iTT.service:playbackService
		 * @description
		 * static method used check playback state prior to toggling between play or pause
		 * @param {String} state state to check against.
		 */
		function allowPlayback(state) {
			return (state === 'paused' ||
					state === 'unstarted' ||
					state === 'video cued' ||
					state === 'ended' ||
					state === 'player ready');
		}

		/**
		 * @ngdoc method
		 * @name #pauseOtherPlayers
		 * @methodOf iTT.service:playbackService
		 * @description
		 * Invokes the 'pauseOtherPlayers' method on all playerManagers with the passed input id.
		 * @param {String} [playerId=mainPlayerId] Optional input param.
		 */
		function pauseOtherPlayers(playerId) {
			angular.forEach(_playerManagers, function(pm) {
				pm.pauseOtherPlayers(_setPid(playerId));
			});
		}

		/**
		 * @ngdoc method
		 * @name #registerStateChangeListener
		 * @methodOf iTT.service:playbackService
		 * @description
		 * Wires up a stateChangeListener to which events can be emitted from and responded to.
		 * @param {Function} cb the function to invoke when on a state change.
		 */
		function registerStateChangeListener(cb) {
			var len = _stateChangeCallbacks.length;

			//do not register the same listener twice
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
		 * @methodOf iTT.service:playbackService
		 * @description
		 * removes a stateChangeListener function from the array of listeners.
		 * @param {Function} cb the function to remove.
		 */
		function unregisterStateChangeListener(cb) {
			_stateChangeCallbacks = _stateChangeCallbacks.filter(function(fn) {
				return fn.toString() !== cb.toString();
			});
		}
		/**
		 * @ngdoc method
		 * @name #getCurrentTime
		 * @methodOf iTT.service:playbackService
		 * @description
		 * Invokes the 'getCurrentTime' method on all playerManagers with the passed input id.
		 * @param {String} [playerId=mainPlayerId] Optional input param.
		 */
		function getCurrentTime(playerId) {
			return _playerInterfaces[_setPid(playerId)].getCurrentTime(_setPid(playerId));
		}
		/**
		 * @ngdoc method
		 * @name #getPlayerDiv
		 * @methodOf iTT.service:playbackService
		 * @description
		 * Invokes the 'getPlayerDiv' method on all playerManagers with the passed input id.
		 * @param {String} [playerId=mainPlayerId] Optional input param.
		 */
		function getPlayerDiv(playerId) {
			return _playerInterfaces[_setPid(playerId)].getPlayerDiv(_setPid(playerId));
		}
		/**
		 * @ngdoc method
		 * @name #getPlayerState
		 * @methodOf iTT.service:playbackService
		 * @description
		 * Invokes the 'getPlayerState' method on all playerManagers with the passed input id.
		 * @param {String} [playerId=mainPlayerId] Optional input param.
		 */
		function getPlayerState(playerId) {
			return _playerInterfaces[_setPid(playerId)].getPlayerState(_setPid(playerId));
		}
		/**
		 * @ngdoc method
		 * @name #setSpeed
		 * @methodOf iTT.service:playbackService
		 * @description
		 * Invokes the 'setSpeed' method on all playerManagers with the passed input id.
		 * @param {Number} playbackRate rate to set playback speed to.
		 * @param {String} [playerId=mainPlayerId] Optional input param.
		 */
		function setSpeed(playbackRate, playerId) {
			return _playerInterfaces[_setPid(playerId)].setSpeed(_setPid(playerId), playbackRate);
		}
		/**
		 * @ngdoc method
		 * @name #toggleMute
		 * @methodOf iTT.service:playbackService
		 * @description
		 * Invokes the 'toggleMute' method on all playerManagers with the passed input id.
		 * @param {String} [playerId=mainPlayerId] Optional input param.
		 */
		function toggleMute(playerId) {
			return _playerInterfaces[_setPid(playerId)].toggleMute(_setPid(playerId));
		}
		/**
		 * @ngdoc method
		 * @name #setVolume
		 * @methodOf iTT.service:playbackService
		 * @description
		 * Invokes the 'setVolume' method on all playerManagers with the passed input id.
		 * @param {Number} vol the volume level to set.
		 * @param {String} [playerId=mainPlayerId] Optional input param.
		 */
		function setVolume(vol, playerId) {
			_playerInterfaces[_setPid(playerId)].setVolume(_setPid(playerId), vol);
		}
		/**
		 * @ngdoc method
		 * @name #getMetaProp
		 * @methodOf iTT.service:playbackService
		 * @description
		 * Used to query a property of a playerManager meta Object, such as 'duration'.
		 * @param {String} prop the name of the property to query.
		 * @param {String} [id=mainPlayerId] Optional id.
		 * @returns {String|Number|Boolean|Void} returns the value of the prop specified
		 */
		function getMetaProp(prop, id) {
			var pid = _setPid(id);
			if (ittUtils.existy(_playerInterfaces[pid])) {
				return _playerInterfaces[pid].getMetaProp(pid, prop);
			}
		}
		/**
		 * @ngdoc method
		 * @name #setMetaProp
		 * @methodOf iTT.service:playbackService
		 * @description
		 * Used to set a property on a playerManager instance's meta Object.
		 * @param {String} prop the name of the property to query.
		 * @param {String|Number|Boolean} val The value to set.
		 * @param {String} [id=mainPlayerId] Optional id.
		 * @returns {Void} no return value but does have side-effects.
		 */
		function setMetaProp(prop, val, id) {
			var pid = _setPid(id);

			if (ittUtils.existy(_playerInterfaces[pid])) {

				// if (prop === 'duration') {
				// 	console.log('setting duration', val);
                //
				// }

				_playerInterfaces[pid].setMetaProp(pid, prop, val);

				// if (prop === 'duration') {
				// 	console.log('did set duration?', getMetaProp('duration', pid))
				// }

			} else {
				// console.trace('did not find playerManager in interfaces map', _playerInterfaces[pid]);
			}
		}
		/**
		 * @ngdoc method
		 * @name #getTimelineState
		 * @methodOf iTT.service:playbackService
		 * @description
		 * Used to query the state of the timeline.
		 * @returns {String} the state of the timeline.
		 */
		function getTimelineState() {
			return _timelineState;
		}
		/**
		 * @ngdoc method
		 * @name #setTimelineState
		 * @methodOf iTT.service:playbackService
		 * @description
		 * Used set the state of the timeline.
		 * @param {String} state the timelineState to set
		 * @returns {Void} no return val but has side-effects.
		 */
		function setTimelineState(state) {
			_timelineState = state;
		}
		/**
		 * @ngdoc method
		 * @name #freezeMetaProps
		 * @methodOf iTT.service:playbackService
		 * @description
		 * Invokes the 'freezeMetaProps' method on all playerManagers with the passed input id.
		 * @param {String} [playerId=mainPlayerId] Optional input param.
		 */
		function freezeMetaProps(playerId) {
			_playerInterfaces[_setPid(playerId)].freezeMetaProps(_setPid(playerId));
		}
		/**
		 * @ngdoc method
		 * @name #unFreezeMetaProps
		 * @methodOf iTT.service:playbackService
		 * @description
		 * Invokes the 'unFreezeMetaProps' method on all playerManagers with the passed input id.
		 * @param {String} [playerId=mainPlayerId] Optional input param.
		 */
		function unFreezeMetaProps(playerId) {
			_playerInterfaces[_setPid(playerId)].unFreezeMetaProps(_setPid(playerId));
		}

		function getMetaObj(playerId) {
			if (ittUtils.existy(_playerInterfaces[_setPid(playerId)])) {
				return _playerInterfaces[_setPid(playerId)].getMetaObj(_setPid(playerId));
			}
		}
		/**
		 * @ngdoc method
		 * @name #resetPlaybackService
		 * @methodOf iTT.service:playbackService
		 * @description
		 * used when the playbackService needs to be reset back to mostly default state. This is eventually called when
		 * the main video fires its $destory event
		 */
		function resetPlaybackService() {
			_playbackServiceHasBeenReset = true;
			_playerInterfaces = {};
			angular.forEach(_playerManagers, function(pm) {
				pm.resetPlayerManager();
			});
			_mainPlayerId = '';
			_timelineState = '';
			$interval.cancel(_mainPlayerBufferingPoll);
		}
		/**
		 * @ngdoc method
		 * @name #handle$Destroy
		 * @methodOf iTT.service:playbackService
		 * @description
		 * Handles clean up for either main player of embeds. called from ittVideo's $destroy event.
		 * @param {String} playerId unique id of the player to command
		 */
		function handle$Destroy(playerId) {
			if (playerId !== _mainPlayerId) {
				if (_playbackServiceHasBeenReset === false) {
					_handleEmbedDestroy(playerId);
				}
			} else {
				//will call resetPlaybackService from timelineSvc
				_emitStateChange('reset');
			}
		}

		function stop(playerId) {
			_playerInterfaces[_setPid(playerId)].stop(_setPid(playerId));
		}

		/*
			PRIVATE METHODS
		 */

		/**
		 * @ngdoc method
		 * @name _handleEmbedDestroy
		 * @methodOf iTT.service:playbackService
		 * @description
		 * _handleEmbedDestroy
		 * @param {String} [playerId=mainPlayerId] Optional input param.
		 * @private
		 */
		function _handleEmbedDestroy(playerId) {
			setMetaProp('startAtTime', getCurrentTime(playerId), playerId);
			setMetaProp('hasResumedFromStartAt', false, playerId);
			setMetaProp('ready', false, playerId);
			// console.log('meta', _playerInterfaces[playerId].getMetaObj(playerId));
			freezeMetaProps(playerId);
		}
		/**
		 * @ngdoc method
		 * @name _setPid
		 * @methodOf iTT.service:playbackService
		 * @description
		 * Helper method used to set the playerId to either the input ID or the mainPlayerId if left blank.
		 * @param {String} pid the ID of the player to use.
		 * @returns {String} Either the input ID or the _mainPlayerId
		 * @private
		 */
		function _setPid(pid) {
			if (ittUtils.existy(pid)) {
				return pid;
			}
			return _mainPlayerId;
		}
		/**
		 * @ngdoc method
		 * @name _emitStateChange
		 * @methodOf iTT.service:playbackService
		 * @description
		 * Helper method used to to emit stateChanges upstream to the timelineSvc (or anywhere else that has registered
		 * a listener)
		 * @param {String} state State to emit.
		 * @private
		 */
		function _emitStateChange(state) {
			angular.forEach(_stateChangeCallbacks, function(cb) {
				cb(state);
			});
		}
		/**
		 * @ngdoc method
		 * @name _onPlayerReady
		 * @methodOf iTT.service:playbackService
		 * @description
		 * Method that handles the 'onReady' event fired from a playerManager when the player is ready to accept
		 * commands. Will seek playback to 'startAt' time which is set from either a query string parameter (for the
		 * main video) or is saved on the ittVideo $destory event, for embeds. If the video was playing prior to being
		 * destroyed, it will resume playback.
		 * @param {String} pid playerId of player emitting 'onReady' event.
		 * @private
		 */
		function _onPlayerReady(pid) {
			var lastState = PLAYERSTATES[getMetaProp('playerState', pid)];
			var startAt = getMetaProp('startAtTime', pid);
			var hasResumed = getMetaProp('hasResumedFromStartAt', pid);

			setMetaProp('ready', true, pid);

			if (pid === _mainPlayerId) {
				setMetaProp('playerState', '5', pid);
				_emitStateChange('video cued', pid);
			}

			if (startAt > 0) {
				if (hasResumed === false) {
					seek(startAt, pid);

					if (pid !== _mainPlayerId) {
						setMetaProp('hasResumedFromStartAt', true, pid);

						if (lastState === 'playing') {
							play(pid);
						}
					}
				}
			}
		}

		//respond to events emitted from playerManager
		//playerManager -> playbackSvc -> timelineSvc (if main)
		/**
		 * @ngdoc method
		 * @name _stateChangeCB
		 * @methodOf iTT.service:playbackService
		 * @description
		 * Switch statement that handles events emitted from playerManagers and will emit the event up to the
		 * timelineSvc if the event came from the mainVideo.
		 * @param {Object} stateChangeEvent Object with state and emitterId properties.
		 * @returns {Void} returns void but has side-effects.
		 * @private
		 */
		function _stateChangeCB(stateChangeEvent) {
			var state = stateChangeEvent.state;
			var emitterId = stateChangeEvent.emitterId;

			switch (state) {
				case 'unstarted':
					break;
				case 'ended':
					break;
				case 'playing':
					if (getMetaProp('hasBeenPlayed', emitterId) === false) {
						setMetaProp('hasBeenPlayed', true, emitterId);
					}
					angular.forEach(_playerManagers, function(pm) {
						pm.pauseOtherPlayers(emitterId);
					});
					break;
				case 'paused':
					break;
				case 'buffering':
					break;
				case 'video cued':
					break;
				case 'player ready':
					_onPlayerReady(emitterId);
					break;
			}

			if (state !== 'player ready') {
				setMetaProp('playerState', PLAYERSTATES_WORD[state], emitterId);
			}

			if (emitterId === _mainPlayerId) {
				_emitStateChange(state);
			}
		}
		/**
		 * @ngdoc method
		 * @name _stateChangeCB
		 * @methodOf iTT.service:playbackService
		 * @description
		 * queries the bufferedPercent meta object prop on a 200ms interval
		 * @returns {Number} returns the percent of buffering for the main video
		 * @private
		 */
		function _pollBufferedPercent() {
			_mainPlayerBufferingPoll = $interval(function() {
				setMetaProp('bufferedPercent', getMetaProp('bufferedPercent', _mainPlayerId), _mainPlayerId);
			}, 200);
		}
		/**
		 * @ngdoc method
		 * @name _getPlayerManagerFromMediaSrc
		 * @methodOf iTT.service:playbackService
		 * @description
		 * Loops over the input mediaSrcArr to derive the playerManager that can handle the input parsedMediaSrcArr
		 * @returns {Object} returns the playerManager that can handle the input media
		 * @private
		 */
		function _getPlayerManagerFromMediaSrc(parsedMediaSrc) {
			var len = _playerManagers.length, pm = null;
			while (len--) {
				if (parsedMediaSrc.length > 0 && _playerManagers[len].type === parsedMediaSrc[0].type) {
					pm = _playerManagers[len];
					break;
				}
			}
			return pm;
		}
	}


})();


