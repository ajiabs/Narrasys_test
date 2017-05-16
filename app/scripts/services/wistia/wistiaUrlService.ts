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
  private parser = new DOMParser();

  getMimeType() {
    return this.mimetype;
  }

  parseMediaSrc(mediaSrcArr) {
    return mediaSrcArr.reduce((pmo: IParsedMediaSrcObj, mediaSrc: string) => {
      if (this.isWistia(mediaSrc)) {
        pmo.mediaSrcArr.push(mediaSrc);
      }
      return pmo;
    }, {type: this.type, mediaSrcArr: []});
  }

  //TODO: it looks like the embed code itself doesn't contain enough info to map it into a URL, need to know provider_url aka domain
  parseInput(input: string) {
    if (this.isWistia(input)) {
      //not an embed code, must already be a URL
      if (!this.isEmbed(input)) {
        return input;
      }
      return input
    }
  }

  extractId(input: string) {
    //simple url input for now
    if (this.isWistia(input)) {
      return this.parseIdfromUrl(input);
    }
  }

  canPlay(input) {
    return this.isWistia(input);
  }

  getOutgoingUrl(url, startAt) {
    //use iframe embed url format.
    let params = `?autoplay=true&time=${startAt}`;
    let videoId = this.parseIdfromUrl(url);
    let u = `${videoId}${params}`;
    return this.embedUrl + u;
  }

  private parseIdFromEmbedCode(embedCode: string) {
    let doc = this.parser.parseFromString(embedCode, 'text/html');
    let classes = doc.getElementsByClassName('wistia_embed')[0].className;
    return classes.split('_').pop().split('_').pop();
  }

  //expand eventually to work with embed codes as well as URLs
  private isWistia(url: string) {
    const re: RegExp = /https?:\/\/(.+)?(wistia\.com|wi\.st)\/.*/;
    return re.test(url);
  }

  private isEmbed(input: string) {
    return /<script/i.test(input);
  }

  private parseIdfromUrl(url: string) {
    //id should be last in the path
    let path = url.split('/');
    return path[path.length -1];
  }
}


