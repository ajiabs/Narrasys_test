'use strict';

angular.module('com.inthetelling.player')
	.controller('PlayerController', function ($scope, $routeParams, $timeout, dataSvc, modelSvc, timelineSvc) {

		if ($routeParams.viewMode) {
			modelSvc.appState.viewMode = $routeParams.viewMode;
		}

		if ($routeParams.t) {
			timelineSvc.seek($routeParams.t);
		}

		dataSvc.getEpisode($routeParams.epId);
		modelSvc.addLandingScreen($routeParams.epId);

		// Watch for the first load of the episode data; init the master asset and page title when found
		var episodeWatcher = $scope.$watch(function () {
			return modelSvc.episodes[$routeParams.epId].title;
		}, function (a, b) {
			if (a !== b) {
				document.title = "STORY: " + a;

				episodeWatcher(); // stop watching;
			}
		});

		// Watch for the first load of the episode items; update the timeline when found
		var eventsWatcher = $scope.$watch(function () {
			return modelSvc.episodes[$routeParams.epId].items;
		}, function (a, b) {
			if (a !== b) {
				timelineSvc.init($routeParams.epId);
				eventsWatcher(); // stop watching
			}
		});

		$scope.episode = modelSvc.episode($routeParams.epId);
		$scope.appState = modelSvc.appState;

		$scope.viewMode = function (newMode) {
			modelSvc.appState.viewMode = newMode;
		};

	});
