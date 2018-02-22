// @npUpgrade-playback-false
import {IParsedMediaSrcObj, IUrlService, IWistiaUrlservice} from '../../../../interfaces';
import { config } from '../../../../config';
/**
 * Created by githop on 11/3/16.
 */

//
// ** Updated by Curve10 (JAB/EDD)
//    Feb 2018
//


export interface IMasterAssetVideoObject {
  youtube: string[];
  mp4: string[];
  m3u8: string[];
  webm: string[];
  kaltura: string[];
  wistia: string[];
}

// ********** interface in app/interfaces.ts ************************ //
/*
export interface IUrlService {
  parseMediaSrcArr(mediaSrcArr: string[]): IParsedMediaSrcObj[];
  checkUrl(url: string): { type: string, mimeType: string };
  getOutgoingUrl(url: string, startAt: any): string | void;
  parseInput(input: string): string;
  isVideoUrl(url: string): boolean;
  resolveVideo(videoAsset?): any;
}
*/

export class URLService implements IUrlService {

  static Name = 'urlService';
  static $inject = ['youtubeUrlService', 'html5UrlService', 'kalturaUrlService', 'wistiaUrlService'];

// export default function urlService(youtubeUrlService, html5UrlService, kalturaUrlService, wistiaUrlService: IWistiaUrlservice) {

  constructor (
    private youtubeUrlService,
    private html5UrlService,
    private kalturaUrlService,
    private wistiaUrlService: IWistiaUrlservice
  ){}

  private _urlSubServices = {
    youtube: this.youtubeUrlService,
    html5: this.html5UrlService,
    kaltura: this.kalturaUrlService,
    wistia: this.wistiaUrlService
  };


  // ******************************* public methods ************************* //
  parseInput(input) {
    var type = this.checkUrl(input).type;
    if (type.length > 0) {
      return this._urlSubServices[type].parseInput(input);
    }
  }

  /**
   *
   * @param mediaSrcArr
   * @return parsedMediaSrcArr Array<{type: string, mediaSrcArr: Array<String>}>
   */
  parseMediaSrcArr(mediaSrcArr: string[]): IParsedMediaSrcObj[] {
    return Object.keys(this._urlSubServices).reduce( (parsedMediaSrcArr, urlSrv) => {
      var parsedMediaSrcObj = this._urlSubServices[urlSrv].parseMediaSrc(mediaSrcArr);
      if (parsedMediaSrcObj.mediaSrcArr.length > 0) {
        parsedMediaSrcArr.push(parsedMediaSrcObj);
      }
      return parsedMediaSrcArr;
    }, []);
  }

  isVideoUrl(url) {
    return this.checkUrl(url).type.length > 0;
  }

  checkUrl(url) {
    var context = this;
    return Object.keys(this._urlSubServices).reduce( (map, urlSrv) => {
      if (context._urlSubServices[urlSrv].canPlay(url)) {
        map.type = urlSrv;
        map.mimeType = context._urlSubServices[urlSrv].getMimeType(url);
      }
      return map;
    }, {type: '', mimeType: ''});
  }

  getOutgoingUrl(url, startAt) {
    var type = this.checkUrl(url).type;
    if (type.length > 0) {
      return this._urlSubServices[type].getOutgoingUrl(url, startAt);
    }
  }

