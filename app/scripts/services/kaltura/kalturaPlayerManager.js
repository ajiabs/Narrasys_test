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

		return {
			type: _type,
			seedPlayerManager: seedPlayerManager,
			create: create,
			getPlayerDiv: getPlayerDiv,
			getMetaProp: getMetaProp,
			setMetaProp: setMetaProp,
			getMetaObj: getMetaObj,
			registerStateChangeListener: registerStateChangeListener,
			unregisterStateChangeListener: unregisterStateChangeListener,
			pauseOtherPlayers: pauseOtherPlayers,
			getPlayerState: getPlayerState,
			pause: pause,
			play: play,
			stop: angular.noop,
			seekTo: seekTo,
			getBufferedPercent: getBufferedPercent,
			getCurrentTime: getCurrentTime
		};

		function seedPlayerManager(id, mainPlayer, mediaSrcArr) {
			if (_players[id] && getMetaProp(id, 'startAtTime') > 0) {
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
				_attachEventListeners(kdp);
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

		function onPlayerReady(pid) {
			setMetaProp(pid, 'playerState', 6);
			_emitStateChange(pid);
		}


		function onPlaying(pid) {
			if (_existy(pid)) {
				setMetaProp(pid, 'playerState', 1);
				_emitStateChange(pid);
			}
		}

		function onPaused(pid) {
			setMetaProp(pid, 'playerState', 2);
			_emitStateChange(pid);
		}

		function onBufferChange(isBuffering) {
			if (isBuffering) {
				setMetaProp(this.id, 'playerState', 3);
				_emitStateChange(this.id);
			}
		}

		function onSeeked(t) {
			console.log('onSeeked', t);
			setMetaProp(this.id, 'playerState', 3);
			_emitStateChange(this.id);
		}

		function onPlayerPlayEnd(pid) {
			setMetaProp(pid, 'playerState', 5);
			_emitStateChange(pid);
		}

		function _attachEventListeners(kdp) {
			var kMap = {
				'seeked': onSeeked,
				'playerPlayed': onPlaying,
				'playerPaused': onPaused,
				'bufferChange': onBufferChange,
				'playerPlayEnd': onPlayerPlayEnd,
				'playerReady': onPlayerReady
			};
			var nameSpace = '.nys';
			Object.keys(kMap).forEach(function(evtName) {
				(function(evtName) {
					kdp.kBind(evtName + nameSpace, kMap[evtName]);
				})(evtName)
			});
		}

		function play(pid) {
			_sendKdpNotice(pid, 'doPlay');
		}

		function pause(pid) {
			_sendKdpNotice(pid, 'doPause');
		}

		function seekTo(pid, t) {
			_sendKdpNotice(pid, 'doSeek', t);
		}

		function _sendKdpNotice(pid, notice, val) {
			var kdp = getInstance(pid);
			if (_existy(val)) {
				kdp.sendNotification(notice, val);
			} else {
				kdp.sendNotification(notice);
			}
		}

		function getPlayerState(pid) {
			return PLAYERSTATES[getMetaProp(pid, 'playerState')];
		}

		function getCurrentTime(pid) {
			var instance = getInstance(pid);
			return instance.evaluate('{video.player.currentTime}');
		}

		function getBufferedPercent() {
			return 0;
		}

		function _emitStateChange(pid) {
			_stateChangeCallbacks.forEach(function(cb) {
				cb(_formatPlayerStateChangeEvent(getMetaProp(pid, 'playerState'), pid));
			});
		}

		function _formatPlayerStateChangeEvent(state, pid) {
			return {
				emitterId: pid,
				state: PLAYERSTATES[state]
			};
		}

	}


})();
