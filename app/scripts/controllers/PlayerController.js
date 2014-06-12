'use strict';

//TODO move much of this to a toolbarController

angular.module('com.inthetelling.player')
	.controller('PlayerController', function($scope, $rootScope, $routeParams, $timeout, dataSvc, modelSvc, timelineSvc, analyticsSvc) {
		console.log("playerController", $scope);
		$scope.viewMode = function(newMode) {
			modelSvc.appState.viewMode = newMode;
			analyticsSvc.captureActivity("modeChange", {
				"mode": newMode
			});
		};

		if ($routeParams.viewMode) {
			$scope.viewMode($routeParams.viewMode);
		}

		if ($routeParams.t) {
			timelineSvc.seek($routeParams.t, "URLParam");
		}

		// TEMPORARY
		if ($routeParams.producer) {
			modelSvc.appState.producer = true;
		}

		/* CREATE EPISODE - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

		modelSvc.addLandingScreen($routeParams.epId);
		dataSvc.getEpisode($routeParams.epId);

		// Watch for the first load of the episode data; init the master asset and page title when found
		var episodeWatcher = $scope.$watch(function() {
			return modelSvc.episodes[$routeParams.epId].title;
		}, function(a, b) {
			if (a !== b) {
				document.title = "STORY: " + a;
				episodeWatcher(); // stop watching;
			}
		});

		// Watch for the first load of the episode items; update the timeline when found
		var eventsWatcher = $scope.$watch(function() {
			return modelSvc.episodes[$routeParams.epId].items;
		}, function(a, b) {
			if (a) {
				timelineSvc.init($routeParams.epId);
				eventsWatcher(); // stop watching
			}
		});

		$scope.episode = modelSvc.episode($routeParams.epId);
		$scope.appState = modelSvc.appState;
		$scope.show = modelSvc.appState.show; // yes, slightly redundant, but makes templates a bit easier to read
		$scope.now = new Date();

		/* END CREATE EPISODE - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


		// Misc toolbars too small to rate their own controllers
		$scope.toggleSearchPanel = function() {
			modelSvc.appState.show.searchPanel = !modelSvc.appState.show.searchPanel;
			if (modelSvc.appState.show.searchPanel) {
				$scope.$broadcast('search.indexEvents');
			}
		};
		$scope.toggleNavPanel = function() {
			modelSvc.appState.show.navPanel = !modelSvc.appState.show.navPanel;
		};
		$scope.seek = function(t) {
			timelineSvc.seek(t, "sceneMenu");
		};


		// TEMPORARY: Producer code below this line
		// If this turns out to be any good move it into a producer directive.
		// will likely want other components to be able to read which layer we're editing -- timeline, at least
		$scope.editLayer = function(layer) {
			console.log("TODO: whichever of fgLayer, contentLayer, and bgLayer this isn't: ", layer);

			$scope.editLayer.scene = false;
			$scope.editLayer.bgLayer = false;
			$scope.editLayer.contentLayer = false;
			$scope.editLayer.fgLayer = false;
			if (layer !== '') {
				$scope.editLayer[layer] = true;
			}

		};
	});
