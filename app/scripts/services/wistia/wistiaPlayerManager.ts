import { IMetaProps, IPlayerManager, IScriptLoader, IWistiaUrlservice} from '../../interfaces';
import { PLAYERSTATES } from '../playbackService/index';
import { BasePlayerManager } from '../basePlayerManager/basePlayerManager';
import {existy} from '../ittUtils';
/**
 * Created by githop on 4/12/17.
 */

declare global {
  interface Window { // tslint:disable-line
    wistiaInitQueue: any[];
  }
}

export interface IWistiaMetaProps extends IMetaProps {
  videoType: 'wistia';
  lastVol: number;
}

const WISTIA_PLAYERSTATES = {
  'playing': 'playing',
  'paused': 'paused',
  'beforeplay': 'unstarted',
  'ended': 'ended'
};

const wistiaMetaProps = {
  lastVol: 100
};

export interface IWistiaPlayerManager extends IPlayerManager {
  destroySideEffects(pid: string): any;
}

/*
  wistia PM with inheritance
 */
export class WistiaPlayerManager extends BasePlayerManager implements IWistiaPlayerManager {
  public type = 'wistia';
  static $inject = ['wistiaScriptLoader', 'wistiaUrlService'];
  constructor(
    private wistiaScriptLoader: IScriptLoader,
    private wistiaUrlService: IWistiaUrlservice) {
    super();
  }

  static setPlayerDiv(pid: string, wistiaId: string): string {
    //videoFoam is set on init to make video responsive.
    return `<div id="${pid}" class="wistia_embed wistia_async_${wistiaId}">&nbsp;</div>`;
  }

  static formatStateChangeEvent(state: string, emitterId: string): {emitterId: string, state: string} {
    return {
      emitterId,
      state: PLAYERSTATES[state]
    };
  }

  seedPlayerManager(id: string, mainPlayer: boolean, mediaSrcArr: string[]): void {
    if (existy(this.getPlayer(id)) && this.getMetaProp(id, 'startAtTime') > 0) {
      return;
    }

    if (mainPlayer) {
      this.players = {};
      this.mainPlayerId = id;
    }

    const wistiaId = this.wistiaUrlService.extractId(mediaSrcArr[0]);

    const newProps = {
      mainPlayer,
      div: WistiaPlayerManager.setPlayerDiv(id, wistiaId),
      wistiaId,
      videoType: this.type,
      ...wistiaMetaProps
    };

    this.setPlayer(id, WistiaPlayerManager.createMetaObj(newProps));
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

  getCurrentTime(pid: string): number | string | void {
    return this.invokeMethod(pid, 'time');
  }

  play(pid: string): void {
    this.invokeMethod(pid, 'play');
  }

  pause(pid: string): void {
    this.invokeMethod(pid, 'pause');
  }

  seekTo(pid: string, t: number): void {
    this.invokeMethod(pid, 'time', t);
  }

  setSpeed(pid: string, rate: number) {
    //noop
    this.invokeMethod(pid, 'playbackRate', rate);
  }

  toggleMute(pid: string): void {
    const isMuted = this.getMetaProp(pid, 'muted');
    if (isMuted === false) {
      this.setMetaProp(pid, 'lastVol', this.getMetaProp(pid, 'volume'));
      this.setVolume(pid, 0);
    } else {
      this.setVolume(pid, this.getMetaProp(pid, 'lastVol'));
    }

    this.setMetaProp(pid, 'muted', !isMuted);
  }

  setVolume(pid: string, v: number): void {
    this.invokeMethod(pid, 'volume', v / 100);
    this.setMetaProp(pid, 'volume', v);
  }

  destroySideEffects(pid: string) {
    //noop;
  }

  private invokeMethod(pid: string, method: string, val?: any): any {
    const instance = this.getInstance(pid);
    if (existy(instance)) {
      try {
        if (existy(val)) {
          return instance[method](val);
        } else {
          return instance[method]();
        }
      } catch (e) {
        console.log('error trying', method, 'with', instance[method], 'error:', e);
      }
    }
  }

  private getInstance(pid: string): any {
    if (existy(this.getPlayer(pid)) && this.getMetaProp(pid, 'ready') === true) {
      return this.getPlayer(pid).instance;
    }
  }

  private createWpInstance(pid: string): ng.IPromise<void> {

    const isEmbed = this.mainPlayerId !== pid;

    const wistiaEmbedOptions = {
      playbar: isEmbed,
      videoFoam: true,
      fullscreenButton: isEmbed,
      controlsVisibleOnLoad: isEmbed,
      playbackRateControl: isEmbed,
      playButton: isEmbed,
      settingsControl: isEmbed,
      qualityControl: isEmbed,
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
    this.setInstance(pid, wistiaInstance);
    this.attachEventListeners(wistiaInstance, pid);
    this.emitStateChange(pid, 6);
    this.setMetaProp(pid, 'duration', wistiaInstance.duration());
  }

  private attachEventListeners(instance: any, pid: string) {
    //arrow fn so 'this' is preserved
    //in the final closure
    const bindPid = (playerId) => {
      return (fn, ...ev) => {
        return fn.call(this, playerId, ...ev);
      };
    };

    const boundPid = bindPid(pid);

    const wistiaEvents = {
      'play': (e) => boundPid(this.onPlay),
      'pause': (e) => boundPid(this.onPause),
      // 'seek': (currentTime, lastTime) => boundPid(this.onSeek, currentTime, lastTime),
      'end': () => boundPid(this.onEnd),
      'timechange': (e) => boundPid(this.onTimechange, e)
    };

    Object.entries(wistiaEvents).forEach(([key, val]) => {
      instance.bind(key, val);
    });
  }

  private onEnd(pid) {
    this.setMetaProp(pid, 'playerState', 0);
    this.emitStateChange(pid);
  }

  private onTimechange(pid, timechange) {
    // check for drift and correct if necessary
    const curTime = this.getMetaProp(pid, 'time');
    if (curTime > timechange) {
      this.setMetaProp(pid, 'time', timechange);
    }
  }

  // private onSeek(pid: string, currentTime: number, lastTime: number): void {
  //   // this.setMetaProp(pid, 'playerState', 3);
  //   // this.emitStateChange(pid);
  //   console.log('on seek!', this.getPlayerState(pid));
  // }

  private onPlay(pid: string): void {
    this.setMetaProp(pid, 'playerState', 1);
    this.emitStateChange(pid);
  }

  private onPause(pid: string): void {
    this.setMetaProp(pid, 'playerState', 2);
    this.emitStateChange(pid);
  }

  private emitStateChange(pid: string, forceState?: number): void {
    let state;

    if (existy(forceState)) {
      state = forceState;
    } else {
      state = this.getMetaProp(pid, 'playerState');
    }

    this.statechangeCallbacks.forEach(cb => {
      cb(WistiaPlayerManager.formatStateChangeEvent(state, pid));
    });
  }

}

