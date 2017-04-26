import {IBasePlayerManager, IPlayerManager, IScriptLoader, IWistiaUrlservice, IMetaProps, IMetaObj} from '../../interfaces';
import {PLAYERSTATES} from '../playbackService/index';
import {BasePlayerManager} from '../basePlayerManager/basePlayerManager';
/**
 * Created by githop on 4/12/17.
 */

declare global {
  interface Window {
    wistiaInitQueue: object[];
  }
}

export interface IWistiaPlayerManager extends IPlayerManager {

}

interface IWistiaMetaProps extends IMetaProps {
  videoType: string;
  isMuted: boolean;
  vol: number;
}

interface IWistiaMetaObj extends IMetaObj {
  instance: any;
  meta: IWistiaMetaProps;
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

export class WistiaPm extends BasePlayerManager {
  public type = 'wistia';
  private wistiaMetaProps = {
    videoType: this.type,
    isMuted: false,
    vol: 0
  };
  constructor(
    private wistiaScriptLoader: IScriptLoader,
    private wistiaUrlService: IWistiaUrlservice) {
    super();
    Object.assign(this.metaProps, this.wistiaMetaProps);
  }

  static setPlayerDiv(pid: string, wistiaId: string): string {
    //videoFoam is set on init to make video responsive.
    return `<div id="${pid}" class="wistia_embed wistia_async_${wistiaId}">&nbsp;</div>`;
  }

  seedPlayerManager(id: string, mainPlayer: boolean, mediaSrcArr: string[]): void {
    if (_existy(this.getPlayer(id)) && this.getMetaProp(id, 'startAtTime') > 0) {
      return;
    }

    if (mainPlayer) {
      this.players = {};
      this.mainPlayerId = id;
    }

    const wistiaId = this.wistiaUrlService.extractId(mediaSrcArr[0]);

    const newProps = {
      mainPlayer: mainPlayer,
      div: WistiaPm.setPlayerDiv(id, wistiaId),
      wistiaId: wistiaId
    };

    this.setPlayer(id, this.createMetaObj(newProps));
    console.log('player!', this.getPlayer(id));
  }

  create(pid: string): void {
    this.createWpInstance(pid)
      .then(_ => {/* noop */});
  }

}


export class WistiaPlayerManager implements IWistiaPlayerManager {
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
    this._pauseOtherPlayers = this.base.pauseOtherPlayers(this.pause.bind(this), this.getPlayerState.bind(this));
    this._resetPm = this.base.resetPlayerManager(angular.noop);
  }

