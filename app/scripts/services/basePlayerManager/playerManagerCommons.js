/**
 * Created by githop on 1/16/17.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.factory('playerManagerCommons', playerManagerCommons);

	function playerManagerCommons(ittUtils) {
		var _existy = ittUtils.existy;
		return function(locals) {

			var _players = locals.players;
			var _stateChangeCallbacks = locals.stateChangeCallbacks;
			var _type = locals.type;

			return {
				getPlayers: getPlayers,
				getPlayer: getPlayer,
				setPlayer: setPlayer,
				getMetaProp: getMetaProp,
				setMetaProp: setMetaProp,
				createMetaObj: createMetaObj,
				getMetaObj: getMetaObj,
				getPlayerDiv: getPlayerDiv,
				getInstance: getInstance,
				registerStateChangeListener: registerStateChangeListener,
				unregisterStateChangeListener: unregisterStateChangeListener,
				pauseOtherPlayers: pauseOtherPlayers
			};

			function getPlayers() {
				return _players;
			}

			function getPlayer(pid) {
				if (_existy(_players[pid])) {
					return _players[pid];
				}
			}

			function setPlayer(pid, val) {
					_players[pid] = val;
			}

			function getMetaProp(pid, prop) {
				if (_existy(_players[pid]) && _existy(_players[pid].meta)) {
					return _players[pid].meta[prop];
				}
			}

			function setMetaProp(validKeys) {
				return function(pid, prop, val) {
					if (validKeys.indexOf(prop) === -1) {
						throw new Error(prop + ' is not a valid prop for' + _type + ' meta info');
					}

					if (_existy(_players[pid] && _players[pid].meta)) {
						try {
							_players[pid].meta[prop] = val;
						}
						catch(e) {
							console.log('catch read only error:', e, 'prop', prop, 'val', val);
						}
					}
				}
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
			 * @private
			 * @ngdoc method
			 * @name _createMetaObj
			 * @methodOf iTT.service:html5PlayerManager
			 * @param {Object} base base object to copy from.
			 * @param {Object} props array of objects (properties) to set on the copy of the meta object.
			 * @returns {Object} returns copy of new meta object
			 */
			function createMetaObj(props, base) {
				var newMetaObj = angular.copy(base);
				newMetaObj.meta = angular.extend(newMetaObj.meta, props);
				return newMetaObj;
			}

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
				return getMetaProp(id, 'div');
			}

			function pauseOtherPlayers(pauseFn, getPlayerState) {
				return function(pid) {
					Object.keys(_players).forEach(function (playerId) {
						if (playerId !== pid) {
							var otherPlayerState = getPlayerState(playerId);
							if (_existy(otherPlayerState)) {
								if (otherPlayerState === 'playing') {
									pauseFn(playerId);
								}
							}
						}
					});
				}
			}

			/**
			 * @ngdoc method
			 * @name getInstance
			 * @methodOf iTT.service:html5PlayerManager
			 * @param {String} pid Unique ID
			 * @returns {Object} returns HTML5 video element
			 * @private
			 */
			function getInstance(predicate) {
				return function(pid) {
					if (predicate(pid) === true) {
						return getPlayer(pid).instance;
					}
				}
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
		}
	}


})();
