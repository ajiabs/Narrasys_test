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

			// console.log('locals', locals);
			var _players = locals.players;
			var _stateChangeCallbacks = locals.stateChangeCallbacks;
			return {
				getPlayer: getPlayer,
				setPlayer: setPlayer,
				getMetaProp: getMetaProp,
				setMetaProp: setMetaProp,
				registerStateChangeListener: registerStateChangeListener,
				unregisterStateChangeListener: unregisterStateChangeListener
			};

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

			function setMetaProp(pid, prop, val) {
				if (_existy(_players[pid] && _players[pid].meta)) {
					_players[pid].meta[prop] = val;
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
