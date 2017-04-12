import {IParsedMediaSrcObj, IUrlSubService} from "../../interfaces";
/**
 * Created by githop on 4/12/17.
 */


export class WistiaUrlService implements IUrlSubService {
  public type = 'wistia';
  public mimetype = `video/x-${this.type}`;

  getMimeType() {
    return this.mimetype;
  }

  parseMediaSrc(mediaSrcArr) {
    return mediaSrcArr.reduce((pmo: IParsedMediaSrcObj, mediaSrc: string) => {
      if (this.isWistiaUrl(mediaSrc)) {
        pmo.mediaSrcArr.push(mediaSrc);
      }
      return pmo;
    }, {type: this.type, mediaSrcArr: []})
  }

  parseInput(input) {
    return input;
  }

  canPlay(input) {
    return this.isWistiaUrl(input);
  }

  getOutgoingUrl(url, startAt) {

  }

  //expand eventually to work with embed codes as well as URLs
  private isWistiaUrl(url: string) {
    var re: RegExp = /https?:\/\/(.+)?(wistia\.com|wi\.st)\/.*/;
    return re.test(url);
  }
}


