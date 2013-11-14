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
	
	/* Handler for toolbar buttons to change scene templates. */
	/* TODO: write test for this */
	$scope.setSceneTemplate = function(newTemplate) {
		console.log("setSceneTemplate " + newTemplate);
		
		$scope.currentSceneTemplate = newTemplate;
			// set all scenes to use newTemplate
		for (var i=0; i<$scope.scenes.length; i++) {
			var thisScene = $scope.scenes[i];
			if (newTemplate) {
				if (thisScene.origTemplateUrl === undefined) {
					thisScene.origTemplateUrl = thisScene.templateUrl;   // so we can revert to it later
//				thisScene.origLayout = thisScene.layout;
				}
				thisScene.templateUrl = "templates/scene-"+newTemplate+".html"; // hardcoded for now
//			newTemplate === "video" 
//				? thisScene.layout = "layoutVideo"
//				: thisScene.layout = "layoutExplore"
//			;
			} else {
				if (thisScene.origTemplateUrl) { // if this is undefined, we've never left directed view so don't need to do anything here
					thisScene.templateUrl = thisScene.origTemplateUrl;
// 					thisScene.layout = thisScene.origLayout;
				}
			}
		}
		
		//TODO need to trigger videoMagnet at this point
	};
	
	/* detect which view we're in */
	/* this is a bizarre syntax but seems to be how it's supposed to work... */
	$scope.currentSceneTemplateIs = function(compare) {
		return $scope.currentSceneTemplate === compare;
	};



});
