import {IMetaProps} from './playerManagerCommons';
/**
 * Created by githop on 4/26/17.
 */

function _existy(x: any): boolean {
  return x != null;
}

function renameKey(oldName, newName, obj) {
  if (obj.hasOwnProperty(oldName) && !obj.hasOwnProperty(newName) && oldName !== newName) {
    obj[newName] = obj[oldName];
    delete obj[oldName];
  }
}

interface IPlayer {
  instance: any;
  meta: IMetaProps;
}

/*
 prior to v5.0.0 we simulated single inheritance with the
 playerManagerCommons service.

 With typescripe we can use actual inheritance to acheive the same
 pattern in a more straight forward manner.
 Eventually we could implement all the player managers as classes
 that extend this one.
*/

export abstract class BasePlayerManager {
  public type: string;
  protected players: {[pid: string]: IPlayer};
  protected mainPlayerId: string;

  protected metaProps: IMetaProps = {
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
    autoplay: false
  };

  protected metaObj: IPlayer = {
    instance: null,
    meta: this.metaProps
  };
  private statechangeCallbacks = [];

  constructor() {
    //foo
  }

  protected createMetaObj(newProps: any) {
    let newMetaObj = Object.assign({}, this.metaObj);
    return Object.assign(newMetaObj.meta, newProps, this.metaProps);
  }

  protected getPlayer(pid: string): IPlayer {
    if (_existy(this.players[pid])) {
      return this.players[pid];
    }
  }

  protected setInstance(pid:string, instance:any): void {
    let player = this.getPlayer(pid);
    player.instance = instance;
  }

  protected setPlayer(pid: string, val: any): void {
    this.players[pid] = val;
  }

  getMetaProp<P extends keyof IMetaProps>(pid: string, prop: P): IMetaProps[P] {
    let player = this.getPlayer(pid);
    if (_existy(player) && _existy(player.meta)) {
      return player.meta[prop];
    }
  }

  setMetaProp<P extends keyof IMetaProps>(pid: string, prop: P, val: IMetaProps[P]): void {
    let validKeys = Object.keys(this.metaProps);
    if (validKeys.indexOf(prop) === -1) {
      throw new Error(`${prop} is not a valid prop for ${this.type} meta info`);
    }

    if (_existy(this.players[pid]) && this.players[pid].meta) {
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


  pauseOtherPlayers(pid: string): void {
    Object.keys(this.players).forEach((playerId: string) => {
      if (playerId !== pid) {
        let otherPlayerState = this.getPlayerState(playerId);
        if (_existy(otherPlayerState)) {
          if (otherPlayerState === 'playing') {
            this.pause(playerId);
          }
        }
      }
    });
  }

  registerStateChangeListener(cb: (statechangeEvent: object) => void): void {
    let found = this.statechangeCallbacks.find(listener => {
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

  renamePid(oldName, newName) {
    renameKey(oldName, newName, this.players);
  }

  handleTimelineEnd(pid: string) {
    //noop;
  }

  protected destroyInstance(pid, doRemove) {
    //foo
  }


}


class Pm extends BasePlayerManager {
  type = 'wistia';
  private wistiaMetaProps = {
    videoType: this.type,
    isMuted: false,
    vol: 0
  };
  constructor() {
    super();
    Object.assign(this.metaProps, this.wistiaMetaProps);

  }


}

let test = new Pm();
