import {IDataSvc} from './services/dataSvc';
/**
 * Created by githop on 4/11/17.
 */
export interface ILangform {
  en: boolean
  es?: boolean
  zh?: boolean
  pt?: boolean
  fr?: boolean
  de?: boolean
  it?: boolean
}

export interface IAnnotator {
  name: { en: string }
  annotation_image_id: string
  key?: string
  imageUrl?: string
}

export interface IAnnotators {
  [key: string]: IAnnotator
}

export interface ILinkValidationMessage {
  showInfo: boolean
  message?: string
  doInfo?: boolean
  url?: string
}

export interface ILinkValidFields {
  404: ILinkValidationMessage
  301: ILinkValidationMessage
  url: ILinkValidationMessage
  mixedContent: ILinkValidationMessage
  xFrameOpts: ILinkValidationMessage;
  [key: string]: ILinkValidationMessage;
}

export {IDataSvc};
