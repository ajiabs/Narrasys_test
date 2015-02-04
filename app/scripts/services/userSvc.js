/*
user_id is now retrieved during login, making this unnecessary. I think.  Keeping the file around for the time being just in case

'use strict';
angular.module('com.inthetelling.story')
	.factory('userSvc', function ($q, $http, $routeParams, $interval, config) {
		var svc = {};
		svc.getCurrentUser = function () {
			var defer = $q.defer();
			$http({
					method: 'GET',
					url: config.apiDataBaseUrl + '/show_user'
				})
				.success(function (respData) {
					console.log(respData);
					defer.resolve(respData);
				})
				.error(function () {
					defer.reject();
				});
			return defer.promise;
		};

		svc.getUser = function (userid) {
			var defer = $q.defer();
			$http({
					method: 'GET',
					url: config.apiDataBaseUrl + '/v1/users/' + userid
				})
				.success(function (respData) {
					defer.resolve(respData);
				})
				.error(function () {
					defer.reject();
				});
			return defer.promise;
		};
		return svc;
	});

*/
