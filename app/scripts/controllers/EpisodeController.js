'use strict';

// Episode Controller
angular.module('com.inthetelling.player')
.controller('EpisodeController', function (queuePointScheduler, modelFactory, $scope, $rootScope, $location, $routeParams, $http) {

	$http({method: 'GET', url: 'server-mock/data/episode-' + $routeParams.epId + '.json'})
	.success(function(data, status, headers, config) {
		
		var i, j;

		// Create an episode model.
		$scope.episode = modelFactory.createEpisodeModel(data.episode);

		// Create a collection of scene models
		$scope.scenes = [];
		for (i = 0; i < data.events.length; i++) {
			if (data.events[i].type === "scene") {

				// scene model
				var sceneModel = modelFactory.createSceneModel(data.events[i]);

				// subscribe the scene model to the queuepoint scheduler service for state awareness
				// use a closure to preserve variable scope in each loop iteration
				(function(sceneModel){
					queuePointScheduler.subscribe({
						begin: sceneModel.startTime,
						end: sceneModel.endTime
					}, function(span, evt, playheadPos) {
						$scope.$apply(function(){
							if (evt === queuePointScheduler.ENTER) {
								sceneModel.isActive = true;
							}
							else if (evt === queuePointScheduler.EXIT) {
								sceneModel.isActive = false;
								sceneModel.wasActive = true;
							}
						});
					});
				})(sceneModel);

				$scope.scenes.push(sceneModel);
			}
		}

		// create item/transmedia models and place them into the items collection of their respective scenes
		for (i = 0; i < data.events.length; i++) {
			if (data.events[i].type !== "scene") {

				// base item model
				var itemModel = modelFactory.createItemModel(data.events[i]);

				// subscribe the item model to the queuepoint scheduler for state awareness
				// use a closure to preserve variable scope in each loop iteration
				(function(itemModel){
					queuePointScheduler.subscribe({
						begin: itemModel.startTime,
						end: itemModel.endTime
					}, function(span, evt, playheadPos) {
						$scope.$apply(function(){
							if (evt === queuePointScheduler.ENTER) {
								itemModel.isActive = true;
							}
							else if (evt === queuePointScheduler.EXIT) {
								itemModel.isActive = false;
								itemModel.wasActive = true;
							}
						});
					});
				})(itemModel);

				// Add the item model to its relevant scene
				for (j = 0; j < $scope.scenes.length; j++) {
					if (itemModel.startTime >= $scope.scenes[j].startTime &&
						itemModel.startTime < $scope.scenes[j].endTime) {
						$scope.scenes[j].items.push(itemModel);
						break;
					}
				}

			}
		}

	})
	.error(function(data, status, headers, config) {
		// TODO: Should probably be using a service instead of root scope
		$rootScope.uiErrorMsg = "Unable to load data for Episode: " + $routeParams.epId;
		$location.path('/error');
	});

	// TODO: Get these methods out of the episode scope. They really belong in the toolbar directive's scope,
	// but in order for that to work they would need to go into the toolbar directive's dom which is inappropriate
	// and breaks their sizing. Better then to create an ittControls (or ittEpisodeControls) directive to declare
	// in the episode template's dom, and then declare the toolbar and these panels as siblings inside of the ittControl
	// template. Then the below methods can go into the controller for ittControls, and will be accessible from the toolbar
	// and from the panel directives themselves.

	// Add some flags for the panel components to bind their visibility states to
	$scope.show = {
		navigationPanel: false,
		searchPanel: false
	};
	// Show navigation panel
	$scope.showNavigationPanel = function() {
		console.log("showNavigationPanel()");
		$scope.show.navigationPanel = true;
	};
	// Hide navigation panel
	$scope.hideNavigationPanel = function() {
		console.log("hideNavigationPanel()");
		$scope.show.navigationPanel = false;
	};
	// Show search panel
	$scope.showSearchPanel = function() {
		console.log("showSearchPanel()");
		$scope.show.searchPanel = true;
	};
	// Hide search panel
	$scope.hideSearchPanel = function() {
		console.log("hideSearchPanel()");
		$scope.show.searchPanel = false;
	};

});
