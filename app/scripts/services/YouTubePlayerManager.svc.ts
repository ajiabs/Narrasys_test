/**
 * Created by githop on 12/3/15.
 */


import {IPlayer} from '../interfaces/IPlayer';
/**
 * @ngdoc service
 * @name iTT.service:youTubePlayerManager
 * @description
 * A service for working with youtube iframes
 * {@link https://github.com/InTheTelling/client/blob/master/app/scripts/services/YouTubePlayerManager.svc.js source}
 * @requires $q
 * @requires $location
 * @requires appState
 * @requires timelineSvc
 * @requires YoutubePlayerApi
 * @requires errorSvc
 */
export default function youTubePlayerManager($q: ng.IQService, $location: ng.ILocationService, appState, timelineSvc, YoutubePlayerApi, errorSvc): IPlayer {
	'ngInject';
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
		stop: stop,
		reset: reset,
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

	function _createInstance(divId: string, videoID: string, stateChangeCB: Function, qualityChangeCB: Function, onReadyCB: Function, onError: Function) {

		var _controls = 1;
		if (divId === _mainPlayerId) {
			_controls = 0;
		}

		var host = $location.host();
		return YoutubePlayerApi.load().then(function () {
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
	function _getYTInstance(pid: string) {
		if (_players[pid] && _players[pid].ready === true) {
			return _players[pid].yt;
		}
	}

	function _existy(x: any) {
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
	function _getPidFromInstance(ytInstance: Object) {
		var _key;
		//for some reason, angular.equals was not working in this context.
		//context: when embedding two identical youtube videos seemed to break
		angular.forEach(_players, function (p, key) {
			if (p.yt === ytInstance) {
				return _key = key; // jshint ignore:line
			}
		});

		return _key;
	}

	//public methods
	/**
	 * @ngdoc method
	 * @name #create
	 * @methodOf iTT.service:youTubePlayerManager
	 * @description
	 * Used to create an instance of the YT object which is necessary to
	 * interface with the youtube Iframe API
	 * @param {String} divId Unique ID of Div element to append iframe into
	 * @param {String} videoId The youtube Video ID
	 * @param {Function} [stateCb=noop] Optional control flow callback
	 * @param {Function} [qualityChangeCB=noop] Optional quality change callback
	 * @param {Function} [onReadyCB=noop] Optional onReady callback
	 * @returns {Void} has no return value
	 */
	function create(divId: string, playerId: string, videoId: string, stateCb: Function, qualityChangeCB: Function, onReadyCB: Function) {
		_createInstance(divId, videoId, onPlayerStateChange, onPlayerQualityChange, onReady, onError)
			.then(handleSuccess)
			.catch(tryAgain);


		function handleSuccess(ytInstance: Object) {
			_players[playerId].yt = ytInstance;
			_players[playerId].ready = false;

		}

		function tryAgain() {
			return _createInstance(divId, videoId, onPlayerStateChange, onPlayerQualityChange, onReady, onError)
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

		interface IYoutubeEvent {
			target: Object,
			data: number | string
		}

		function onPlayerStateChange(event: IYoutubeEvent) {
			//console.log("player state change!", event);
			var main = _mainPlayerId;
			var embed;
			var state = event.data;
			var pid = _getPidFromInstance(event.target);

			if (pid !== _mainPlayerId) {
				embed = pid;
			}
			var embedPlayerState = playerState(embed);
			var mainPlayerState = playerState(main);

			if (pid === main) {
				if (mainPlayerState === YT.PlayerState.PLAYING) {
					pauseEmbeds();
				}

				if (state === YT.PlayerState.ENDED) {
					console.log('thanks for watching!!!');
					//stop in the manager on the emitting player
					stop(pid);
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
		function onReady(event: IYoutubeEvent) {

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
		function onPlayerQualityChange(event: IYoutubeEvent) {
			var pid = _getPidFromInstance(event.target);
			if (event.data === 'medium' && /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)) {
				setPlaybackQuality(pid, 'large');
			}

			qualityChangeCB(event);

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
		function onError(event: IYoutubeEvent) {
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
	 * @name #getCurrentTime
	 * @methodOf iTT.service:youTubePlayerManager
	 * @description
	 * Used to get the current time of youtube video.
	 * @param {String} pid The ID of the YT instance
	 * @returns {Number} The current time of video in seconds.
	 */
	function getCurrentTime(pid: string) {
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
	function playerState(pid: string) {
		var p = _getYTInstance(pid);
		if (_existy(p)) {
			return p.getPlayerState();
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
	function play(pid: string) {
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
	function pause(pid: string) {
		var p = _getYTInstance(pid);
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
	function stop(pid: string) {
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
	function reset(pid: string) {

		var obj = _players[pid];
		var instance = _players[pid].yt;

		if (_existy(instance)) {
			console.log('debug info', instance.getDebugText());
			var videoId = instance.getVideoData().video_id;
			var lastTime = instance.getCurrentTime();

			if (obj.isMainPlayer) {
				instance.cueVideoById(videoId, lastTime);
				timelineSvc.play();
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
	 * @param {String} size The size to set playback quality
	 * @returns {Void} no return value
	 */
	function setPlaybackQuality(pid:string, size:string) {
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
	function getVideoLoadedFraction(pid: string) {
		var p = _getYTInstance(pid);
		if (_existy(p)) {
			return p.getVideoLoadedFraction();
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
	function seekTo(pid:string, t:number, allowSeekAhead:boolean) {
		var p = _getYTInstance(pid);
		if (_existy(p)) {
			p.seekTo(t, allowSeekAhead);
		}
	}

	/**
	 * @ngdoc method
	 * @name #isMuted
	 * @methodOf iTT.service:youTubePlayerManager
	 * @description
	 * Getter to determine mute state
	 * @param {String} pid The ID of the YT instance
	 * @returns {Boolean} Bool representing mute state
	 */
	function isMuted(pid:string) {
		var p = _getYTInstance(pid);

		if (_existy(p)) {
			return p.isMuted();
		}
	}

	/**
	 * @ngdoc method
	 * @name #mute
	 * @methodOf iTT.service:youTubePlayerManager
	 * @description
	 * Sets isMuted to true
	 * @param {String} pid The ID of the YT instance
	 * @returns {Void} No return value.
	 */
	function mute(pid:string) {
		var p = _getYTInstance(pid);

		if (_existy(p)) {
			return p.mute();
		}
	}

	/**
	 * @ngdoc method
	 * @name #unMute
	 * @methodOf iTT.service:youTubePlayerManager
	 * @description
	 * Sets isMuted to false
	 * @param {String} pid The ID of the YT instance
	 * @returns {Void} No return value.
	 */
	function unMute(pid:string) {
		var p = _getYTInstance(pid);

		if (_existy(p)) {
			return p.unMute();
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
	function setVolume(pid:string, v:number) {
		var p = _getYTInstance(pid);

		if (_existy(p)) {
			p.setVolume(v);
		}
	}

	/**
	 * @ngdoc method
	 * @name #pauseEmbeds
	 * @methodOf iTT.service:youTubePlayerManager
	 * @description
	 * Loops through all YT instances except main player and calls
	 * pause() on each one.
	 * @returns {Void} No return value.
	 */
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

	/**
	 * @ngdoc method
	 * @name #pauseOtherEmbeds
	 * @methodOf iTT.service:youTubePlayerManager
	 * @description
	 * Loops through all YT instances except main player and
	 * player with same PID as the id param and calls
	 * pause() on each one. In other words, will pause all
	 * embeds except the one you interacted with.
	 * @param {String} pid The ID of the YT instance
	 * @returns {Void} No return value.
	 */
	function pauseOtherEmbeds(pid:string) {
		for (var p in _players) {
			if (p !== _mainPlayerId && p !== pid) {
				var curPlayerState = playerState(p);
				if (curPlayerState !== YT.PlayerState.UNSTARTED &&
					curPlayerState !== YT.PlayerState.PAUSED &&
					curPlayerState !== YT.PlayerState.CUED) {
					pause(p);
				}
			}
		}
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
	function destroy(pid:string) {
		var p = _getYTInstance(pid);
		if (_existy(p)) {
			p.destroy();
			delete _players[pid];
		}
	}

	/**
	 * @private
	 * @ngdoc
	 * @name _guid
	 * @methodOf iTT.service:youTubePlayerManager
	 * @description
	 * Used to generate an 8 digit 'unique' string in order to guarantee
	 * uniqueness for embedded YT instances div ID's
	 * @returns {string} 8 digit 'unique' identifier.
	 */
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

	/**
	 * @ngdoc method
	 * @name #setPlayer
	 * @methodOf iTT.service:youTubePlayerManager
	 * @description
	 * Used to set the PID / divID for a YT instance, is called prior to create()
	 * @param {String} id Main Video Asset ID or Event ID (for embeds)
	 * @param {Boolean} mainPlayer Determines type of player, embed or main
	 * @returns {String} Div ID of YT instance.
	 */
	function setPlayerId(id:string, mainPlayer:boolean) {
		var dfd = $q.defer();
		var _id;
		if (mainPlayer) {
			// clear out players obj in the case that we are main player
			// do not want stale players staying around.
			_players = {};
			_id = id;
			_mainPlayerId = _id;
			_players[_id] = {isMainPlayer: true};
		} else {
			//the resolved _id is used for the ID of the actual player element
			//it needs to be unique
			//the _id passed to the YT constructor to set the divID (see _create() above,
			//setPlayer is always called prior to create() - see ittYoutubeEmbed )
			//YT will search the dom for the above _id and insert the iframe player.
			_id = _guid() + id;
			_players[id] = {isMainPlayer: false};

		}

		dfd.resolve(_id);
		return dfd.promise;
	}

	return _youTubePlayerManager;

}
