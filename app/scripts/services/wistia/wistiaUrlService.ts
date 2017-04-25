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

  getMimeType() {
    return this.mimetype;
  }

  parseMediaSrc(mediaSrcArr) {
    return mediaSrcArr.reduce((pmo: IParsedMediaSrcObj, mediaSrc: string) => {
      if (this.isWistiaUrl(mediaSrc)) {
        pmo.mediaSrcArr.push(mediaSrc);
      }
      return pmo;
    }, {type: this.type, mediaSrcArr: []});
  }

  //refactor to work with embed codes and urls
  parseInput(input: string) {
    if (this.isWistiaUrl(input)) {
      return input;
    }
  }

  extractId(input: string) {
    //simple url input for now
    if (this.isWistiaUrl(input)) {
      return this.parseIdfromUrl(input);
    }
  }

  canPlay(input) {
    return this.isWistiaUrl(input);
  }

  getOutgoingUrl(url, startAt) {
    //noop
  }

  //expand eventually to work with embed codes as well as URLs
  private isWistiaUrl(url: string) {
    var re: RegExp = /https?:\/\/(.+)?(wistia\.com|wi\.st)\/.*/;
    return re.test(url);
  }

  private parseIdfromUrl(url: string) {
    let a = document.createElement('a');
    a.href = url;

    //id should be last in the path
    let path = a.pathname.split('/');
    return path[path.length -1];
  }
}


