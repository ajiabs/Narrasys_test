// @npUpgrade-html5-false
/**
 * Created by githop on 11/4/16.
 */


html5UrlService.$inject = ['ittUtils'];

export default function html5UrlService(ittUtils) {
  var _type = 'html5';
  var _existy = ittUtils.existy;
  return {
    type: _type,
    getMimeType: getMimeType,
    parseMediaSrc: parseMediaSrc,
    canPlay: isHTML5VideoUrl,
    parseInput: parseInput,
    getOutgoingUrl: getOutgoingUrl
  };

  function getMimeType(url) {
    return 'video/' + url.match(/(mp4|m3u8|webm)/)[0];
  }

  function getOutgoingUrl(url, startAt) {
    if (_existy(startAt) && startAt > 0) {
      url += '#t=' + startAt;
    }
    return url;
  }

  /**
   *
   * @param mediaSrc
   * @return mediaObj{type: String, mediaSrcArr: Array<String>}
   */
  function parseMediaSrc(mediaSrc) {
    return mediaSrc.reduce(function (parsedMediaObj, mediaSrc) {
      if (isHTML5VideoUrl(mediaSrc)) {
        parsedMediaObj.mediaSrcArr.push(mediaSrc);
      }
      return parsedMediaObj;
    }, {type: _type, mediaSrcArr: []});
  }

  function isHTML5VideoUrl(url) {
    return /(.mp4|.m3u8|.webm)/.test(url);
  }

  function parseInput(url) {
    if (isHTML5VideoUrl(url)) {
      return url;
    }
  }

}

