'use strict';
angular.module('com.inthetelling.story')
	.factory('youtubeSvc', function ($q, $http, $timeout, config) {
		var svc = {};
		var YTconfig = config.youtube;

		var getVideoMetaDataV1 = function (id) {
			var resourcePath = "feeds/api/videos/";
			var queryString = "?v=2&alt=json&callback=JSON_CALLBACK";
			var url = YTconfig.domain + resourcePath + id + queryString;
			var defer = $q.defer();

			var timeoutPromise = $timeout(function () {
				defer.reject("Timed out");
			}, YTconfig.timeout);

			$http.jsonp(url)
				.success(function (respData) {
					$timeout.cancel(timeoutPromise);
					defer.resolve(respData);
				})
				.error(function () {
					defer.reject();
				});
			return defer.promise;
		};

		var checkNested = function (obj /*, level1, level2, ... levelN*/ ) {
			for (var i = 1; i < arguments.length; i++) {
				if (!obj.hasOwnProperty(arguments[i])) {
					return false;
				}
				obj = obj[arguments[i]];
			}
			return true;
		};

		svc.extractYoutubeId = function (origUrl) {
			if (!origUrl) {
				return false;
			}
			var getYoutubeID = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
			var ytMatch = origUrl.match(getYoutubeID);
			if (ytMatch && ytMatch[1]) {
				return ytMatch[1];
			} else {
				return false;
			}
		};
    svc.getYoutubeEmbedQueryString = function() {
      return "?enablejsapi=1&controls=0&modestbranding=1&showinfo=0&wmode=opaque&rel=0&html5=1&autoplay=0&disablekb=0&loop=0";
    };
    svc.createEmbedLinkFromYoutubeId = function(ytid, includeQSParams) {
      var includeQS = false;
      if (arguments.length === 2) {
        includeQS = includeQSParams;
      }
      if (includeQS) {
        return (ytid) ? "//www.youtube.com/embed/" + ytid + svc.getYoutubeEmbedQueryString() : false;
      } else {
        return (ytid) ? "//www.youtube.com/embed/" + ytid : false;
      }
    };
		svc.embeddableYoutubeUrl = function (origUrl, includeQSParams) {
			var ytid = svc.extractYoutubeId(origUrl);
      return svc.createEmbedLinkFromYoutubeId(ytid, includeQSParams);
		};
		svc.getVideoData = function (id) {
			var defer = $q.defer();
			var promise = getVideoMetaDataV1(id);
			promise.then(function (respData) {
					var duration = 0;
					var title = "";
					var description = "";
					if (checkNested(respData, "entry", "media$group", "yt$duration", "seconds")) {
						duration = respData.entry.media$group.yt$duration.seconds;
					}
					if (checkNested(respData, "entry", "media$group", "media$title", "$t")) {
						title = respData.entry.media$group.media$title.$t;
					}
					if (checkNested(respData, "entry", "media$group", "media$description", "$t")) {
						description = respData.entry.media$group.media$description.$t;
					}
					//shelter ourselves from youtube api changes, by adapting their return to an internal format
					var videoMetadata = {};
					videoMetadata.id = id;
					videoMetadata.title = title;
					videoMetadata.description = description;
					videoMetadata.duration = duration;
					defer.resolve(videoMetadata);
				},
				function (reason) {
					console.log("Failed:" + reason);
					defer.reject(reason);
				});
			return defer.promise;
		};

		svc.getVideoDuration = function (id) {
			var defer = $q.defer();
			var promise = getVideoMetaDataV1(id);
			promise.then(function (respData) {
					var duration = 0;
					console.log('respData - youtube', respData);
					if (checkNested(respData, "entry", "media$group", "yt$duration", "seconds")) {
						duration = respData.entry.media$group.yt$duration.seconds;
					}
					//get duration from respData
					defer.resolve(duration);
				},
				function (reason) {
					console.log("Failed:" + reason);
					defer.reject(reason);
				});
			return defer.promise;
		};

		return svc;
	});
