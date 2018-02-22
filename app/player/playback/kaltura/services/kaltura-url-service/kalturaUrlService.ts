// @npUpgrade-kaltura-false
/**
 * Created by githop on 1/13/17.
 */

/***********************************
 **** Updated by Curve10 (JAB/EDD)
 **** Feb 2018
 ***********************************/

export interface IKalturaUrlService {
  type:string;
  getMimeType();
  parseInput(input);
  parseMediaSrc(mediaSrc);
  isKalturaUrl(url);
  getKalturaObject(input);
  buildAutoEmbedURLFromKalturaObject(kalturaObject, width, height);
  parseUrlParams(urlParamsString);
  getKalturaObjectFromDynamicEmbedCode(embedCode);
}

export class KalturaUrlService implements IKalturaUrlService {
  static Name = 'kalturaUrlService'; // tslint:disable-line
  static $inject = [];

  constructor (

  ) {

  }

  type = 'kaltura';
  private _mimeType = 'video/x-' + this.type;

  // return {
  //   type: type,
  //   getMimeType: getMimeType,
  //   canPlay: isKalturaUrl,
  //   parseMediaSrc: parseMediaSrc,
  //   getKalturaObject: getKalturaObject,
  //   buildAutoEmbedURLFromKalturaObject: buildAutoEmbedURLFromKalturaObject,
  //   parseInput: parseInput,
  //   getOutgoingUrl: function () {
  //   }
  // };

  getMimeType() {
    return this._mimeType;
  }

  parseInput(input) {
    return this.buildAutoEmbedURLFromKalturaObject(this.getKalturaObject(input), 1024, 768)
  }

  canPlay(input) {
    return this.isKalturaUrl(input);
  }



  /**
   * @name parseMediaSrc
   * @methodOf iTT.service:kalturaUrlService
   * @param {Array} mediaSrc array of media sources, could be a URL or embed code.
   * @returns {Object} Object with type<String> and mediaSrcArr<Array> properties.
   */

  parseMediaSrc(mediaSrc) {
    return mediaSrc.reduce( (parsedMediaObj, mediaSrc) => {
      if (this.isKalturaUrl(mediaSrc)) {
        parsedMediaObj.mediaSrcArr.push(mediaSrc);
      }
      return parsedMediaObj;
    }, {type: this.type, mediaSrcArr: []});
  }

  isKalturaUrl(url) {
    var keys = ['partnerId', 'uiconfId', 'entryId', 'uniqueObjId'];
    var test = this.getKalturaObject(url);
    return keys.every( (k) => {
      return (test.hasOwnProperty(k) && test[k] != null); //jshint ignore:line
    });
  }

  getKalturaObject(input) {
    var params = {};
    var myArray = [];
    var urlParams;
    if (input == null) {
      return {
        partnerId: null,
        uiconfId: null,
        entryId: null,
        uniqueObjId: null
      };
    }
    if (input.substring(0, 7) === "<script") {
      myArray = /^.*?src\=.https?\:\/\/(?:www|cdnapi|cdnapisec)\.kaltura\.com\/p\/(.*?)\/sp\/(.*?)00.*?\/embedIframeJs\/uiconf_id\/(.*?)\/partner_id\/(.*?)\?(.*?)\".*/g.exec(input);
      if (myArray != null) {
        params["partnerId"] = myArray[1];
        params["uiconfId"] = myArray[3];
        urlParams = this.parseUrlParams(myArray[5]);
        params["entryId"] = urlParams.entry_id;
        params["uniqueObjId"] = urlParams.playerId;
      } else {
        params = this.getKalturaObjectFromDynamicEmbedCode(input);
      }
    } else if (input.substring(0, 4) === "<div") {
      params = this.getKalturaObjectFromDynamicEmbedCode(input);
    } else if (input.substring(0, 7) === "<iframe") {
      myArray = /^.*?src\=.https?\:\/\/(?:www|cdnapi|cdnapisec)\.kaltura\.com\/p\/(.*?)\/sp\/(.*?)00.*?\/embedIframeJs\/uiconf_id\/(.*?)\/partner_id\/(.*?)\?(.*?)\".*/g.exec(input);
      if (myArray != null) {
        params["partnerId"] = myArray[1];
        params["uiconfId"] = myArray[3];
        urlParams = this.parseUrlParams(myArray[5]);
        params["uniqueObjId"] = urlParams.playerId;
        params["entryId"] = urlParams.entry_id;
      }
    } else if (input.substring(0, 7) === "<object") {
      myArray = /^.*\n*?.*?id\=.(.*?)\"(.*?\n*)*?data\=.*?https?\:\/\/(?:www|cdnapi|cdnapisec)\.kaltura\.com\/kwidget\/wid\/_(.*?)\/uiconf_id\/(.*?)\/entry_id\/(.*?)\".*/g.exec(input);
      if (myArray != null) {
        params["uniqueObjId"] = myArray[1];
        params["partnerId"] = myArray[3];
        params["uiconfId"] = myArray[4];
        params["entryId"] = myArray[5];
      }
    } else if (input.substring(0, 4) === "http") {
      myArray = /^https?\:\/\/(?:www|cdnapi|cdnapisec)\.kaltura\.com\/p\/(.*?)\/sp\/(.*?)00.*?\/embedIframeJs\/uiconf_id\/(.*?)\/partner_id\/(.*?)\?(.*)/g.exec(decodeURIComponent(input));
      if (myArray != null) {
        params["partnerId"] = myArray[1];
        params["uiconfId"] = myArray[3];
        urlParams = this.parseUrlParams(myArray[5]);
        params["entryId"] = urlParams.entry_id;
        params["uniqueObjId"] = urlParams.playerId;
      }
    } else {
      // console.log("Detected an invalid embed code");
    }
    return params;
  }

  buildAutoEmbedURLFromKalturaObject(kalturaObject, width, height) {
    return "https://cdnapisec.kaltura.com/p/" + kalturaObject["partnerId"] + "/sp/" + kalturaObject["partnerId"] + "00/embedIframeJs/uiconf_id/" + kalturaObject["uiconfId"] + "/partner_id/" + kalturaObject["partnerId"] + "?entry_id=" + kalturaObject["entryId"] + "&playerId=" + kalturaObject["uniqueObjId"] + "&autoembed=true&width=" + width + "&height=" + height;
  }

  parseUrlParams(urlParamsString) {
    //Remove any trailing ampersand if there is one
    if (urlParamsString.charAt(urlParamsString.length - 1) == '&') {
      urlParamsString = urlParamsString.substr(0, urlParamsString.length - 1);
    }
    return JSON.parse('{"' + urlParamsString.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
  }

  getKalturaObjectFromDynamicEmbedCode(embedCode) {
    var params = {};
    var myArray = /^(?:.|\n|\r)*?kWidget\..*?mbed\(({(?:.|\n|\r)*})\).*?/g.exec(embedCode);
    if (myArray != null) {
      var kWidgetParams = JSON.parse(myArray[1]);
      params["uniqueObjId"] = kWidgetParams.targetId;
      params["partnerId"] = kWidgetParams.wid.substring(1);
      params["uiconfId"] = kWidgetParams.uiconf_id;
      params["entryId"] = kWidgetParams.entry_id;
    }
    return params;
  }

}
