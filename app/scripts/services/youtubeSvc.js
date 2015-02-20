'use strict';
angular.module('com.inthetelling.story')
	.factory('youtubeSvc', function ($q, $http, $timeout) {
		var svc = {};
		var config = {
			domain: "http://gdata.youtube.com/",
			timeout: 5000
		};
		svc.getVideoMetaDataV1 = function (id) {
			var resourcePath = "feeds/api/videos/";
			var queryString = "?v=2&alt=json&callback=JSON_CALLBACK";
			var url = config.domain + resourcePath + id + queryString;
			var defer = $q.defer();

			var timeoutPromise = $timeout(function () {
				defer.reject("Timed out");
			}, config.timeout);

			var canceler = $q.defer();
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

		svc.getVideoDuration = function (id) {
			var defer = $q.defer();
			var promise = svc.getVideoMetaDataV1(id);
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
