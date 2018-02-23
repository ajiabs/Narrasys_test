// @npUpgrade-playback-false
/**
 * Created by githop on 1/16/17.
 */


// ** Updated by Curve10 (JAB/EDD)
//    Feb 2018 
//

import {IMetaProps} from '../../../../interfaces';
import {commonMetaProps} from '../base-player-manager/index';
/**
 * @ngdoc service
 * @name iTT.service:playerManagerCommons
 * @description
 * Implements / exports common methods used across all player managers.
 * @property {Object} commonMetaProps public metaProps
 * @requires ittUtils
 *
 */


export interface IBasePlayerManager {
  commonMetaProps: IMetaProps;
  getPlayer(pid: string): any;
  setPlayer(pid: string, val: any): void;
  getMetaProp(pid: string, prop: string): any;
  setMetaProp(validKeys: () => {}): (pid: string, prop: string, val: any) => void;
  setInstance(pid: string, instance: object): void;
  createMetaObj(props: object, base: object): object;
  getMetaObj(pid: string): object;
  getPlayerDiv(pid: string): string;
  getInstance(predicate: () => boolean): (pid: string) => object;
  registerStateChangeListener(stateChangeListener: (stateChangeEvent: object) => void): void;
  unregisterStateChangeListener(cb: () => {}): void;
  getStateChangeListeners(): any[];
  pauseOtherPlayers(pauseFn: () => void, getPlayerState: () => number): (pid: string) => void;
  resetPlayerManager(destroyFn: () => void): () => void;
  renamePid(oldName: string, newName: string): void;
  handleTimelineEnd(fn: () => void): (pid: string) => void;
  predicate(pid) : boolean;
}

export class PlayerManagerCommons implements IBasePlayerManager {
  static Name = 'playerManagerCommons';
  static $inject = ['ittUtils'];
  
  constructor (
    private ittUtils,
    public subPlayerVariables
    ){
      // by testing for the custom variables, we insure that other, older instantiations of this don't fail.
    if (subPlayerVariables) {
      this._type = subPlayerVariables.type;
      this._players = subPlayerVariables.players;
    }
  }
  private _existy = this.ittUtils.existy;


 // return function (locals) {

 private _players;
 private _stateChangeCallbacks = [];
 private _type;



 /*
    var _players = locals.players;
    var _stateChangeCallbacks = [];
    var _type = locals.type;
    */


  /*
  const pm: IBasePlayerManager = {
      commonMetaProps,
      getPlayer,
      setPlayer,
      getMetaProp,
      setInstance,
      setMetaProp,
      createMetaObj,
      getMetaObj,
      getPlayerDiv,
      getInstance,
      registerStateChangeListener,
      unregisterStateChangeListener,
      getStateChangeListeners,
      pauseOtherPlayers,
      resetPlayerManager,
      renamePid,
      handleTimelineEnd
    };

      return pm;
    */

    commonMetaProps;

    getStateChangeListeners() {
      return this._stateChangeCallbacks;
    }

    getPlayer(pid) {
      if (this._existy(this._players[pid])) {
        return this._players[pid];
      }
    }

    setInstance(pid, instance): void {
      let playerObj = this.getPlayer(pid);
      playerObj.instance = instance;
    }

    setPlayer(pid, val) {
      this._players[pid] = val;
    }

    getMetaProp(pid, prop) {
      if (this._existy(this._players[pid]) && this._existy(this._players[pid].meta)) {
        return this._players[pid].meta[prop];
      }
    }

