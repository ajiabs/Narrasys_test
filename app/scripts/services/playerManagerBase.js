/**
 * Created by githop on 1/13/17.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.factory('playerManagerBase', playerManagerBase);

	function playerManagerBase() {
		var _players = {};
		var _mainPlayerId;
		var _stateChangeCallbacks = [];
		var _type = 'playerManagerBase';

		var _baseMetaObj = {
			instance: null,
			meta: {
				mainPlayer: false,
				playerState: '-1',
				div: '',
				ready: false,
				startAtTime: 0,
				duration: 0,
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
			create: '',
			seedPlayerManager: ''
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
	}


})();
