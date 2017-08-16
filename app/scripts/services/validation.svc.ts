import { ILinkStatus } from '../models';
import { ILinkValidFields, Partial, TUrlFieldContexts } from '../interfaces';

/**
 * Created by githop on 5/2/17.
 */
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

export interface IXFrameOptsResult {
  urlStatus: ILinkStatus;
  canEmbed: boolean;
  location?: string;
  context?: TUrlFieldContexts;
}

//the object returned from the x_frame_options proxy
interface IXFrameOptsResponse {
  x_frame_options: string | null;
  content_security_policy: string | null;
  location?: string;
  err?: string;
  response_code: number;
}

//validatedFields is a prop on the ittUrlField directive controller but any object
//that implements the interface would work.
export interface IValidationDisplay {
  validatedFields: Partial<ILinkValidFields>;
}

export interface IValidationSvc {
  checkXFrameOpts(url: string): ng.IPromise<IXFrameOptsResult>;
  urlIsEmbeddable(url: string, cspOrXFrameHeader: any): boolean;
  mixedContent(viewVal: string, displayObj: IValidationDisplay): boolean;
  mixedContentUrl(url: string): boolean;
  validateUrl(viewVal: string, displayObj: IValidationDisplay): boolean;
  inspectHeadersAsync(viewVal: string,
                      displayObj: IValidationDisplay,
                      cachedResults?: ILinkStatus,
                      context?: TUrlFieldContexts): ng.IPromise<IXFrameOptsResult>;
}

export class ValidationService implements IValidationSvc {
  static $inject = ['$http', '$location', '$q', 'authSvc', 'config', 'ittUtils', 'urlService'];

  constructor(
    private $http: ng.IHttpService,
    private $location: ng.ILocationService,
    private $q: ng.IQService,
    private authSvc,
    private config,
    private ittUtils,
    private urlService) {
  }

  static parseCSP(csp: string): object {
    if (csp != null) {
      return csp.split(';').reduce(
        (result: object, directive: string) => {
          const directiveSet = directive.trim().split(/\s+/g);
          const key = directiveSet.shift();
          if (key) {
            result[key] = directiveSet;
          }
          return result;
        },
        {}
      );
    }
  }

  checkXFrameOpts(url: string): ng.IPromise<IXFrameOptsResult> {
    const encodedUrl = encodeURIComponent(url);
    //HTTP methods could one day be implemented in a parent class.
    return this.SANE_GET('/x_frame_options_proxy?url=' + encodedUrl)
      .then((resp: IXFrameOptsResponse) => this.handleSuccess(resp))
      .then((result: IXFrameOptsResponse) => this.canEmbed(result, url))
      .catch(e => ValidationService.handleErrors(e));
  }

  urlIsEmbeddable(url: string, cspOrXFrameHeader: any): boolean {
    const xFrameCanEmbed = this.xFrameHeaderCanEmbed(url, cspOrXFrameHeader.x_frame_options);
    const cspCanEmbed = this.cspCanEmbed(url, cspOrXFrameHeader.content_security_policy);

    return xFrameCanEmbed && cspCanEmbed;
  }


  mixedContent(viewVal: string, displayObj: IValidationDisplay): boolean {
    if (this.mixedContentUrl(viewVal)) {
      //mixed content detected!
      displayObj.validatedFields['mixedContent'] = { message: 'Mixed Content Detected', showInfo: true };
      return true;
    } else {
      displayObj.validatedFields['mixedContent'] = { message: '', showInfo: false };
      return false;
    }
  }

  mixedContentUrl(url: string): boolean {
    return this.ittUtils.existy(url) && /^http:\/\//.test(url);
  }

