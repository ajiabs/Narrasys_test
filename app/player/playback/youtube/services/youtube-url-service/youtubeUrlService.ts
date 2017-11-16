// @npUpgrade-youtube-false

youtubeUrlService.$inject = ['ittUtils'];

export default function youtubeUrlService(ittUtils) {
  var _existy = ittUtils.existy;
  var _type = 'youtube';
  var _mimeType = 'video/x-' + _type;
  return {
    type: _type,
    getMimeType: getMimeType,
    extractYoutubeId: extractYoutubeId,
    isYoutubeUrl: isYoutubeUrl,
    canPlay: isYoutubeUrl,
    parseMediaSrc: parseMediaSrc,
    embedParams: embedParams,
    createEmbedLinkFromYoutubeId: createEmbedLinkFromYoutubeId,
    embeddableYoutubeUrl: embeddableYoutubeUrl,
    parseInput: embeddableYoutubeUrl,
    getOutgoingUrl: getOutgoingUrl
  };

  function getMimeType() {
    return _mimeType;
  }

  function getOutgoingUrl(url, startAt) {
    url = embeddableYoutubeUrl(url, false);
    if (_existy(startAt) && startAt > 0) {
      url += '&start=' + startAt;
    }
    return url;
  }

  function extractYoutubeId(origUrl) {
    if (!origUrl) {
      return false;
    }
    origUrl = origUrl.replace(/%3F/, '?');
    origUrl = origUrl.replace(/%26/, '&');
    var getYoutubeID = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
    var ytMatch = origUrl.match(getYoutubeID);
    return (ytMatch && ytMatch[1]) ? ytMatch[1] : false;
  }

  function isYoutubeUrl(origUrl) {
    if (!origUrl) {
      return false;
    }
    origUrl = origUrl.replace(/%3F/, '?');
    origUrl = origUrl.replace(/%26/, '&');
    var getYoutubeID = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
    return getYoutubeID.test(origUrl);
  }

  /**
   *
   * @param mediaSrcArr
   * @return mediaSrcObj {type: string, mediaSrcArr: Array<String>}
   */
  function parseMediaSrc(mediaSrcArr) {
    return mediaSrcArr.reduce(function (parsedMediaSrcObj, mediaSrc) {
      if (isYoutubeUrl(mediaSrc)) {
        parsedMediaSrcObj.mediaSrcArr.push(mediaSrc);
      }
      return parsedMediaSrcObj;
    }, {type: 'youtube', mediaSrcArr: []});
  }

  function embedParams(outgoing) {
    // kept separate from createEmbedLinkFromYoutubeId for convenience in unit tests.
    // TODO move these into videoController, as playerVar params, instead of embedding them in the url.  (Will need to init youtube as a div instead of as an iframe)
    // WARN dont remove the wmode param, it works around an IE z-index bug

    if (outgoing === false) {
      //supported params available at https://developers.google.com/youtube/player_parameters
      return "?controls=1&autoplay=1&modestbranding=1&showinfo=1&rel=0&iv_load_policy=3&wmode=transparent";
    }

    return "?enablejsapi=1&controls=0&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&wmode=transparent";
  };

  function createEmbedLinkFromYoutubeId(ytid, suppressParams) {
    if (!ytid) {
      return false;
    }
    return "//www.youtube.com/embed/" + ytid + (suppressParams ? "" : embedParams(suppressParams));
  };

  function embeddableYoutubeUrl(origUrl, suppressParams) {
    if (!origUrl) {
      return false;
    }
    var ytid = extractYoutubeId(origUrl);
    return createEmbedLinkFromYoutubeId(ytid, suppressParams);
  };

  // var parseRidiculousDurationFormat = function (input) {
  // 	var duration = 0;
  // 	if (input.match(/(\d*)D/)) {
  // 		duration = duration + parseInt((input.match(/(\d*)D/)[1] * 86400), 10);
  // 	}
  // 	if (input.match(/(\d*)H/)) {
  // 		duration = duration + parseInt((input.match(/(\d*)H/)[1] * 3600), 10);
  // 	}
  // 	if (input.match(/(\d*)M/)) {
  // 		duration = duration + parseInt((input.match(/(\d*)M/)[1] * 60), 10);
  // 	}
  // 	if (input.match(/(\d*)S/)) {
  // 		duration = duration + parseInt((input.match(/(\d*)S/)[1]), 10);
  // 	}
  // 	return duration;
  // };
  //
  // var getVideoMetaData = function (id) {
  // 	var url = "https://www.googleapis.com/youtube/v3/videos?id=" + id + "&part=contentDetails,snippet&key=" + config.youtube.apikey;
  // 	var defer = $q.defer();
  //
  // 	var timeoutPromise = $timeout(function () {
  // 		defer.reject("Youtube API request timed out");
  // 	}, config.youtube.timeout);
  //
  // 	$http({
  // 		method: 'GET',
  // 		url: url,
  // 		transformRequest: function (data, headersGetter) {
  // 			var headers = headersGetter();
  // 			delete headers.Authorization; // youtube no likey
  // 			return headers;
  // 		}
  // 	})
  // 		.success(function (respData) {
  // 			$timeout.cancel(timeoutPromise);
  // 			defer.resolve(respData);
  // 		})
  // 		.error(function () {
  // 			defer.reject();
  // 		});
  // 	return defer.promise;
  // };

  // svc.getVideoData = function (id) {
  // 	var defer = $q.defer();
  // 	getVideoMetaData(id)
  // 		.then(
  // 			function (respData) {
  // 				if (respData.items[0]) {
  // 					//shelter ourselves from youtube api changes, by adapting their return to an internal format
  // 					var videoMetadata = {
  // 						id: id,
  // 						//thumbnail: "//img.youtube.com/vi/"+id+"/default.jpg",   (might be useful someday)
  // 						title: respData.items[0].snippet.title,
  // 						description: respData.items[0].snippet.description,
  // 						duration: parseRidiculousDurationFormat(respData.items[0].contentDetails.duration)
  // 					};
  // 					defer.resolve(videoMetadata);
  // 				} else {
  // 					console.log("Bad response data from youtube getVideoData", respData);
  // 					defer.reject("Bad response data from youtube getVideoData");
  // 				}
  // 			},
  // 			function (reason) {
  // 				console.log("Youtube getVideoData failed:" + reason);
  // 				defer.reject(reason);
  // 			}
  // 		);
  // 	return defer.promise;
  // };
}
