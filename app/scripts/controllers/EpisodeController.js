'use strict';

// Episode Controller
angular.module('com.inthetelling.player')
	.controller('EpisodeController', function (dataSvc, modelFactory, cuePointScheduler, $scope, $rootScope, $location, $routeParams) {

		dataSvc.get($routeParams, function (data) { // ON SUCCESS
			var i, j;

			// Create an episode model.
			$scope.episode = modelFactory.createEpisodeModel(data.episode);

			// Create a collection of scene models
			$scope.scenes = [];
			for (i = 0; i < data.events.length; i++) {
				if (data.events[i].type === "scene") {

					// scene model
					var sceneModel = modelFactory.createSceneModel(data.events[i]);

					// subscribe the scene model to the cuePoint scheduler service for state awareness
					// use a closure to preserve variable scope in each loop iteration
					(function (sceneModel) {
						cuePointScheduler.subscribe({
							begin: sceneModel.startTime,
							end: sceneModel.endTime
						}, function (span, evt, playheadPos) {
							$scope.$apply(function () {
								if (evt === cuePointScheduler.ENTER) {
									sceneModel.isActive = true;
								} else if (evt === cuePointScheduler.EXIT) {
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

					// subscribe the item model to the cuePoint scheduler for state awareness
					// use a closure to preserve variable scope in each loop iteration
					(function (itemModel) {
						cuePointScheduler.subscribe({
							begin: itemModel.startTime,
							end: itemModel.endTime
						}, function (span, evt, playheadPos) {
							$scope.$apply(function () {
								if (evt === cuePointScheduler.ENTER) {
									itemModel.isActive = true;
								} else if (evt === cuePointScheduler.EXIT) {
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

			//Sort scenes and items within scenes
			$scope.scenes.sort(function (a, b) {
				return a.startTime - b.startTime;
			});
			for (i = 0; i < $scope.scenes.length; i++) {
				$scope.scenes[i].items.sort(function (a, b) {
					return a.startTime - b.startTime;
				});
			}

			console.log("Created Scope:", $scope);

		}, function (data) { // ON ERROR
			// TODO: Should probably be using a service instead of root scope
			$rootScope.uiErrorMsg = "Unable to load data for episode: " + $routeParams.epId;
			$location.path('/error');
		});

	});
