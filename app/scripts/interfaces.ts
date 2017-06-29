export {IMetaObj, IMetaProps} from './services/basePlayerManager/index';
export {IPlayerManager} from './services/basePlayerManager/index';
export {IDataSvc} from './services/dataSvc';
export {IValidationDisplay, IValidationSvc, IXFrameOptsResult} from './services/validation.svc';
export {TUrlFieldContexts} from './directives/ittUrlField';
export {IModelSvc} from './services/modelSvc';
export {IBasePlayerManager} from './services/basePlayerManager/playerManagerCommons';
export {IWistiaMetaProps, IWistiaPlayerManager} from './services/wistia/wistiaPlayerManager';
export {IWistiaUrlservice} from './services/wistia/wistiaUrlService';
export {IUploadData} from './services/uploadsService';
export {IEmailFields} from './directives/socialshare/ittSocialShare';
export {IAnnotators} from './directives/sxsAnnotatorAutocomplete';
export {IimageResize} from './services/imageResizeSvc';

/*
 it's nice to have the interface close to the method / object it is annotating. It's also nice to have a common
 point from where to import interfaces from.

 To accommodate both options above, if an interface is needed outside of the file it is defined in, import it here
 then re-export it. In the file that needs the interface, it can be imported from here, instead of the file where
 it was defined.
 */

type ILangformKeys = 'en' | 'es' | 'zh' | 'pt' | 'fr' | 'de' | 'it';

export type ILangForm = {
  [K in ILangformKeys]: string
};

export type Partial<T> = {
  [P in keyof T]?: T[P];
};

export interface IScriptLoader {
  load(...args:any[]): ng.IPromise<{}>;
}

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