  validateUrl(viewVal: string, displayObj: IValidationDisplay): boolean {
    const isValidVideoUrl = this.urlService.isVideoUrl(viewVal)
      || this.ittUtils.isValidURL(viewVal)
      || ValidationService.emailOrPlaceholder(viewVal);

    if (viewVal === '' && !ValidationService.emailOrPlaceholder(viewVal)) {
      displayObj.validatedFields['url'] = { showInfo: true, message: 'Url cannot be blank' };
      return false;
    } else if (isValidVideoUrl) {
      displayObj.validatedFields['url'] = { showInfo: false };
      return true;
    } else {
      displayObj.validatedFields['url'] = { showInfo: true, message: viewVal + ' is not a valid URL' };
      return false;
    }
  }

  inspectHeadersAsync(viewVal: string,
                      displayObj: IValidationDisplay,
                      cachedResults?: ILinkStatus,
                      context?: TUrlFieldContexts): ng.IPromise<IXFrameOptsResult> {
    if (cachedResults != null) {
      return this.$q((resolve) => {

        const xFrameOptsObj: IXFrameOptsResult = {
          canEmbed: this.urlIsEmbeddable(viewVal, cachedResults),
          location: cachedResults.location,
          urlStatus: {
            content_security_policy: cachedResults.content_security_policy,
            x_frame_options: cachedResults.x_frame_options,
            response_code: cachedResults.response_code,
            err: cachedResults.err
          } as ILinkStatus
        };

        const obj = this.handleXframeOptsObj(viewVal, xFrameOptsObj, displayObj) as IXFrameOptsResult;
        return resolve(obj);
      });
    }

    //bail out if empty or link to youtube/kaltura/html5 video, mixed content, email or placeholder val
    if (viewVal === '' || this.urlService.isVideoUrl(viewVal) || ValidationService.emailOrPlaceholder(viewVal)) {
      return this.$q((resolve) => {
        displayObj.validatedFields['iframeHeaders'] = { showInfo: false };
        const stubXFOR: IXFrameOptsResult = {
          canEmbed: true,
          location: null,
          urlStatus: <ILinkStatus> {
            content_security_policy: null, x_frame_options: null, response_code: null, err: null
          }
        };
        if (this.urlService.checkUrl(viewVal).type === 'kaltura') {
          stubXFOR.location = this.urlService.parseInput(viewVal);
        }

        return resolve(stubXFOR);
      });
    }

    return this.checkXFrameOpts(viewVal)
    //xFrameOptsObj will have at least x_frame_options field and could have response_code and location fields
      .then(
        (xFOResult: IXFrameOptsResult) => this.handleXframeOptsObj(viewVal, xFOResult, displayObj) as IXFrameOptsResult
      );
  }

  private static emailOrPlaceholder(val: string): boolean {
    return /mailto:/.test(val) || val === 'https://';
  }

  private static handleErrors(error) {
    console.warn('xFrameOpts error:', error);
    return { canEmbed: false };
  }

  private cspCanEmbed(url: string, csp: string): boolean {
    //frame-ancestors: null -> true
    //frame-ancestors: 'self' - url contains host domain -> true
    //frame-ancestors: sources-list contains host domain -> true
    //frame-ancestors: 'none' -> false

    if (csp == null) {
      return true;
    }

    const cspObj = ValidationService.parseCSP(csp);
    const ancestorSourceList = cspObj['frame-ancestors'];

    if (ancestorSourceList == null || ancestorSourceList.length === 0) {
      return true;

    } else {

      const currentHost = this.$location.host();

      //handle 'self', 'none' or a frame-ancestor list with only 1 member.
      if (ancestorSourceList.length === 1) {
        const onlyAncestor = ancestorSourceList[0];
        //if CSP is self and the URL is our own, or the only frame-ancestor comes from our own
        if ((onlyAncestor === '\'self\'' && url.includes(currentHost)) || onlyAncestor.includes(currentHost)) {
          return true;
        }

        if (onlyAncestor === '\'none\'') {
          return false;
        }
      }

      //loop over list of sources
      for (const source of ancestorSourceList) {
        if (source.includes(currentHost)) {
          return true;
        }
      }


      return false;
    }
  }

