'use strict';

//TODO we badly need an episode directive

// Episode Controller
angular.module('com.inthetelling.player')
	.controller('EpisodeController', function (dataSvc, modelFactory, cuePointScheduler, $scope, $rootScope, $location, $routeParams) {

		dataSvc.get($routeParams, function (data) { // ON SUCCESS
			var i, j;

			
			// To be used by framebreaker (see toolbar controller):
			$scope.episodeID = $routeParams.epId;
			$scope.authKey = $routeParams.authKey;
			
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

			// Inject references to nextScene, prevScene values here, as long as we already have a sorted array of them.
			// TODO these are derived values; refactor.
			// Skips untitled scenes; these are used for navigation only.
			for (i = 1; i < $scope.scenes.length; i++) {
				for (j=i-1; j>-1;j=j-1) {
					if ($scope.scenes[j].title) {
						$scope.scenes[i].$prevScene=$scope.scenes[j];
						break;
					}
				}
			}
			for (i = 0; i < $scope.scenes.length - 1; i++) {
				for (j=i+1; j<$scope.scenes.length;j++) {
					if ($scope.scenes[j].title) {
						$scope.scenes[i].$nextScene=$scope.scenes[j];
						break;
					}
				}
			}
			
			// Frame detect
			$rootScope.isFramed = (window.parent !== window);
			
			// iPad or iPhone detect.
			// put in rootScope for easy access from vid
			$rootScope.isIPad = (navigator.platform.indexOf('iPad') > -1);
			$rootScope.isiPhone = (navigator.platform.indexOf('iPhone') + navigator.platform.indexOf('iPod') > -1);
			

//			console.log("Created episode scope:", $scope);
			

		}, function (data) { // ON ERROR
			// TODO: Should probably be using a service instead of root scope
			// TODO: dataSvc is always returning a 404 even when the epId is correct...?
			
			$rootScope.uiErrorMsg = "Wasn't able to load episode data. Sorry!";
			$rootScope.uiErrorDetails = JSON.stringify(data);
			$location.path('/error');
		});

	});
