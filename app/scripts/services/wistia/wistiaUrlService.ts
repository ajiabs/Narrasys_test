import {IParsedMediaSrcObj, IUrlSubService} from '../../interfaces';
/**
 * Created by githop on 4/12/17.
 */

export interface IWistiaUrlservice extends IUrlSubService {
  extractId(input: string): string;
}

export class WistiaUrlService implements IWistiaUrlservice {
  public type = 'wistia';
  public mimetype = `video/x-${this.type}`;
  private embedUrl = 'http://fast.wistia.net/embed/iframe/';
  // private parser = new DOMParser();

  getMimeType() {
    return this.mimetype;
  }

  parseMediaSrc(mediaSrcArr) {
    return mediaSrcArr.reduce((pmo: IParsedMediaSrcObj, mediaSrc: string) => {
      if (WistiaUrlService.isWistia(mediaSrc)) {
        pmo.mediaSrcArr.push(mediaSrc);
      }
      return pmo;
    }, {type: this.type, mediaSrcArr: []});
  }

  //TODO: it looks like the embed code itself doesn't contain enough info to map it into a URL
  // need to know provider_url aka domain
  parseInput(input: string) {
    if (WistiaUrlService.isWistia(input)) {
      //not an embed code, must already be a URL
      if (!WistiaUrlService.isEmbed(input)) {
        return input;
      }
    }
  }

  extractId(input: string) {
    //simple url input for now
    if (WistiaUrlService.isWistia(input)) {
      return WistiaUrlService.parseIdfromUrl(input);
    }
  }

  canPlay(input) {
    return WistiaUrlService.isWistia(input);
  }

  getOutgoingUrl(url, startAt) {
    //use iframe embed url format.
    const params = `?autoplay=true&time=${startAt}`;
    const videoId = WistiaUrlService.parseIdfromUrl(url);
    const u = `${videoId}${params}`;
    return this.embedUrl + u;
  }

  // private parseIdFromEmbedCode(embedCode: string) {
  //   const doc = this.parser.parseFromString(embedCode, 'text/html');
  //   const classes = doc.getElementsByClassName('wistia_embed')[0].className;
  //   return classes.split('_').pop().split('_').pop();
  // }

  //expand eventually to work with embed codes as well as URLs
  private static isWistia(url: string) {
    const re: RegExp = /https?:\/\/(.+)?(wistia\.com|wi\.st)\/.*/;
    return re.test(url);
  }

  private static isEmbed(input: string) {
    return /<script/i.test(input);
  }

  private static parseIdfromUrl(url: string) {
    //id should be last in the path
    const path = url.split('/');
    return path[path.length - 1];
  }
}

