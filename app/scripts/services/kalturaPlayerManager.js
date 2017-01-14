/**
 * Created by githop on 1/13/17.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.factory('kalturaPlayerManager', kalturaPlayerManager);

	function kalturaPlayerManager(kalturaScriptLoader, kalturaUrlService) {
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
				ktUrl: '',
				time: 0,
				hasResumedFromStartAt: false,
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
			getPlayerDiv: getPlayerDiv
		};

		function create(playerId) {
			var partnerID, entryID, uiConfId;

			_createKWidget(playerId, partnerID, entryID, uiConfId, readyCallback)
				.then(handleSuccess);


			function handleSuccess() {
				console.log('widget created!');
			}

			function readyCallback(hm) {
				console.log('ready cb fired!', hm);
			}
		}

		function seedPlayerManager(id, mainPlayer, mediaSrcArr) {
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
				ktObj: kalturaUrlService.getKalturaObjectFromAutoEmbedURL(mediaSrcArr[0])
			};

			_players[id] = _createMetaObj(newProps, _kalturaMetaObj);
		}

		function getPlayerDiv(id) {
			return _players[id].meta.div;
		}

		function _getPlayerDiv(id) {
			return '<div id="' + id + '"></div>';
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


	}


})();