  private xFrameHeaderCanEmbed(url: string, header: string): boolean {
    let canEmbed = false;
    if (header == null || header === 'null') {
      return true;
    }

    switch (true) {
      case /SAMEORIGIN/i.test(header):
        let currentOrigin = this.$location.host();
        const parseInputUrl = document.createElement('a');
        parseInputUrl.href = url;
        //check our origin
        if (currentOrigin === parseInputUrl.hostname) {
          canEmbed = true;
        }
        break;
      case /ALLOW-FROM/i.test(header):
        //check if we're on the list
        //split on comma to get CSV array of strings; e.g: ["ALLOW-FROM: <url>", " ALLOW-FROM: <url>", ...]
        const xFrameArr = header.split(',');
        currentOrigin = this.$location.host();
        angular.forEach(xFrameArr, (i) => {
          const url = i.trim().split(' ')[1];
          const aElm = document.createElement('a');
          aElm.href = url;
          if (currentOrigin === aElm.hostname) {
            canEmbed = true;
          }
        });
        break;
      case /DENY/i.test(header):
        //do nothing
        break;
    }
    return canEmbed;
  }

  private handleXframeOptsObj(
    viewVal: string, XFOResult: IXFrameOptsResult, // tslint:disable-line
    displayObj: IValidationDisplay): IXFrameOptsResult | ng.IPromise<'404'> {
    let tipText = '';

    if (this.ittUtils.existy(XFOResult.location)) {
      tipText = viewVal + ' redirected to ' + XFOResult.location;
      displayObj.validatedFields['301'] = {
        showInfo: true,
        message: tipText,
        doInfo: true
      };
    }

    if (this.ittUtils.existy(XFOResult.urlStatus.response_code) && XFOResult.urlStatus.response_code === 422) {
      tipText = viewVal + ' cannot be found';
      displayObj.validatedFields['404'] = { showInfo: true, message: tipText };
      return this.$q.reject('404');
    }

    if (XFOResult.urlStatus.err != null && XFOResult.urlStatus.response_code !== 999) {

      displayObj.validatedFields['iframeHeaders'] = {
        showInfo: true,
        message: viewVal + ' cannot be embedded: ' + XFOResult.urlStatus.err
      };

    } else if (!XFOResult.canEmbed && !this.mixedContentUrl(viewVal)) {
      tipText = 'Embedded link template is disabled because ' + viewVal + ' does not allow iframing';
      //we got redirected to resource that can't be embedded.
      //merge the errors into one.
      if (XFOResult.location) {
        tipText += '. ' + displayObj.validatedFields['301'].message;
        displayObj.validatedFields['301'] = {};
      }
      displayObj.validatedFields['iframeHeaders'] = { showInfo: true, message: tipText, doInfo: true };
    } else {
      displayObj.validatedFields['iframeHeaders'] = { showInfo: false };
    }

    return XFOResult;
  }

  private handleSuccess(result: IXFrameOptsResponse): IXFrameOptsResponse {
    //result could have response_code, location, or x_frame_options fields.
    //not null, so normalize string
    if (this.ittUtils.existy(result.x_frame_options)) {
      result.x_frame_options = result.x_frame_options.toUpperCase();
    }
    // console.log('x-frame-opts: ', result);
    return result;
  }

  private canEmbed(result: IXFrameOptsResponse, url: string): IXFrameOptsResult {

    const urlStatus: ILinkStatus = {
      content_security_policy: result.content_security_policy,
      x_frame_options: result.x_frame_options,
      err: result.err,
      response_code: result.response_code
    };

    const xFrameOptsObj: IXFrameOptsResult = Object.create(null);
    const location = result.location;

    if (result.response_code === 999) {
      xFrameOptsObj.canEmbed = false;
    } else {
      xFrameOptsObj.canEmbed = this.urlIsEmbeddable(url, result);
    }

    Object.assign(xFrameOptsObj, { location }, { urlStatus });
    return xFrameOptsObj;
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
}