  resolveVideo(videoAsset) {
    var videoObject: IMasterAssetVideoObject = {
      youtube: [],
      mp4: [],
      webm: [],
      m3u8: [],
      kaltura: [],
      wistia: []
    };

    var extensionMatch = /\.(\w+)$/;

    if (videoAsset.alternate_urls) {
      // Sort them out by file extension first:
      for (var i = 0; i < videoAsset.alternate_urls.length; i++) {
        if (videoAsset.alternate_urls[i].match(/youtube/)) {
          if (this.youtubeUrlService.embeddableYoutubeUrl(videoAsset.alternate_urls[i])) {
            videoObject.youtube.push(this.youtubeUrlService.embeddableYoutubeUrl(videoAsset.alternate_urls[i]));
          }
        } else {
          videoObject[videoAsset.alternate_urls[i].match(extensionMatch)[1]].push(videoAsset.alternate_urls[i]);
        }
      }

      //remove after migration
      if (videoAsset.you_tube_url && this.youtubeUrlService.embeddableYoutubeUrl(videoAsset.you_tube_url)) {
        videoObject.youtube.push(this.youtubeUrlService.embeddableYoutubeUrl(videoAsset.you_tube_url));
      }
      //end remove after migration

      // now by size:
      // most video files come from the API with their width and height in the URL as blahblah123x456.foo:
      var videoPixelSize = /(\d+)x(\d+)\.\w+$/; // [1]=w, [2]=h
      angular.forEach(Object.keys(videoObject),  (key) => {
        videoObject[key] = videoObject[key].sort( (a, b) => {
          // There shouldn't ever be cases where we're comparing two non-null filenames, neither of which have a
          // WxH portion, but fill in zero just in case so we can at least continue rather than erroring out
          var aTest = a.match(videoPixelSize) || [0, 0];
          var bTest = b.match(videoPixelSize) || [0, 0];
          return aTest[1] - bTest[1]; // compare on width
        });
      });
    }

    // Old-school episodes, or linked youtube assets
    // Use the you_tube_url,  if it's not present in alternate_urls:
    if (videoObject.youtube.length === 0) {
      if (videoAsset.url) {
        if (this.youtubeUrlService.embeddableYoutubeUrl(videoAsset.url)) {
          videoObject.youtube = [this.youtubeUrlService.embeddableYoutubeUrl(videoAsset.url)];
        }
      }
      //remove after migration
      if (videoAsset.you_tube_url) {
        if (this.youtubeUrlService.embeddableYoutubeUrl(videoAsset.you_tube_url)) {
          videoObject.youtube = [this.youtubeUrlService.embeddableYoutubeUrl(videoAsset.you_tube_url)];
        }
      }
      //end remove after migration
    }

    // Same for other types (we used to put the .mp4 in videoAsset.url and just swapped out the extension for other types, which was silly, which is why we stopped doing it, but some old episodes never got updated)
    if (!videoAsset.alternate_urls) {
      angular.forEach(["mp4", "webm", "m3u8"],  (ext) => {
        if (videoObject[ext].length === 0 && !(videoAsset.url.match(/youtube/))) {
          videoObject[ext].push(videoAsset.url.replace("mp4", ext));
        }
      });
    }

    if (config.youtube.disabled) {
      delete videoObject.youtube;
    }

    // Only Safari supports m3u8 at the moment
    var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
    if (!isSafari) {
      delete videoObject.m3u8;
    }

    // Chrome won't allow the same video to play in two windows, which interferes with our 'escape the iframe' button.
    // Therefore we trick Chrome into thinking it is not the same video:
    var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    if (isChrome) {
      var tDelimit;
      var tParam = "t=" + new Date().getTime();
      angular.forEach(["mp4", "webm"],  (ext) => {
        if (videoObject[ext].length > 0) {
          for (var i = 0; i < videoObject[ext].length; i++) {
            tDelimit = videoObject[ext][i].match(/\?/) ? "&" : "?";
            videoObject[ext][i] = videoObject[ext][i] + tDelimit + tParam;
          }
        }
      });
    }

    if (this.kalturaUrlService.canPlay(videoAsset.url)) {
      videoObject.kaltura.push(videoAsset.url);
    }

    if (this.wistiaUrlService.canPlay(videoAsset.url)) {
      videoObject.wistia.push(videoAsset.url);
    }

    videoAsset.urls = videoObject;
    videoAsset.mediaSrcArr = this._resolveMediaSrcArray(videoObject);
    return videoAsset;
  }

  private _resolveMediaSrcArray(videoObject) {
    return Object.keys(videoObject).reduce( (mediaSrcArr, mediaSrc) => {
      mediaSrcArr = mediaSrcArr.concat(videoObject[mediaSrc]);
      return mediaSrcArr;
    }, []);
  }
}