  seedPlayerManager(id: string, mainPlayer: boolean, mediaSrcArr: string[]): void {
    if (_existy(this.getPlayer(id)) && this.getMetaProp(id, 'startAtTime') > 0) {
      return;
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

    this.setPlayer(id, this.createMetaObj(newProps, this.wistiaMetaObj));
    console.log('player!', this.getPlayer(id));
  }

  create(pid: string): void {
    this.createWpInstance(pid)
      .then(_ => {/* noop */});
  }

  getPlayerState(pid: string): string {
    const instance = this.getInstance(pid);
    if (instance) {
      return WISTIA_PLAYERSTATES[instance.state()];
    }
  }

  getBufferedPercent(pid: string): number {
    /*
    it doesn't appear that wistia has ways to get
    info on buffered ranges, need to do more research.
     */
    return 0;
  }

  registerStateChangeListener(fn: () => {}): void {
    return this.base.registerStateChangeListener(fn);
  }

  unregisterStateChangeListener(fn: () => {}): void {
    return this.base.unregisterStateChangeListener(fn);
  }

  getMetaProp<K extends keyof IWistiaMetaProps>(pid: string, prop: K): IWistiaMetaProps[K] {
    return this.base.getMetaProp(pid, prop);
  }

  setMetaProp<K extends keyof IWistiaMetaProps>(pid: string, prop: K, val: IWistiaMetaProps[K]): void {
    return this._setMetaProps(pid, prop, val);
  }

  getPlayerDiv(id: string): string {
    return this.base.getPlayerDiv(id);
  }

  renamePid(oldName: string, newName: string): void {
    return this.base.renamePid(oldName, newName);
  }

  resetPlayerManager(): void {
    this._resetPm();
  }

  freezeMetaProps(pid: string) { /* noop */ }

  unfreezeMetaProps(pid: string) { /* noop */ }

  getCurrentTime(pid: string): number | string | void {
    return this.invokeMethod(pid, 'time');
  }

  play(pid: string): void {
    this.invokeMethod(pid, 'play');
  }

  pause(pid: string): void {
    this.invokeMethod(pid, 'pause');
  }

  pauseOtherPlayers(pid: string): void {
    this._pauseOtherPlayers(pid);
  }

  seekTo(pid: string, t: number): void {
    this.invokeMethod(pid, 'time', t);
  }

  stop(pid: string) {
    //noop
  }

  setSpeed(pid: string, rate: number) {
    //noop
    this.invokeMethod(pid, 'playbackRate', rate);
  }

  handleTimelineEnd(pid: string) {
    //noop
  }

  toggleMute(pid: string): void {
    const isMuted = this.getMetaProp(pid, 'isMuted');
    if (isMuted === false) {
      const lastVol = this.invokeMethod(pid, 'volume') * 100;
      this.setMetaProp(pid, 'vol', lastVol);
      this.setVolume(pid, 0);
    } else {
      this.setVolume(pid, this.getMetaProp(pid, 'vol'));
    }

    this.setMetaProp(pid, 'isMuted', !isMuted);
  }

  setVolume(pid: string, v: number): void {
    this.invokeMethod(pid, 'volume', v / 100);
  }

  private invokeMethod(pid: string, method: string, val?: any): any {
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

  private setPlayerDiv(pid: string, wistiaId: string): string {
    //videoFoam is set on init to make video responsive.
    return `<div id="${pid}" class="wistia_embed wistia_async_${wistiaId}">&nbsp;</div>`;
  }

  private getPlayer(pid: string): object {
    return this.base.getPlayer(pid);
  }

  private setPlayer(pid: string, val: any): void {
    return this.base.setPlayer(pid, val);
  }

  private createMetaObj(props: object, base: {instance: null, meta: object}): IWistiaMetaObj {
    return this.base.createMetaObj(props, base);
  }

  private createWpInstance(pid: string): ng.IPromise<void> {
    const isEmbed = this._mainPlayerId !== pid;
    const wistiaEmbedOptions = {
      playbar: isEmbed,
      videoFoam: true,
      fullscreenButton: isEmbed,
      playButton: isEmbed,
      settingsControl: isEmbed,
      smallPlayButton: isEmbed,
      volumeControl: isEmbed

    };
    return this.wistiaScriptLoader.load(pid)
      .then(_ =>  {
        window.wistiaInitQueue = window.wistiaInitQueue || [];
        window.wistiaInitQueue.push({
          id: pid,
          options: wistiaEmbedOptions,
          onReady: (video) => this.onReady(pid, video)
        });
      });
  }

  private onReady(pid: string, wistiaInstance: any) {
    this.base.setInstance(pid, wistiaInstance);
    this.attachEventListeners(wistiaInstance, pid);
    this.emitStateChange(pid, 6);
    this.setMetaProp(pid, 'duration', wistiaInstance.duration());
  }

  private attachEventListeners(instance: any, pid: string) {
    //arrow fn so 'this' is preserved
    //in the final closure
    const bindPid = (pid) => {
      return (fn, ...ev) => {
        return fn.call(this, pid, ...ev);
      };
    };

    const boundPid = bindPid(pid);

    const wistiaEvents = {
      'play': (e) => boundPid(this.onPlay),
      'pause': (e) => boundPid(this.onPause),
      'seek': (currentTime, lastTime) => boundPid(this.onSeek, currentTime, lastTime)
    };

    Object.entries(wistiaEvents).forEach(([key, val]) => {
      instance.bind(key, val);
    });
  }

  private onSeek(pid: string, currentTime: number, lastTime: number): void {
    this.setMetaProp(pid, 'time', currentTime);
  }

  private onPlay(pid: string): void {
    this.setMetaProp(pid, 'playerState', 1);
    this.emitStateChange(pid);
  }

  private onPause(pid: string): void {
    this.setMetaProp(pid, 'playerState', 2);
    this.emitStateChange(pid);
  }

  private formatStateChangeEvent(state: string, emitterId: string): {emitterId: string, state: string} {
    return {
      emitterId,
      state: PLAYERSTATES[state]
    };
  }

  private emitStateChange(pid: string, forceState?: number): void {
    let state;

    if (_existy(forceState)) {
      state = forceState;
    } else {
      state = this.getMetaProp(pid, 'playerState');
    }

    this.base.getStateChangeListeners().forEach(cb => {
      cb(this.formatStateChangeEvent(state, pid));
    });
  }

  private getInstance(pid: string): any {
    return this._getInstance(pid);
  }

}
