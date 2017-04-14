import {IBasePlayerManager, IScriptLoader, IWistiaUrlservice} from "../../interfaces";
import {PLAYERSTATES} from "../playbackService/index";
/**
 * Created by githop on 4/12/17.
 */

declare global {
  interface Window {
    _wq: any;
  }
}

export interface IWistiaPlayerManager extends IBasePlayerManager {

}

//TODO refactor ittUtils into ES module
function _existy(x: any) {
  return x != null;
}



export class WistiaPlayerManager implements IWistiaPlayerManager {
  private _players = {};
  private _mainPlayerId;
  public type = 'wistia';
  private base;
  public commonMetaProps;
  private _setMetaProps;
  private _getInstance;
  private wistiaMetaProps = {
    videoType: this.type
  };

  private wistiaMetaObj = {
    instance: null,
    meta: {}
  };

  static $inject = ['playerManagerCommons', 'wistiaScriptLoader', 'wistiaUrlService', 'ittUtils'];
  constructor(
    public playerManagerCommons,
    private wistiaScriptLoader: IScriptLoader,
    private wistiaUrlService: IWistiaUrlservice,
    private ittUtils) {

    this.base = <IBasePlayerManager> playerManagerCommons({players: this._players, type: this.type});

    Object.assign(this.wistiaMetaObj.meta, this.wistiaMetaProps, this.base.commonMetaProps);
    const validKeys = Object.keys(this.wistiaMetaObj.meta);
    this._setMetaProps = this.base.setMetaProp(validKeys);

    const getInstance = this.base.getInstance(pid => _existy(pid) && this.getMetaProp(pid, 'ready') === true);
    this._getInstance = getInstance;
  }

  seedPlayerManager(id: string, mainPlayer: boolean, mediaSrcArr: string[]) {
    if (_existy(this.getPlayer(id)) && this.getMetaProp(id, 'startTime') > 0) {
      return
    }

    if (mainPlayer) {
      this._players = {};
      this._mainPlayerId = id;
    }

    const wistiaId = this.wistiaUrlService.extractId(mediaSrcArr[0]);

    const newProps = {
      mainPlayer: mainPlayer,
      div: this.setPlayerDiv(id, wistiaId),
      wistiaId: wistiaId
    };

    this.setPlayer(id, this.createMetaObj(newProps, this.wistiaMetaObj))
  }

  create(pid: string) {
    this.createWpInstance(pid)
      .then((success) => {

      });
  }

  getPlayerState() {

  }

  getBufferedPercent() {

  }

  registerStateChangeListener(fn) {
    return this.base.registerStateChangeListener(fn);
  }

  unregisterStateChangeListener(fn) {
    return this.base.unregisterStateChangeListener(fn);
  }

  getMetaProp(pid: string, prop: string) {
    return this.base.getMetaProp(pid, prop);
  }

  setMetaProp(pid: string, prop: string, val: any) {
    return this._setMetaProps(pid, prop, val);
  }

  getPlayerDiv(id) {
    return this.base.getPlayerDiv(id);
  }

  renamePid(oldName, newName) {
    return this.base.renamePid(oldName, newName)
  }

  freezeMetaProps() {}


  getCurrentTime(pid) {
    if (_existy(pid)) {
      return 0;
    }
  }

  private setPlayerDiv(pid: string, wistiaId: string) {
    return `<div id="${pid}" class="wistia_embed wistia_async_${wistiaId}">&nbsp;</div>`;
  }

  private getPlayer(pid) {
    return this.base.getPlayer(pid);
  }

  private setPlayer(pid, val) {
    return this.base.setPlayer(pid, val);
  }

  private createMetaObj(props, base) {
    return this.base.createMetaObj(props, base);
  }

  private createWpInstance(pid: string) {
    return this.wistiaScriptLoader.load(pid)
      .then(_ =>  {
        window._wq  = window._wq || [];
        window._wq.push({
          id: pid,
          onReady: (video) => this.onReady(pid, video)
        });
      });
  }

  private onReady(pid, wistiaInstance) {
    console.log('wistia ready!', wistiaInstance);
    this.base.setInstance(pid, wistiaInstance);
    this.attachEventListeners(wistiaInstance, pid);
    this.emitStateChange(pid, 6);
  }

  private attachEventListeners(instance, pid) {
    const wistiaEvents = {
      'pause': this.onPause.bind(this),
      'play': this.onPlay.bind(this)
    };

    wistiaEvents
  }

  private onPlay(event) {

  }

  private onPause(event) {

  }

  private formatStateChangeEvent(state, emitterId) {
    return {
      emitterId,
      state: PLAYERSTATES[state]
    }
  }

  private emitStateChange(pid, forceState?) {
    let state;

    if (forceState) {
      state = forceState
    } else {
      state = this.getMetaProp(pid, 'playerState');
    }

    this.base.getStateChangeListeners().forEach(cb => {
      cb(this.formatStateChangeEvent(state, pid));
    });
  }

  private getInstance(pid) {
    return this._getInstance(pid);
  }

}
