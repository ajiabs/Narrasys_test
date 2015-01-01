'use strict';
angular.module('com.inthetelling.story')
	.factory('userSvc', function ($q, $http, $routeParams, $interval, config, appState) {
		// console.log('analyticsSvc factory');
		var svc = {};
		// read from API:
		svc.getCurrentUser = function () {
			// console.log("analyticsSvc readEpisodeActivity");
			var defer = $q.defer();
			$http({
					method: 'GET',
					url: config.apiDataBaseUrl + '/show_user'
				})
				.success(function (respData) {
					// console.log("read episode activity SUCCESS", respData, respStatus, respHeaders);
					defer.resolve(respData);
				})
				.error(function () {
					// console.log("read episode activity ERROR", respData, respStatus, respHeaders);
					defer.reject();
				});
			return defer.promise;
		};

		svc.getUser = function (userid) {
			// console.log("analyticsSvc readEpisodeActivity");
			var defer = $q.defer();
			$http({
					method: 'GET',
					url: config.apiDataBaseUrl + 'v1/users/' + userid
				})
				.success(function (respData) {
					// console.log("read episode activity SUCCESS", respData, respStatus, respHeaders);
					defer.resolve(respData);
				})
				.error(function () {
					// console.log("read episode activity ERROR", respData, respStatus, respHeaders);
					defer.reject();
				});
			return defer.promise;
		};
		return svc;
	});
