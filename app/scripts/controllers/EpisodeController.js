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
				// NOTE depends on scenes being in correct order in json(?)
				
				for (j = 0; j < $scope.scenes.length; j++) {
					if (itemModel.startTime >= $scope.scenes[j].startTime) {
						if (itemModel.endTime >= $scope.scenes[j].endTime) {
							console.warn("ERROR: item end time extends past scene end; coercing");
							itemModel.endTime = $scope.scenes[j].endTime;
						}
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

});
