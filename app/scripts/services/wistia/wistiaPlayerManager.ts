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

const WISTIA_PLAYERSTATES = {
  'playing': 'playing',
  'paused': 'paused',
  'beforeplay': 'unstarted',
  'ended': 'ended'
};

//TODO refactor ittUtils into ES module
function _existy(x: any) {
  return x != null;
}



export class WistiaPlayerManager {
  private _players = {};
  private _mainPlayerId;
  public type = 'wistia';
  private base;
  public commonMetaProps;
  private _setMetaProps;
  private _getInstance;
  private _pauseOtherPlayers;
  private _resetPm;
  private wistiaMetaProps = {
    videoType: this.type,
    isMuted: false,
    vol: 0
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
    this._getInstance = this.base.getInstance(pid => _existy(pid) && this.getMetaProp(pid, 'ready') === true);
    this._pauseOtherPlayers = this.base.pauseOtherPlayers(this.pause, this.getPlayerState);
    this._resetPm = this.base.resetPlayerManager(angular.noop);
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

  getPlayerState(pid) {
    const instance = this.getInstance(pid);
    if (instance) {
      return WISTIA_PLAYERSTATES[instance.state()];
    }
  }

  getBufferedPercent() {
    /*
    it doesn't appear that wistia has ways to get
    info on buffered ranges, need to do more research.
     */
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

  resetPlayerManager() {
    this._resetPm()
  }

  freezeMetaProps() {}

  unFreezeMetaProps() {}

  getCurrentTime(pid): number | void {
    return this.invokeMethod(pid, 'time');
  }

  play(pid): void {
    this.invokeMethod(pid, 'play');
  }

  pause(pid): void {
    this.invokeMethod(pid, 'pause');
  }

  pauseOtherPlayers(pid): void {
    this._pauseOtherPlayers(pid);
  }

  seekTo(pid, t): void {
    this.invokeMethod(pid, 'time', t);
  }

  stop(pid) {

  }

  handleTimelineEnd(pid) {

  }

  toggleMute(pid) {
    const isMusted = this.getMetaProp(pid, 'isMuted');
    if (isMusted === false) {
      const lastVol = this.invokeMethod(pid, 'volume') * 100;
      this.setMetaProp(pid, 'vol', lastVol);
      this.setVolume(pid, 0);
    } else {
      this.setVolume(pid, this.getMetaProp(pid, 'vol'))
    }

    this.setMetaProp(pid, 'isMuted', !isMusted);
  }

  setVolume(pid, v) {
    this.invokeMethod(pid, 'volume', v / 100)
  }

  private invokeMethod(pid, method, val?) {
    const instance = this.getInstance(pid);
    if (_existy(instance)) {
      try {
        if (_existy(val)) {
          return instance[method](val);
        } else {
          return instance[method]();
        }
      } catch (e) {
        console.log('error trying', method, 'with', instance[method], 'error:', e);
      }
    }
  }

  private setPlayerDiv(pid: string, wistiaId: string) {
    return `
<div class="wistia_responsive_padding" style="padding:56.25% 0 28px 0;position:relative;">
  <div class="wistia_responsive_wrapper" style="height:100%;left:0;position:absolute;top:0;width:100%;">
    <div id="${pid}" class="wistia_embed wistia_async_${wistiaId}" style="height:100%;width:100%">&nbsp;</div>
  </div>
</div>`;
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
    this.base.setInstance(pid, wistiaInstance);
    this.attachEventListeners(wistiaInstance, pid);
    this.emitStateChange(pid, 6);
    this.setMetaProp(pid, 'duration', wistiaInstance.duration());
  }

  private attachEventListeners(instance, pid) {
    //arrow fn so 'this' is preserved
    //in the final closure
    const bindPid = (pid) => {
      return (fn, ev?) => {
        return fn.call(this, pid, ev);
      }
    };

    const boundPid = bindPid(pid);

    const wistiaEvents = {
      'play': (e) => boundPid(this.onPlay),
      'pause': (e) => boundPid(this.onPause),
    };

    Object.entries(wistiaEvents).forEach(([key, val]) => {
      instance.bind(key, val);
    });
  }

  private onSecondchange(pid, event) {
    console.log('second change?', event);
  }

  private onPlay(pid) {
    this.setMetaProp(pid, 'playerState', 1);
    this.emitStateChange(pid);
  }

  private onPause(pid) {
    this.setMetaProp(pid, 'playerState', 2);
    this.emitStateChange(pid);
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
