import {IBasePlayerManager} from "./services/basePlayerManager/playerManagerCommons";
import {IAnnotators} from "./directives/sxsAnnotatorAutocomplete";
import {IWistiaPlayerManager} from "./services/wistia/wistiaPlayerManager";
import {IWistiaUrlservice} from "./services/wistia/wistiaUrlService";
/**
 * Created by githop on 4/11/17.
 */

export interface IScriptLoader {
  load(...args:any[]): ng.IPromise<{}>
}

export interface IUrlService {
  parseMediaSrcArr(mediaSrcArr: string[]): IParsedMediaSrcObj
  checkUrl(url: string): { type: string, mimeType: string }
  getOutgoingUrl(url: string): string | void
  parseInput(input: string): string
  isVideoUrl(url: string): boolean
  resolveVideo(): any
}

export interface IParsedMediaSrcObj {
  type: 'kaltura' | 'youtube' | 'html5' | 'wistia'
  mediaSrcArr: string[]
}

export interface IUrlSubService {
  type: string
  getMimeType(): string
  parseMediaSrc(mediaSrcArr: string[]): IParsedMediaSrcObj,
  parseInput(input: string): string
  canPlay(input: string): boolean
  getOutgoingUrl(url: string, startAt: number): string | void
}

/*
  it's nice to have the interface close to the method / object it is annotating. It's also nice to have a common
  point from where to import interfaces from.

  To accommodate both options above, if an interface is needed outside of the file it is defined in, import it here
  then re-export it. In the file that needs the interface, it can be imported from here, instead of the file where
  it was defined.
 */

export {IBasePlayerManager, IAnnotators, IWistiaPlayerManager, IWistiaUrlservice}



