/**
 * Created by githop on 6/28/17.
 */

export interface IPlayerManager {
  type: string;
  getMetaProp(pid: string, prop: string): any;
  setMetaProp(pid: string, prop: string, val: any): void;
  getPlayerDiv(pid: string): string;
  pauseOtherPlayers(pid: string): void;
  registerStateChangeListener(stateChangeListener: (stateChangeEvent: object) => void): void;
  unregisterStateChangeListener(cb: () => {}): void;
  resetPlayerManager(): void;
  renamePid(oldName: string, newName: string): void;
  seedPlayerManager(id: string, mainPlayer: boolean, mediaSrcArr: string[]): any;
  create(id: string): void;
  pause(pid: string): void;
  play(pid: string): void;
  seekTo(pid: string, t: number): void;
  getCurrentTime(pid: string): number | string | void;
  getPlayerState(pid: string): string;
  getBufferedPercent(pid: string): number;
  toggleMute(pid: string): void;
  setVolume(pid: string, v: number): void;
  setSpeed(pid: string, speed: number): void;
  freezeMetaProps(pid: string): void;
  unFreezeMetaProps(pid: string): void;
  stop(pid: string): void;
  handleTimelineEnd(pid: string): void;
}

export interface IMetaProps {
  mainPlayer: boolean;
  playerState: string | number;
  div: string;
  ready: boolean;
  startAtTime: number;
  hasResumedFromStartAt: boolean;
  duration: number;
  time: number;
  hasBeenPlayed: boolean;
  bufferedPercent: number;
  timeMultiplier: number;
  resetInProgress: boolean;
  autoplay: boolean;
  volume: number;
  muted: boolean;
}

export interface IMetaObj {
  instance: any;
  meta: IMetaProps;
}

export const commonMetaProps: IMetaProps = {
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

