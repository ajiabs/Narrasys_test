/**
 * Created by githop on 1/13/17.
 */
kalturaUrlService.$inject = [];

export default function kalturaUrlService() {
  var _type = 'kaltura';
  var _mimeType = 'video/x-' + _type;
  return {
    type: _type,
    getMimeType: getMimeType,
    canPlay: isKalturaUrl,
    parseMediaSrc: parseMediaSrc,
    getKalturaObject: getKalturaObject,
    buildAutoEmbedURLFromKalturaObject: buildAutoEmbedURLFromKalturaObject,
    parseInput: parseInput,
    getOutgoingUrl: function () {
    }
  };

  function getMimeType() {
    return _mimeType;
  }

  function parseInput(input) {
    return buildAutoEmbedURLFromKalturaObject(getKalturaObject(input), 1024, 768)
  }

  /**
   * @name parseMediaSrc
   * @methodOf iTT.service:kalturaUrlService
   * @param {Array} mediaSrc array of media sources, could be a URL or embed code.
   * @returns {Object} Object with type<String> and mediaSrcArr<Array> properties.
   */

  function parseMediaSrc(mediaSrc) {
    return mediaSrc.reduce(function (parsedMediaObj, mediaSrc) {
      if (isKalturaUrl(mediaSrc)) {
        parsedMediaObj.mediaSrcArr.push(mediaSrc);
      }
      return parsedMediaObj;
    }, {type: _type, mediaSrcArr: []});
  }

  function isKalturaUrl(url) {
    var keys = ['partnerId', 'uiconfId', 'entryId', 'uniqueObjId'];
    var test = getKalturaObject(url);
    return keys.every(function (k) {
      return (test.hasOwnProperty(k) && test[k] != null); //jshint ignore:line
    });
  }

  function getKalturaObject(input) {
    var params = {};
    var myArray = [];
    var urlParams;
    if (input.substring(0, 7) === "<script") {
      myArray = /^.*?src\=.https?\:\/\/(?:www|cdnapi|cdnapisec)\.kaltura\.com\/p\/(.*?)\/sp\/(.*?)00.*?\/embedIframeJs\/uiconf_id\/(.*?)\/partner_id\/(.*?)\?(.*?)\".*/g.exec(input);
      if (myArray != null) {
        params["partnerId"] = myArray[1];
        params["uiconfId"] = myArray[3];
        urlParams = parseUrlParams(myArray[5]);
        params["entryId"] = urlParams.entry_id;
        params["uniqueObjId"] = urlParams.playerId;
      } else {
        params = getKalturaObjectFromDynamicEmbedCode(input);
      }
    } else if (input.substring(0, 4) === "<div") {
      params = getKalturaObjectFromDynamicEmbedCode(input);
    } else if (input.substring(0, 7) === "<iframe") {
      myArray = /^.*?src\=.https?\:\/\/(?:www|cdnapi|cdnapisec)\.kaltura\.com\/p\/(.*?)\/sp\/(.*?)00.*?\/embedIframeJs\/uiconf_id\/(.*?)\/partner_id\/(.*?)\?(.*?)\".*/g.exec(input);
      if (myArray != null) {
        params["partnerId"] = myArray[1];
        params["uiconfId"] = myArray[3];
        urlParams = parseUrlParams(myArray[5]);
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
        urlParams = parseUrlParams(myArray[5]);
        params["entryId"] = urlParams.entry_id;
        params["uniqueObjId"] = urlParams.playerId;
      }
    } else {
      // console.log("Detected an invalid embed code");
    }
    return params;
  }

  function buildAutoEmbedURLFromKalturaObject(kalturaObject, width, height) {
    return "https://cdnapisec.kaltura.com/p/" + kalturaObject["partnerId"] + "/sp/" + kalturaObject["partnerId"] + "00/embedIframeJs/uiconf_id/" + kalturaObject["uiconfId"] + "/partner_id/" + kalturaObject["partnerId"] + "?entry_id=" + kalturaObject["entryId"] + "&playerId=" + kalturaObject["uniqueObjId"] + "&autoembed=true&width=" + width + "&height=" + height;
  }

  function parseUrlParams(urlParamsString) {
    //Remove any trailing ampersand if there is one
    if (urlParamsString.charAt(urlParamsString.length - 1) == '&') {
      urlParamsString = urlParamsString.substr(0, urlParamsString.length - 1);
    }
    return JSON.parse('{"' + urlParamsString.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
  }

  function getKalturaObjectFromDynamicEmbedCode(embedCode) {
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
