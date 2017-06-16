/**
 * Created by githop on 1/16/17.
 */

/**
 * @ngdoc service
 * @name iTT.service:playerManagerCommons
 * @description
 * Implements / exports common methods used across all player managers.
 * @property {Object} commonMetaProps public metaProps
 * @requires ittUtils
 *
 */


playerManagerCommons.$inject = ['ittUtils'];

export default function playerManagerCommons(ittUtils) {
  var _existy = ittUtils.existy;
  return function (locals) {

    var _players = locals.players;
    var _stateChangeCallbacks = [];
    var _type = locals.type;

    var commonMetaProps = {
      mainPlayer: false,
      playerState: '-1',
      div: '',
      ready: false,
      startAtTime: 0,
      hasResumedFromStartAt: false,
      duration: 0,
      time: 0,
      hasBeenPlayed: false,
      bufferedPercent: 0,
      timeMultiplier: 1,
      resetInProgress: false,
      autoplay: false,
      volume: 100,
      muted: false
    };

    return {
      commonMetaProps: commonMetaProps,
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
      getStateChangeListeners: getStateChangeListeners,
      pauseOtherPlayers: pauseOtherPlayers,
      resetPlayerManager: resetPlayerManager,
      renamePid: renamePid,
      handleTimelineEnd: handleTimelineEnd
    };

    function getStateChangeListeners() {
      return _stateChangeCallbacks;
    }

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
      return function (pid, prop, val) {
        if (validKeys.indexOf(prop) === -1) {
          throw new Error(prop + ' is not a valid prop for' + _type + ' meta info');
        }

        if (_existy(_players[pid] && _players[pid].meta)) {
          try {
            _players[pid].meta[prop] = val;
          }
          catch (e) {
            console.log('catch read only error:', e, 'prop', prop, 'val', val);
          }
        }
      }
    }

    /**
     * @ngdoc method
     * @name #getMetaObj
     * @methodOf iTT.service:playerManagerCommons
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
     * @methodOf iTT.service:playerManagerCommons
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
     * @methodOf iTT.service:playerManagerCommons
     * @description
     * returns an HTML string with the ID from the input param
     * @param {String} id the ID of the player
     * @return {String} the HTML string to be used by ittVideo
     */
    function getPlayerDiv(id) {
      return getMetaProp(id, 'div');
    }

    function pauseOtherPlayers(pauseFn, getPlayerState) {
      return function (pid) {
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
     * @methodOf iTT.service:playerManagerCommons
     * @param {String} pid Unique ID
     * @returns {Object} returns HTML5 video element
     * @private
     */
    function getInstance(predicate) {
      return function (pid) {
        if (predicate(pid) === true) {
          return getPlayer(pid).instance;
        }
      }
    }

    /**
     * @ngdoc method
     * @name #registerStateChangeListener
     * @methodOf iTT.service:playerManagerCommons
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
     * @methodOf iTT.service:playerManagerCommons
     * @param {Function} cb callback to unregister
     * @returns {Void} returns void.
     */
    function unregisterStateChangeListener(cb) {
      _stateChangeCallbacks = _stateChangeCallbacks.filter(function (fn) {
        return fn.toString() !== cb.toString();
      });
    }

    /**
     * @ngdoc method
     * @name #resetPlayerManager
     * @methodOf iTT.service:playerManagerCommons
     * @description
     * Will destroy all instances of YT on the _players map and reset it to an empty object.
     * @returns {Void} No return value.
     */
    function resetPlayerManager(destroyFn) {
      return function () {
        angular.forEach(getPlayers(), function (pm, id) {
          _destroyInstance(id, true, destroyFn);
        });
        _players = {};
      }
    }

    function renamePid(oldName, newName) {
      ittUtils.renameKey(oldName, newName, _players);
    }

    function handleTimelineEnd(fn) {
      return function (pid) {
        return fn(pid);
      }
    }

    /**
     * @ngdoc method
     * @name #destroyInstance
     * @methodOf iTT.service:playerManagerCommons
     * @description
     * Used to destroy YT instances and clear them from the _players object
     * @param {String} pid The ID of the YT instance
     * @param {Boolean} [doRemove=false] optional param to optionally reset the instance in the _players map.
     * @returns {Void} No return value.
     * @private
     */
    function _destroyInstance(pid, doRemove, sideEffects) {
      if (!_existy(doRemove)) {
        doRemove = false;
      }

      sideEffects(pid);

      if (doRemove === true) {
        setPlayer(pid, {});
      }
    }
  }
}


