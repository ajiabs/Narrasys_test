import {ILinkStatus} from '../models';
/**
 * Created by githop on 5/2/17.
 */

interface IXFrameOptsResult {
  x_frame_options: string;
  location?: string;
  noEmbed: boolean;
}
export interface IValidationSvc {
  checkXFrameOpts(url: string): ng.IPromise<IXFrameOptsResult>;
  handleXFrameOptionsHeader(url: string, header: string): boolean;
  mixedContent(viewVal: string, displayObj): boolean;
  validateUrl(viewVal:string, displayObj): boolean;
  xFrameOpts(viewVal: string, displayObj, cachedResults?: ILinkStatus): ng.IPromise<{location?: string, noEmbed: boolean}>;
}
export class ValidationService {

  static $inject = ['$http', '$location', '$q', 'authSvc', 'config', 'ittUtils', 'urlService'];
  constructor(private $http: ng.IHttpService,
              private $location: ng.ILocationService,
              private $q: ng.IQService,
              private authSvc,
              private config,
              private ittUtils,
              private urlService) {}


  checkXFrameOpts(url: string): ng.IPromise<IXFrameOptsResult> {
    const encodedUrl = encodeURIComponent(url);
    //HTTP methods could one day be implemented in a parent class.
    return this.SANE_GET('/x_frame_options_proxy?url=' + encodedUrl)
      .then(result => this.handleSuccess(result))
      .then(result => this.canEmbed(result, url))
      .catch(e => ValidationService.handleErrors(e));
  }

  handleXFrameOptionsHeader(url: string, header: string): boolean {
    let noEmbed = true;
    switch (true) {
      case /SAMEORIGIN/i.test(header):
        let currentOrigin = this.$location.host();
        let parseInputUrl = document.createElement('a');
        parseInputUrl.href = url;
        //check our origin
        if (currentOrigin === parseInputUrl.hostname) {
          noEmbed = false;
        }
        break;
      case /ALLOW-FROM/i.test(header):
        //check if we're on the list
        //split on comma to get CSV array of strings; e.g: ["ALLOW-FROM: <url>", " ALLOW-FROM: <url>", ...]
        const xFrameArr = header.split(',');
        currentOrigin = this.$location.host();
        angular.forEach(xFrameArr, function (i) {
          const url = i.trim().split(' ')[1];
          const aElm = document.createElement('a');
          aElm.href = url;
          if (currentOrigin === aElm.hostname) {
            noEmbed = false;
          }
        });
        break;
      case /DENY/i.test(header):
        // do nothing
        break;
      case /null/.test(header):
        //ticket to ride
        noEmbed = false;
        break;
    }
    return noEmbed;
  }

  mixedContent(viewVal, displayObj): boolean {
    if (this.ittUtils.existy(viewVal) && /^http:\/\//.test(viewVal)) {
      //mixed content detected!
      displayObj.validatedFields['mixedContent'] = {message: 'Mixed Content Detected', showInfo: true};
      return true;
    } else {
      displayObj.validatedFields['mixedContent'] = {message: '', showInfo: false};
      return false;
    }
  }

  validateUrl(viewVal:string, displayObj): boolean {
    if (viewVal === '' && !ValidationService.emailOrPlaceholder(viewVal)) {
      displayObj.validatedFields['url'] = {showInfo: true, message: 'Url cannot be blank'};
      return false;
    } else if (this.urlService.isVideoUrl(viewVal) || this.ittUtils.isValidURL(viewVal) || ValidationService.emailOrPlaceholder(viewVal)) {
      displayObj.validatedFields['url'] = {showInfo: false};
      return true;
    } else {
      displayObj.validatedFields['url'] = {showInfo: true, message: viewVal + ' is not a valid URL'}; //jshint ignore:line
      return false;
    }
  }

  xFrameOpts(viewVal: string, displayObj, cachedResults?: ILinkStatus) {
    if (cachedResults != null) {
      return this.$q((resolve) => {
        let ret = {
          noEmbed: this.handleXFrameOptionsHeader(viewVal, cachedResults.x_frame_options)
        };
        return resolve(this.handleXframeOptsObj(viewVal, ret, displayObj));
      });
    }

    //bail out if empty or link to youtube/kaltura/html5 video, mixed content, email or placeholder val
    if (viewVal === '' || this.urlService.isVideoUrl(viewVal) || /^http:\/\//.test(viewVal) || ValidationService.emailOrPlaceholder(viewVal)) {
      return this.$q(function (resolve) {
        displayObj.validatedFields['xFrameOpts'] = {showInfo: false};
        return resolve({noEmbed: false, location: null});
      });
    }

    return this.checkXFrameOpts(viewVal)
    //xFrameOptsObj will have at least x_frame_options field and could have response_code and location fields
      .then(xFrameOptsObj => this.handleXframeOptsObj(viewVal, xFrameOptsObj, displayObj));
  }

  private handleXframeOptsObj(viewVal: string, xFrameOptsObj, displayObj) {
  let tipText = '';
  //check for a new URL if we followed a redirect on the server.
  if (this.ittUtils.existy(xFrameOptsObj.location)) {
    tipText = viewVal + ' redirected to ' + xFrameOptsObj.location;
    displayObj.validatedFields['301'] = {
      showInfo: true,
      message: tipText,
      doInfo: true,
      url: xFrameOptsObj.location
    };
  }

  if (this.ittUtils.existy(xFrameOptsObj.response_code) && xFrameOptsObj.response_code === 404) {
    tipText = viewVal + ' cannot be found';
    displayObj.validatedFields['404'] = {showInfo: true, message: tipText};
    return this.$q.reject('404');
  }

  if (xFrameOptsObj.noEmbed) {
    tipText = 'Embedded link template is disabled because ' + viewVal + ' does not allow iframing';
    displayObj.validatedFields['xFrameOpts'] = {showInfo: true, message: tipText, doInfo: true};
  } else {
    displayObj.validatedFields['xFrameOpts'] = {showInfo: false};
  }

  //override noEmbed with error
  if (xFrameOptsObj.error_message) {
    displayObj.validatedFields['xFrameOpts'] = {
      showInfo: true,
      message: viewVal + ' cannot be embedded: ' + xFrameOptsObj.error_message
    };
  }
  return {noEmbed: xFrameOptsObj.noEmbed, location: xFrameOptsObj.location};
}

  private static emailOrPlaceholder(val: string): boolean {
  return /mailto:/.test(val) || val === 'https://';
}

  private static handleErrors(error) {
    //true to set _noEmbed to make links no embeddable
    console.warn('xFrameOpts error:', error);
    return {noEmbed: true};
  }


  private SANE_GET(path) {
    return this.authSvc.authenticate()
      .then(() => {
        return this.$http.get(this.config.apiDataBaseUrl + path)
          .then((resp) => {
            return resp.data;
          });
      });
  }

  private handleSuccess(result) {
    //result could have response_code, location, or x_frame_options fields.
    //not null, so normalize string
    if (this.ittUtils.existy(result.x_frame_options)) {
      result.x_frame_options = result.x_frame_options.toUpperCase();
    }
    // console.log('x-frame-opts: ', result);
    return result;
  }

  private canEmbed(result, url) {
    result.noEmbed = this.handleXFrameOptionsHeader(url, result.x_frame_options);
    return result;
  }
}
