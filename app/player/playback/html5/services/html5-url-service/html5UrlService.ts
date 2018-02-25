// @npUpgrade-html5-false
/**
 * Created by githop on 11/4/16.
 */

/***********************************
 **** Updated by Curve10 (JAB/EDD)
 **** Feb 2018
 ***********************************/

export interface IHtml5UrlService {
  getMimeType(url);
  getOutgoingUrl(url, startAt);
  parseMediaSrc(mediaSrc);
  isHTML5VideoUrl(url);
  parseInput(url);
}


export class Html5UrlService implements IHtml5UrlService {
  static Name = 'html5UrlService'; // tslint:disable-line
  static $inject = ['ittUtils'];

  constructor (
    private ittUtils) {
  }

  private _type = 'html5';
  private _existy = this.ittUtils.existy;
  // return {
  //   type: _type,
  //   getMimeType: getMimeType,
  //   parseMediaSrc: parseMediaSrc,
  //   canPlay: isHTML5VideoUrl,
  //   parseInput: parseInput,
  //   getOutgoingUrl: getOutgoingUrl
  // };

  getMimeType(url) {
    return 'video/' + url.match(/(mp4|m3u8|webm)/)[0];
  }

  getOutgoingUrl(url, startAt) {
    if (this._existy(startAt) && startAt > 0) {
      url += '#t=' + startAt;
    }
    return url;
  }

  /**
   *
   * @param mediaSrc
   * @return mediaObj{type: String, mediaSrcArr: Array<String>}
   */
  parseMediaSrc(mediaSrc) {
    return mediaSrc.reduce( (parsedMediaObj, mediaSrc) => {
      if (this.isHTML5VideoUrl(mediaSrc)) {
        parsedMediaObj.mediaSrcArr.push(mediaSrc);
      }
      return parsedMediaObj;
    }, {type: this._type, mediaSrcArr: []});
  }

  isHTML5VideoUrl(url) {
    return /(.mp4|.m3u8|.webm)/.test(url);
  }

  parseInput(url) {
    if (this.isHTML5VideoUrl(url)) {
      return url;
    }
  }

}

