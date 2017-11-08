import {IMetaProps, IWistiaMetaProps} from '../../../interfaces';
import {existy, renameKey} from '../ittUtils';
import {commonMetaProps} from './index';

/**
 * Created by githop on 4/26/17.
 */

/*
 prior to v5.0.0 we simulated single inheritance with the
 playerManagerCommons service.

 With typescripe we can use actual inheritance to acheive the same
 pattern in a more straight forward manner.
 Eventually we could implement all the player managers as classes
 that extend this one.
 */

interface IPlayer {
  instance: any;
  meta: IMetaProps;
}

export abstract class BasePlayerManager {
  public type: string;
  protected players: { [pid: string]: IPlayer } = {};
  protected mainPlayerId: string;

  protected statechangeCallbacks = [];

  static createMetaObj(newProps: any): { instance: any, meta: any } {
    const metaObj = {
      instance: null,
      meta: Object.assign({}, commonMetaProps)
    };

    Object.assign(commonMetaProps, newProps);
    Object.assign(metaObj.meta, commonMetaProps);
    return metaObj;
  }

  protected getPlayer(pid: string): IPlayer {
    if (existy(this.players[pid])) {
      return this.players[pid];
    }
  }

  protected setInstance(pid: string, instance: any): void {
    const player = this.getPlayer(pid);
    if (existy(player)) {
      player.instance = instance;
    }
  }

  protected setPlayer(pid: string, val: any): void {
    this.players[pid] = val;
    // console.log('setPlayer', this.players[pid], pid);
  }

  //overload
  getMetaProp<K extends keyof IWistiaMetaProps>(pid: string, prop: K): IWistiaMetaProps[K];
  getMetaProp(pid: string, prop: any) {
    const player = this.getPlayer(pid);
    if (existy(player) && existy(player.meta)) {
      return player.meta[prop];
    }
  }

  setMetaProp<K extends keyof IWistiaMetaProps>(pid: string, prop: K, val: IWistiaMetaProps[K]): void;
  setMetaProp(pid: string, prop: string, val: any): void {
    if (existy(this.players[pid]) && this.players[pid].meta) {
      try {
        this.players[pid].meta[prop] = val;
      } catch (e) {
        console.log('catch read only error:', e, 'prop', prop, 'val', val);
      }
    }
  }

  getPlayerDiv(pid: string): string {
    return this.getMetaProp(pid, 'div');
  }

  //must be overridden
  getPlayerState(pid: string): string | number {
    return '';
  }
  //must be overridden
  pause(pid: string): void {
    //noop;
  }

  stop(pid: string) {
    //noop
  }

  freezeMetaProps(pid: string) { /* noop */ }

  unFreezeMetaProps(pid: string) { /* noop */ }

  pauseOtherPlayers(pid: string): void {
    Object.keys(this.players).forEach((playerId: string) => {
      if (playerId !== pid) {
        const otherPlayerState = this.getPlayerState(playerId);
        if (existy(otherPlayerState)) {
          if (otherPlayerState === 'playing') {
            this.pause(playerId);
          }
        }
      }
    });
  }

  registerStateChangeListener(cb: (statechangeEvent: object) => void): void {
    const found = this.statechangeCallbacks.find(listener => {
      return cb.toString() === listener.toString();
    });

    if (!found) {
      this.statechangeCallbacks.push(cb);
    }
  }

  unregisterStateChangeListener(cb: () => {}): void {
    this.statechangeCallbacks = this.statechangeCallbacks.filter(fn => {
      return fn.toString !== cb.toString();
    });
  }

  renamePid(oldName: string, newName: string) {
    renameKey(oldName, newName, this.players);
  }

  handleTimelineEnd(pid: string) {
    //noop;
  }

  resetPlayerManager() {
    Object.keys(this.players)
      .forEach(key => {
        this.destroyInstance(key, true);
      });
    this.players = {};
  }

  protected destroyInstance(pid: string, doRemove: boolean) {
    if (!existy(doRemove)) {
      doRemove = false;
    }

    this.destroySideEffects(pid);

    if (doRemove === true) {
      this.setPlayer(pid, {});
    }
  }

  protected destroySideEffects(pid: string) {
    //noop;
  }

}

