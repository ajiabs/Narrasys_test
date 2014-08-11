'use strict';

angular.module('com.inthetelling.story')
	.controller('EpisodeListController', function ($scope, config, dataSvc) {

		// dataSvc.getEpisodeList().then(function (data) {
		// 	$scope.episodes = data;
		// });
		$scope.loading = true;
		dataSvc.getAllContainers().then(function (data) {
			$scope.containers = data;
			$scope.loading = false;
		});

		// $scope.user = appState.user;

		// $scope.authenticate = function (episodeID) {
		// 	console.warn("clearing localStorage for reauthentication");
		// 	if (localStorage) {
		// 		localStorage.removeItem(config.localStorageKey);
		// 	}
		// 	appState.user = {};
		// 	window.location = (config.apiDataBaseUrl + "/pages/launch_oauth2?episode=" + episodeID);

		// };
	});
