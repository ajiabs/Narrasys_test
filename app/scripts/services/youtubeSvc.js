'use strict';
angular.module('com.inthetelling.story')
	.factory('youtubeSvc', function ($q, $http, $timeout, config) {
		var svc = {};

		var getVideoMetaData = function (id) {
			var url = "https://www.googleapis.com/youtube/v3/videos?id=" + id + "&part=contentDetails,snippet&key=" + config.youtube.apikey;
			var defer = $q.defer();

			var timeoutPromise = $timeout(function () {
				defer.reject("Youtube API request timed out");
			}, config.youtube.timeout);

			$http({
					method: 'GET',
					url: url,
					transformRequest: function (data, headersGetter) {
						var headers = headersGetter();
						delete headers.Authorization; // youtube no likey
						return headers;
					}
				})
				.success(function (respData) {
					$timeout.cancel(timeoutPromise);
					defer.resolve(respData);
				})
				.error(function () {
					defer.reject();
				});
			return defer.promise;
		};

		/* TODO combine the next 4 fns (and update all callers), and remove the 'includeQSParams' thing; we always want the params. 

		should only need:
		svc.extractId -- convert url to plain ID
		svc.createEmbedLink -- convert url or ID to embed url

		*/
		svc.extractYoutubeId = function (origUrl) {
			if (!origUrl) {
				return false;
			}
			origUrl = origUrl.replace(/%3F/, '?');
			origUrl = origUrl.replace(/%26/, '&');

			var getYoutubeID = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
			var ytMatch = origUrl.match(getYoutubeID);
			if (ytMatch && ytMatch[1]) {
				return ytMatch[1];
			} else {
				return false;
			}
		};
		svc.getYoutubeEmbedQueryString = function () {
			return "?enablejsapi=1&controls=0&modestbranding=1&showinfo=0&wmode=opaque&rel=0&html5=1&autoplay=0&disablekb=0&loop=0";
		};
		svc.createEmbedLinkFromYoutubeId = function (ytid, includeQSParams) {
			var includeQS = false;
			if (arguments.length === 2) {
				includeQS = includeQSParams;
			}
			// if (includeQS) {
			return (ytid) ? "//www.youtube.com/embed/" + ytid + svc.getYoutubeEmbedQueryString() : false;
			// } else {
			// return (ytid) ? "//www.youtube.com/embed/" + ytid : false;
			// }
		};
		svc.embeddableYoutubeUrl = function (origUrl, includeQSParams) {
			var ytid = svc.extractYoutubeId(origUrl);
			return svc.createEmbedLinkFromYoutubeId(ytid, includeQSParams);
		};

		var parseRidiculousDurationFormat = function (input) {
			var duration = 0;
			if (input.match(/(\d*)D/)) {
				duration = duration + parseInt((input.match(/(\d*)D/)[1] * 86400), 10);
			}
			if (input.match(/(\d*)H/)) {
				duration = duration + parseInt((input.match(/(\d*)H/)[1] * 3600), 10);
			}
			if (input.match(/(\d*)M/)) {
				duration = duration + parseInt((input.match(/(\d*)M/)[1] * 60), 10);
			}
			if (input.match(/(\d*)S/)) {
				duration = duration + parseInt((input.match(/(\d*)S/)[1]), 10);
			}
			return duration;
		};

		svc.getVideoData = function (id) {
			var defer = $q.defer();
			getVideoMetaData(id)
				.then(
					function (respData) {
						if (respData.items[0]) {
							//shelter ourselves from youtube api changes, by adapting their return to an internal format
							var videoMetadata = {
								id: id,
								//thumbnail: "//img.youtube.com/vi/"+id+"/default.jpg",   (might be useful someday)
								title: respData.items[0].snippet.title,
								description: respData.items[0].snippet.description,
								duration: parseRidiculousDurationFormat(respData.items[0].contentDetails.duration)
							};
							defer.resolve(videoMetadata);
						} else {
							console.log("Bad response data from youtube getVideoData", respData);
							defer.reject("Bad response data from youtube getVideoData");
						}
					},
					function (reason) {
						console.log("Youtube getVideoData failed:" + reason);
						defer.reject(reason);
					}
				);
			return defer.promise;
		};

		return svc;
	});
