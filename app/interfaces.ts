export { IAnalyticsSvc } from './player/services/analytics/analytics.service';
export { IEpisodeEditService } from './episode/services/episodeEdit.service';
export { IEpisodeTheme } from './episode/services/episodeTheme.service';
export { IUploadsService } from './shared/services/uploadsService';
export { ILinkValidationMessage, ILinkValidFields } from './player/services/validation/validation.service';
export { IAnnotator, IAnnotators } from './input-fields/components/annotator-autocomplete/sxsAnnotatorAutocomplete';
export { ITimelineSvc } from './timeline/services/timelineSvc/timelineSvc';
export { IMetaObj, IMetaProps } from './playback/services/base-player-manager/index';
export { IPlayerManager } from './playback/services/base-player-manager/index';
export { IDataSvc } from './shared/services/dataSvc/dataSvc';
export { IValidationDisplay, IValidationSvc, IXFrameOptsResult } from './player/services/validation/validation.service';
export { TUrlFieldContexts } from './input-fields/components/npUrlField';
export { IModelSvc } from './shared/services/modelSvc/modelSvc';
export { IBasePlayerManager } from './playback/services/player-manager-commons/playerManagerCommons';
export { IWistiaMetaProps, IWistiaPlayerManager } from './wistia/services/wistia-player-manager/wistiaPlayerManager';
export { IWistiaUrlservice } from './wistia/services/wistia-url-service/wistiaUrlService';
export { IUploadData } from './shared/services/uploadsService';
export { IEmailFields } from './stories/components/socialshare/ittSocialShare';
export { IimageResize } from './shared/services/imageResizeSvc';
/*
 it's nice to have the interface close to the method / object it is annotating. It's also nice to have a common
 point from where to import interfaces from.

 To accommodate both options above, if an interface is needed outside of the file it is defined in, import it here
 then re-export it. In the file that needs the interface, it can be imported from here, instead of the file where
 it was defined.
 */

export type ILangformKeys = 'en' | 'es' | 'zh' | 'pt' | 'fr' | 'de' | 'it';
export type ILangForm = {
  [K in ILangformKeys]?: string
};

export type Partial<T> = {
  [P in keyof T]?: T[P];
};

export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

export interface IScriptLoader {
  load(...args:any[]): ng.IPromise<{}>;
}

export interface IUrlService {
  parseMediaSrcArr(mediaSrcArr: string[]): IParsedMediaSrcObj[];
  checkUrl(url: string): { type: string, mimeType: string };
  getOutgoingUrl(url: string): string | void;
  parseInput(input: string): string;
  isVideoUrl(url: string): boolean;
  resolveVideo(): any;
}

export interface IParsedMediaSrcObj {
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
