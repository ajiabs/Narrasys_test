/**
 * Created by githop on 1/18/16.
 */

(function() {
	'use strict';
	/*jshint validthis: true */

	angular.module('com.inthetelling.story')
		.factory('html5PlayerManager', html5PlayerManager);

	// var readyStates = {
	// 	0: 'HAVE_NOTHING',
	// 	1: 'HAVE_METADATA',
	// 	2: 'HAVE_CURRENT_DATA',
	// 	3: 'HAVE_FUTURE_DATA',
	// 	4: 'HAVE_ENOUGH_DATA'
	// };

	function html5PlayerManager($interval, PLAYERSTATES, ittUtils) {
		var _players = {};
		var _mainPlayerId;
		// var _checkInterval = 50.0;
		var _stateChangeCallbacks = [];
		var _type = 'html5';
		var _existy = ittUtils.existy;

		var _validMetaKeys = [
			'playerState',
			'startAtTime',
			'time',
			'duration',
			'hasBeenPlayed',
			'hasResumedFromStartAt',
			'bufferedPercent',
			'timeMultiplier',
			'videoType',
			'ready'
		];

		var _html5MetaObj = {
			instance: null,
			meta: {
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
			resetPlayers: resetPlayers,
			resetMetaProps: resetMetaProps,
			getMetaObj: getMetaObj
			//destroy
		};

		function create(divID) {

			if (Object.isFrozen(_players[divID].meta)) {
				unFreezeMetaProps(divID);
			}

			var plr = document.getElementById(divID);
			plr.onpause = onPause;
			plr.onplaying = onPlaying;
			plr.onwaiting = onBuffering;
			plr.oncanplay = onCanPlay;
			plr.onended = onEnded;
			plr.onseeked = onSeeked;
			// plr.onstalled = onBuffering;
			// plr.onended = onEnded;

			plr.onStateChange = _onStateChange;

			plr.controls = true;
			if (_mainPlayerId === divID) {
				_mainPlayerId = divID;
				plr.controls = false;
			}

			_players[divID].instance = plr;
			setMetaProp(divID, 'ready', true);

			// temp to test out video source change.
			// $timeout(function() {
			// 	console.info('BEGIN QUALITY CHANGE!');
			// 	_changeVideoQuality(divID, 1);
			// 	_players[divID].meta.playerState = 2;
			// 	_emitStateChange(plr);
			// }, 8 * 1000);

			// var checkBuffering = _checkBuffering(plr);

			// var interval = $interval(checkBuffering, _checkInterval);

			return plr;
		}

		function registerStateChangeListener(cb) {
			_stateChangeCallbacks.push(cb);
		}

		function unregisterStateChangeListener(cb) {
			_stateChangeCallbacks = _stateChangeCallbacks.filter(function(fn) {
				return fn.toString() !== cb.toString();
			});
		}

		function getPlayerDiv(id) {
			return getMetaProp(id, 'div');
		}

		function freezeMetaProps(pid) {
			Object.freeze(_players[pid].meta);
		}

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


		function getMetaObj(pid) {
			if (_existy(_players[pid]) && _existy(_players[pid].meta)) {
				return _players[pid].meta;
			}
		}

		function getMetaProp(pid, prop) {
			if (_existy(_players[pid]) && _existy(_players[pid].meta)) {
				return _players[pid].meta[prop];
			}
		}

		function setMetaProp(pid, prop, val) {

			if (_validMetaKeys.indexOf(prop) === -1) {
				throw new Error(prop + ' is not a valid prop for HTML5 meta info');
			}

			if (_existy(_players[pid] && _players[pid].meta)) {

				try {
					_players[pid].meta[prop] = val;
				} catch (e) {
					console.log('catch read only error:', e);
				}

			}
		}

		function seedPlayerManager(id, mainPlayer, mediaSrcArr) {

			//bail if we already have set the instance in the _players map.
			if (_players[id] && getMetaProp(id, 'ready') === true) {
				return;
			}

			if (mainPlayer) {
				_players = {};
				_mainPlayerId = id;
			}

			var plrInfo = _initPlayerDiv(id, mediaSrcArr, 0);

			//store relevant info the particular player in the 'meta' obj.
			_players[id] = {
				//instance will be swapped out with the actual video element when create() is called
				instance: null,
				meta: {
					mainPlayer: mainPlayer,
					playerState: '-1',
					videoObj: plrInfo.videoObj,
					div: plrInfo.videoElm,
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

		}

		/*
		 HTML5 media event handlers
		 */

		function onEnded() {
			var instance = _getInstance(this.id);
			setMetaProp(this.id, 'playerState', 0);
			_emitStateChange(instance);
		}

		//using onCanPlay event in a similar manner as 'onReady' in youtubePlayerManager; i.e.
		//to emit a 'video cued' event for the timelineSvc#startAtSpecific time method or
		//to resume playback on a destroyed embedded video.
		function onCanPlay() {
			var instance = _getInstance(this.id);

			var lastState = getMetaProp(this.id, 'playerState');
			var startAt = getMetaProp(this.id, 'startAtTime');
			var hasResumed = getMetaProp(this.id, 'hasResumedFromStartAt');

			if (startAt > 0) {
				//check to see if we need to resume from startAtTime
				if (hasResumed === false) {
					instance.currentTime = startAt;

					if (getMetaProp(this.id, 'mainPlayer') === false) {
						//for mainPlayer, this will be set in timelineSvc
						setMetaProp(this.id, 'hasResumedFromStartAt', true);

						//resume playback if the embed was playing when destroyed.
						if (PLAYERSTATES[lastState] === 'playing') {
							instance.play();
							//return to avoid emitting 'video cued' event below.
							return;
						}
					}

				}

				//emit video cued for main video, for timelineSvc#startAtSpecificTime
				setMetaProp(this.id, 'playerState', 5);
				_emitStateChange(instance);
			} else {
				//emit 'unstarted' if first time
				if (getMetaProp(this.id, 'hasBeenPlayed') === false) {
					setMetaProp(this.id, 'playerState', -1);
					_emitStateChange(instance);
				}
			}

		}

		function onPlaying() {
			var instance = _getInstance(this.id);
			setMetaProp(this.id, 'playerState', 1);
			_emitStateChange(instance);
		}

		function onPause() {
			var instance = _getInstance(this.id);
			setMetaProp(this.id, 'playerState', 2);
			_emitStateChange(instance);
		}

		function onBuffering() {
			var instance = _getInstance(this.id);
			setMetaProp(this.id, 'playerState', 3);
			_emitStateChange(instance);
		}

		function onSeeked() {
		}

		/*
		 Playback exported methods
		 */

		function play(pid) {
			var instance = _getInstance(pid);
			var timestamp = getMetaProp(pid, 'time');
			var waitUntilReady = $interval(function() {
				var delay;
				if (_existy(instance) && instance.readyState === 4) {
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

		function pause(pid) {
			var instance = _getInstance(pid);
			instance.pause();
		}

		function getCurrentTime(pid) {
			var instance = _getInstance(pid);
			if (instance !== undefined) {
				return instance.currentTime;
			}
		}

		function getPlayerState(pid) {
			// var instance = _getInstance(pid);
			var player = _getPlayer(pid);

			if (_existy(player)) {
				return PLAYERSTATES[player.meta.playerState];
			}

		}

		function seek(pid, t) {
			var instance = _getInstance(pid);
			instance.currentTime = t;
		}

		function setSpeed(pid, playbackRate) {
			var instance = _getInstance(pid);
			instance.playbackRate = playbackRate;
		}

		function toggleMute(pid) {
			var instance = _getInstance(pid);
			instance.muted = !instance.muted;
		}

		function setVolume(pid, vol) {
			var instance = _getInstance(pid);
			instance.volume = (vol / 100);
		}

		/**
		 * @ngdoc method
		 * @name #pauseOtherPlayers
		 * @param {String} pid the current player
		 * @description
		 * loop over all players and pause them if they are not the current player
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

		function resetPlayers() {
			_players = {};
		}

		function resetMetaProps(list, id) {
			if (_existy(_players[id])) {
				list.forEach(function(prop) {
					if (_players[id].meta.hasOwnProperty(prop)) {
						//reset to inital value on _metaObj
						setMetaProp(id, prop, _html5MetaObj.meta[prop])
					}
				});
			}
		}

		/*
		 private methods
		 */

		function _initPlayerDiv(id, mediaSrcArr) {
			var videoObj = _getHtml5VideoObject(mediaSrcArr);
			var videoElm = _drawPlayerDiv(id, videoObj, 0);
			return {videoObj: videoObj, videoElm: videoElm};
		}

		//quality param is the index into the videoObject[fileType] array of files by size.
		function _drawPlayerDiv(id, videoObj, quality) {

			var videoElement = '<video id="' + id  + '">';
			var classAttr, srcAttr, typeAttr;
			Object.keys(videoObj).forEach(function(fileType) {
				classAttr = fileType;
				srcAttr = videoObj[fileType][quality];

				if (!_existy(srcAttr)) {
					return;
				}

				if (fileType === 'm3u8') {
					typeAttr = 'application/x-mpegURL';
				} else {
					typeAttr = 'video/' + fileType;
				}

				videoElement += '<source class="' + classAttr + '" src="' + srcAttr + '" type="' + typeAttr + '"/>';
			});

			videoElement += '<p>Oh no! Your browser does not support the HTML5 Video element.</p>';
			videoElement += '</video>';
			return videoElement;
		}

		function _formatPlayerStateChangeEvent(event, pid) {
			return {
				emitterId: pid,
				state: PLAYERSTATES[event]
			};
		}

		function _emitStateChange(instance) {
			var player = _getPlayer(instance.id);
			instance.onStateChange(_formatPlayerStateChangeEvent(player.meta.playerState, instance.id));
		}

		function _onStateChange(event) {
			angular.forEach(_stateChangeCallbacks, function(cb) {
				cb(event);
			});
		}

		function _getPlayer(pid) {
			if (_players[pid]) {
				return _players[pid];
			}
		}

		function _getInstance(pid) {
			if (_players[pid]) {
				return _players[pid].instance;
			}
		}

		function _getHtml5VideoObject(mediaSrcArr) {
			var extensionMatch = /(mp4|m3u8|webm)/;

			return mediaSrcArr.reduce(function(videoObject, mediaSrc) {
				var fileTypeKey = mediaSrc.match(extensionMatch)[1];
				videoObject[fileTypeKey].push(mediaSrc);
				return videoObject;
			}, {mp4: [], webm: [], m3u8: []});
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
