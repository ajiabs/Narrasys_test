/**
 * Created by githop on 1/13/17.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.factory('kalturaPlayerManager', kalturaPlayerManager);

	function kalturaPlayerManager(playerManagerCommons, kalturaScriptLoader, kalturaUrlService) {
		var _players = {};
		var _mainPlayerId;
		var _stateChangeCallbacks = [];
		var _type = 'kaltura';

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
			getBufferedPercent: getBufferedPercent
		};

		function seedPlayerManager(id, mainPlayer, mediaSrcArr) {
			if (_players[id] && getMetaProp(id, 'startAtTime') > 0) {
				return;
			}

			if (mainPlayer) {
				_players = {};
				_mainPlayerId = id;
			}


			console.log('media srcArr', mediaSrcArr[0]);
			var ktObj = kalturaUrlService.getKalturaObjectFromAutoEmbedURL(mediaSrcArr[0]);
			// console.log('ktObj', ktObj);

			var newProps = {
				mainPlayer: mainPlayer,
				div: _getPlayerDiv(id),
				ktObj: ktObj
			};

			// console.log('props', newProps);

			setPlayer(id, createMetaObj(newProps, _kalturaMetaObj));
		}

		function create(playerId) {

			var ktObj = getMetaProp(playerId, 'ktObj');
			var partnerId = ktObj.partnerId,
				entryId = ktObj.entryId,
				uiConfId = ktObj.uiconfId;



			_createKWidget(playerId, partnerId, entryId, uiConfId, readyCallback)
				.then(handleSuccess);


			function handleSuccess() {
				console.log('widget created!');
			}

			function readyCallback(hm) {
				console.log('ready cb fired!', hm);
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

		function pause() {}

		function getPlayerState() {}

		function getBufferedPercent() {
			return 0;
		}

	}


})();
