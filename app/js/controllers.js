'use strict';

// Declare the player.controllers module
angular.module('player.controllers', [])

// UI Error Controller (Shows an error through the UI)
.controller('UIErrorController', ['$scope', '$rootScope', function($scope, $rootScope) {

	$scope.errorMsg = $rootScope.uiErrorMsg || 'The requested route does not exist. Please use /episode/<episodeId> format.';

}])
	
// Episode Controller
.controller('EpisodeController', ['timelineSvc', '$scope', '$rootScope', '$location', '$routeParams', '$http', function(timelineSvc, $scope, $rootScope, $location, $routeParams, $http) {

	$http({method: 'GET', url: '/server-mock/data/episode-' + $routeParams.epId + '.json'})
	.success(function(data, status, headers, config) {
		
		// Create an episode model.
		$scope.episode = {
			title: data.episode.title,
			category: data.episode.category,
			coverUrl: data.episode.cover,
			templateUrl: data.episode.template,
			videos: {
				webm: data.episode.videos.webm,
				mpeg4: data.episode.videos.mpeg4
			}
		};

		// Create a collection of scene models
		$scope.scenes = [];
		for (var i=0; i < data.events.length; i++) {
			if (data.events[i].type == "scene") {

				// scene model
				var sceneModel = {
					type: data.events[i].type,
					title: data.events[i].title,
					description: data.events[i].description,
					templateUrl: data.events[i].template,
					startTime: data.events[i].start,
					endTime: data.events[i].end,
					thumbnail: data.events[i].src,
					isActive: false,
					wasActive: false,
					items: []
				};

				// subscribe the scene model to the timeline service for state awareness
				// use a closure to preserve variable scope in each loop iteration
				(function(sceneModel){
					timelineSvc.subscribe({
						begin: sceneModel.startTime,
						end: sceneModel.endTime
					}, function(span, evt, playheadPos) {
						$scope.$apply(function(){
							if (evt === timelineSvc.ENTER) {
								sceneModel.isActive = true;
							}
							else if (evt === timelineSvc.EXIT) {
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
		// TODO: ?? Create a model-factory with inheritable model classes to hide this complexity ??
		for (var i=0; i < data.events.length; i++) {
			if (data.events[i].type != "scene") {

				// base item model
				var itemModel = {
					type: data.events[i].type,
					category: data.events[i].category,
					startTime: data.events[i].start,
					endTime: data.events[i].end,
					templateUrl: data.events[i].template,
					displayTime: Math.floor(data.events[i].start/60) + ":" + ("0"+Math.floor(data.events[i].start)%60).slice(-2)
				};

				// subscribe the item model to the timeline service for state awareness
				// use a closure to preserve variable scope in each loop iteration
				(function(itemModel){
					timelineSvc.subscribe({
						begin: itemModel.startTime,
						end: itemModel.endTime
					}, function(span, evt, playheadPos) {
						$scope.$apply(function(){
							if (evt === timelineSvc.ENTER) {
								itemModel.isActive = true;
							}
							else if (evt === timelineSvc.EXIT) {
								itemModel.isActive = false;
								itemModel.wasActive = true;
							}
						});
					});
				})(itemModel);
				
				// extend base model based on item type
				switch(data.events[i].type) {
					case "transcript":
						itemModel.authorName = data.events[i].author.name;
						itemModel.authorThumbSrc = data.events[i].author.src;
						itemModel.annotation = data.events[i].annotation;
						break;

					case "link":
						itemModel.title = data.events[i].title;
						itemModel.description = data.events[i].description;
						itemModel.thumbSrc = data.events[i].src;
						itemModel.source = data.events[i].href;
						break;

					case "image":
						itemModel.title = data.events[i].title;
						itemModel.description = data.events[i].description;
						itemModel.source = data.events[i].src;
						break;
				}

				// TODO: If a transmedia item ever spanned across scene boundaries it would
				// not be added to any scene container and we are not handling that case
				for (var j=0; j < $scope.scenes.length; j++) {
					if (itemModel.startTime >= $scope.scenes[j].startTime && 
						itemModel.startTime <= $scope.scenes[j].endTime) {
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

}]);
