'use strict';

angular.module('com.inthetelling.story')
	.controller('EpisodeListController', function ($scope, config, dataSvc, authSvc) {

		$scope.loading = true;
		dataSvc.getAllContainers().then(function (data) {

			$scope.containers = data;
			$scope.loading = false;

			$scope.userHasRole = function (role) {
				return authSvc.userHasRole(role);
			};

			$scope.loginTo = function (epId) {
				console.log("EPID: ", epId);
				localStorage.removeItem(config.localStorageKey);
				window.open(config.apiDataBaseUrl + "/oauth2?episode=" + epId);

			};

		});
	});