    setMetaProp(validKeys) {
      return function (pid, prop, val) {
        if (validKeys.indexOf(prop) === -1) {

          // throws a lot of seeminly expected errors.
          // throw new Error(prop + ' is not a valid prop for' + this._type + ' meta info');
        }

        if (this._existy(this._players[pid] && this._players[pid].meta)) {
          try {
            this._players[pid].meta[prop] = val;
          }
          catch (e) {
            console.log('catch read only error:', e, 'prop', prop, 'val', val);
          }
        }
      };
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
    getMetaObj(pid) {
      if (this._existy(this._players[pid]) && this._existy(this._players[pid].meta)) {
        return this._players[pid].meta;
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
    createMetaObj(props, base) {
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
    getPlayerDiv(id) {
      return this.getMetaProp(id, 'div');
    }

  pauseOtherPlayers(pauseFn, getPlayerState) {
    return function (pid) {

      if (this._players) {
        Object.keys(this._players).forEach((playerId) => {
          if (playerId !== pid) {
            var otherPlayerState = getPlayerState(playerId);
            if (this._existy(otherPlayerState)) {
              if (otherPlayerState === 'playing') {
                pauseFn(playerId);
              }
            }
          }
        });
      }
    };
  }


  predicate(pid) {
    return (this._existy(this.getPlayer(pid)) && this.getMetaProp(pid, 'ready') === true);
  };

    /**
     * @ngdoc method
     * @name getInstance
     * @methodOf iTT.service:playerManagerCommons
     * @param {String} pid Unique ID
     * @returns {Object} returns HTML5 video element
     * @private
     */
    /*
    getInstance(predicate) {
      return function (pid) {
        if (predicate(pid) === true) {
          return this.getPlayer(pid).instance;
        }
      };
    }
    */
   getInstance( pid ) {
    if (this.predicate(pid) === true) {
      return this.getPlayer(pid).instance;
    } else {
      // don't return anything which is a condition the code _existy is looking for when this fails.
    }
   }

    /**
     * @ngdoc method
     * @name #registerStateChangeListener
     * @methodOf iTT.service:playerManagerCommons
     * @param {Function} cb callback to fire
     * @returns {Void} returns void
     */
    registerStateChangeListener(cb) {
      if( !this._stateChangeCallbacks ) 
        return; // test;

      var len = this._stateChangeCallbacks.length;

      while (len--) {
        if (cb.toString() === this._stateChangeCallbacks[len].toString()) {
          return;
        }
      }

      this._stateChangeCallbacks.push(cb);
    }

    /**
     * @ngdoc method
     * @name #unregisterStateChangeListener
     * @methodOf iTT.service:playerManagerCommons
     * @param {Function} cb callback to unregister
     * @returns {Void} returns void.
     */
    unregisterStateChangeListener(cb) {
      this._stateChangeCallbacks = this._stateChangeCallbacks.filter( (fn)  =>{
        return fn.toString() !== cb.toString();
      });
    }

    /**
     * @ngdoc method
     * @name #resetPlayerManager
     * @methodOf iTT.service:playerManagerCommons
     * @description
     * Will destroy all instances of YT on the this._players map and reset it to an empty object.
     * @returns {Void} No return value.
     */
    resetPlayerManager(destroyFn) {
      return function () {
        angular.forEach(this._getPlayers(),  (pm, id) =>{
          this._destroyInstance(id, true, destroyFn);
        });
        this._players = {};
      };
    }

    renamePid(oldName, newName) {
      ittUtils.renameKey(oldName, newName, this._players);
    }

    handleTimelineEnd(fn) {
      return function (pid) {
        return fn(pid);
      };
    }

    /**
     * @ngdoc method
     * @name #destroyInstance
     * @methodOf iTT.service:playerManagerCommons
     * @description
     * Used to destroy YT instances and clear them from the this._players object
     * @param {String} pid The ID of the YT instance
     * @param {Boolean} [doRemove=false] optional param to optionally reset the instance in the this._players map.
     * @returns {Void} No return value.
     * @private
     */
    _destroyInstance(pid, doRemove, sideEffects) {
      if (!this._existy(doRemove)) {
        doRemove = false;
      }

      sideEffects(pid);

      if (doRemove === true) {
        this.setPlayer(pid, {});
      }
    }

    _getPlayers() {
      return this._players;
    }
  };