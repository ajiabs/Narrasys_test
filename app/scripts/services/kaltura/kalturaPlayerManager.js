/**
 * Created by githop on 1/13/17.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.factory('kalturaPlayerManager', kalturaPlayerManager);

	function kalturaPlayerManager(ittUtils, PLAYERSTATES, playerManagerCommons, kalturaScriptLoader, kalturaUrlService) {
		var _players = {};
		var _mainPlayerId;
		var _stateChangeCallbacks = [];
		var _type = 'kaltura';
		var _existy = ittUtils.existy;

		var _kalturaMetaObj = {
			instance: null,
			meta: {
				mainPlayer: false,
				playerState: '-1',
				div: '',
				ready: false,
				startAtTime: 0,
				duration: 0,
				ktObj: {},
				isMuted: false,
				vol: 0,
				time: 0,
				hasResumedFromStartAt: false,
				hasBeenPlayed: false,
				bufferedPercent: 0,
				timeMultiplier: 1,
				videoType: _type
			}
		};

		var _validMetaKeys = Object.keys(_kalturaMetaObj.meta);
		var predicate = function(pid) {
			return (_existy(getPlayer(pid)) && getMetaProp(pid, 'ready') === true);
		};

		var commons = playerManagerCommons({players:_players, stateChangeCallbacks: _stateChangeCallbacks, type: _type});
		var getPlayer = commons.getPlayer;
		var setPlayer = commons.setPlayer;
		var getPlayerDiv = commons.getPlayerDiv;
		var getInstance = commons.getInstance(predicate);
		var createMetaObj = commons.createMetaObj;
		var getMetaObj = commons.getMetaObj;
		var getMetaProp = commons.getMetaProp;
		var setMetaProp = commons.setMetaProp(_validMetaKeys);
		var registerStateChangeListener = commons.registerStateChangeListener;
		var unregisterStateChangeListener = commons.unregisterStateChangeListener;
		var pauseOtherPlayers = commons.pauseOtherPlayers(pause, getPlayerState);
		var resetPlayerManager = commons.resetPlayerManager(_removeEventListeners);

		return {
			type: _type,
			getMetaProp: getMetaProp,
			setMetaProp: setMetaProp,
			getMetaObj: getMetaObj,
			getPlayerDiv: getPlayerDiv,
			pauseOtherPlayers: pauseOtherPlayers,
			registerStateChangeListener: registerStateChangeListener,
			unregisterStateChangeListener: unregisterStateChangeListener,
			resetPlayerManager: resetPlayerManager,
			seedPlayerManager: seedPlayerManager,
			create: create,
			getPlayerState: getPlayerState,
			play: play,
			pause: pause,
			seekTo: seekTo,
			getCurrentTime: getCurrentTime,
			getBufferedPercent: getBufferedPercent,
			toggleMute: toggleMute,
			setVolume: setVolume,
			setSpeed: angular.noop,
			freezeMetaProps: angular.noop,
			unFreezeMetaProps: angular.noop,
			stop: angular.noop
		};

		function create(playerId) {

			var ktObj = getMetaProp(playerId, 'ktObj');
			var partnerId = ktObj.partnerId,
				entryId = ktObj.entryId,
				uiConfId = ktObj.uiconfId;

			_createKWidget(playerId, partnerId, entryId, uiConfId, readyCallback)
				.then(handleSuccess);


			function handleSuccess() {}

			function readyCallback(playerId) {
				var kdp = document.getElementById(playerId);
				getPlayer(playerId).instance = kdp;
				_attachEventListeners(kdp, playerId);
			}

		}

		function seedPlayerManager(id, mainPlayer, mediaSrcArr) {
			if (_existy(getPlayer(id)) && getMetaProp(id, 'startAtTime') > 0) {
				return;
			}

			if (mainPlayer) {
				_players = {};
				_mainPlayerId = id;
			}
			var ktObj = kalturaUrlService.getKalturaObjectFromAutoEmbedURL(mediaSrcArr[0]);
			var newProps = {
				mainPlayer: mainPlayer,
				div: _getPlayerDiv(id),
				ktObj: ktObj
			};
			setPlayer(id, createMetaObj(newProps, _kalturaMetaObj));
		}

		/*
			Event Bound functions
		 */

		function onMediaReady(pid) {
			_emitStateChange(pid, 6);
		}

		function onPlaying(pid) {
			setMetaProp(pid, 'playerState', 1);
			_emitStateChange(pid);
		}

		function onPaused(pid) {
			setMetaProp(pid, 'playerState', 2);
			_emitStateChange(pid);
		}

		function onBufferEnd(ev) {
			var currentState = PLAYERSTATES[getMetaProp(this.id, 'playerState')];

			if (currentState === 'buffering') {
				play(this.id);
			}
		}

		function onBufferStart() {
			setMetaProp(this.id, 'playerState', 3);
			_emitStateChange(this.id);
		}

		function onPlayerPlayEnd(pid) {
			setMetaProp(pid, 'playerState', 5);
			_emitStateChange(pid);
		}

		function onPlayerError(e) {
			console.warn('PLAYER ERROR', e);
		}

		/*
			Public Methods
		 */
		function play(pid) {
			_sendKdpNotice(pid, 'doPlay');
		}

		function pause(pid) {
			_sendKdpNotice(pid, 'doPause');
		}

		function seekTo(pid, t) {
			_sendKdpNotice(pid, 'doSeek', t);
		}

		function getPlayerState(pid) {
			return PLAYERSTATES[getMetaProp(pid, 'playerState')];
		}

		function getCurrentTime(pid) {
			return _kdpEval(pid, 'video.player.currentTime') || 0;
		}

		function getBufferedPercent(pid) {
			if (getMetaProp(pid, 'ready') === true) {
				return _kdpEval(pid, 'video.buffer.percent') * 100;
			}
		}
		function toggleMute(pid) {
			var isMuted = getMetaProp(pid, 'isMuted');

			if (isMuted === false) {
				//save last known vol
				var lastVol = _kdpEval(pid, 'video.volume') * 100;
				setMetaProp(pid, 'vol', lastVol);
				setVolume(pid, 0);
			} else {
				setVolume(pid, getMetaProp(pid, 'vol'));
			}

			setMetaProp(pid, 'isMuted', !isMuted);
		}

		function setVolume(pid, v) {
			_sendKdpNotice(pid, 'changeVolume', v / 100);
		}

		/*
			Private methods
		 */

		function _sendKdpNotice(pid, notice, val) {
			var kdp = getInstance(pid);

			try {
				if (_existy(val)) {
					kdp.sendNotification(notice, val);
				} else {
					kdp.sendNotification(notice);
				}
			} catch(e) {
				console.log('error sending', notice);
			}
		}

		function _createKWidget(divId, partnerID, entryID, uiConfId, onReadyCB) {
			return kalturaScriptLoader.load(partnerID, uiConfId).then(function() {
				KWidget.embed({
					"targetId": divId,
					"wid": "_" + partnerID,
					"uiconf_id": uiConfId,
					"flashVars": {

					},
					"entry_id": entryID,
					"readyCallback": onReadyCB
				});
			});
		}

		function _getPlayerDiv(id) {
			return '<div id="' + id + '"></div>';
		}

		function _attachEventListeners(kdp, pid) {
			var kMap = {
				'playerPlayed': onPlaying,
				'playerPaused': onPaused,
				'bufferStartEvent': onBufferStart,
				'bufferEndEvent': onBufferEnd,
				'playerPlayEnd': onPlayerPlayEnd,
				'playerError': onPlayerError,
				'mediaReady': onMediaReady
			};
			Object.keys(kMap).forEach(function(evtName) {
				(function(evtName) {
					kdp.kBind(evtName + '.' + pid, kMap[evtName]);
				})(evtName)
			});
		}

		function _removeEventListeners(pid) {
			var kdp = getInstance(pid);
			kdp.kUnbind('.' + pid);
		}

		function _emitStateChange(pid, forceState) {
			var state;

			if (forceState) {
				state = forceState
			} else {
				state = getMetaProp(pid, 'playerState');
			}

			_stateChangeCallbacks.forEach(function(cb) {
				cb(_formatPlayerStateChangeEvent(state, pid));
			});
		}

		function _kdpEval(pid, prop) {
			var instance = getInstance(pid);
			return instance.evaluate('{' + prop + '}');
		}

		function _formatPlayerStateChangeEvent(state, pid) {
			return {
				emitterId: pid,
				state: PLAYERSTATES[state]
			};
		}

	}


})();
