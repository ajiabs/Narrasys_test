import {IDataSvc} from './services/dataSvc';
import {IValidationDisplay, IValidationSvc, IXFrameOptsResult} from './services/validation.svc';
import {TUrlFieldContexts} from './directives/ittUrlField';
import {IModelSvc} from './services/modelSvc';
/**
 * Created by githop on 4/11/17.
 */
export interface ILangform {
  en: boolean;
  es?: boolean;
  zh?: boolean;
  pt?: boolean;
  fr?: boolean;
  de?: boolean;
  it?: boolean;
}

export interface IScriptLoader {
  load(...args:any[]): ng.IPromise<{}>;
}

export type Partial<T> = {
  [P in keyof T]?: T[P];
};

export interface ILinkValidationMessage {
  showInfo?: boolean;
  message?: string;
  doInfo?: boolean;
  url?: string;
}

export interface ILinkValidFields {
  404: ILinkValidationMessage;
  301: ILinkValidationMessage;
  url: ILinkValidationMessage;
  mixedContent: ILinkValidationMessage;
  iframeHeaders: ILinkValidationMessage;
  kaltura: ILinkValidationMessage | null;
  youtube: ILinkValidationMessage | null;
  html5: ILinkValidationMessage | null;
  error: ILinkValidationMessage | null;
}


export interface IUrlService {
  parseMediaSrcArr(mediaSrcArr: string[]): IParsedMediaSrcObj[];
  checkUrl(url: string): { type: string, mimeType: string };
  getOutgoingUrl(url: string): string | void;
  parseInput(input: string): string;
  isVideoUrl(url: string): boolean;
  resolveVideo(): any;
}export interface IParsedMediaSrcObj {
  type: 'kaltura' | 'youtube' | 'html5' | 'wistia';
  mediaSrcArr: string[];
}

export interface IUrlSubService {
  type: string;
  getMimeType(): string;
  parseMediaSrc(mediaSrcArr: string[]): IParsedMediaSrcObj;
  parseInput(input: string): string;
  canPlay(input: string): boolean;
  getOutgoingUrl(url: string, startAt: number): string | void;
}

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
  create(id:string): void;
  pause(pid: string): void;
  play(pid: string): void;
  seekTo(pid: string, t: number): void;
  getCurrentTime(pid:string): number | string | void;
  getPlayerState(pid: string): string;
  getBufferedPercent(pid:string): number;
  toggleMute(pid: string): void;
  setVolume(pid: string, v: number): void;
  setSpeed(pid: string, speed: number): void;
  freezeMetaProps(pid: string): void;
  unFreezeMetaProps(pid: string): void;
  stop(pid: string): void;
  handleTimelineEnd(pid: string): void;
}

/*
 it's nice to have the interface close to the method / object it is annotating. It's also nice to have a common
 point from where to import interfaces from.

 To accommodate both options above, if an interface is needed outside of the file it is defined in, import it here
 then re-export it. In the file that needs the interface, it can be imported from here, instead of the file where
 it was defined.
 */

export {IDataSvc, IValidationDisplay, IValidationSvc, IXFrameOptsResult, TUrlFieldContexts, IModelSvc};


export {
  IAnnotators,
  IBasePlayerManager,IDataSvc,IMetaObj,
  IMetaProps, IValidationDisplay, IValidationSvc,IWistiaPlayerManager,
  IWistiaMetaProps,
  IWistiaUrlservice, IXFrameOptsResult, TUrlFieldContexts, IModelSvc};
