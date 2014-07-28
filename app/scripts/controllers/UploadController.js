'use strict';

angular.module('com.inthetelling.story')
	.controller('UploadController', function ($scope, config, awsSvc, appState) {

	        $scope.loading = true;
		awsSvc.getUploadSession().then(function (data) {
			$scope.credentials = data;
		        $scope.loading = false;
		});

		$scope.authenticate = function (episodeID) {
			console.warn("clearing localStorage for reauthentication");
			if (localStorage) {
				localStorage.removeItem(config.localStorageKey);
			}
			appState.user = {};
			window.location = (config.apiDataBaseUrl + "/pages/launch_oauth2?episode=" + episodeID);

		};
	});
