'use strict';

//TODO we badly need an episode directive

// Episode Controller
angular.module('com.inthetelling.player')
	.controller('EpisodeController', function ($interval, dataSvc, modelFactory, cuePointScheduler, $scope, $rootScope, $location, $routeParams,videojs,$window) {


		// STUFF THAT MUST RUN FIRST:
		
		// HACK HACK HACK HACKITY HACK HACK HACK
		// videojs and cuePointScheduler (and probably others) are currently set up as singletons; both die horrible deaths on route changes (even to the same route).
		// We'll need to fix that asap. For now, use videojs.player as a convenient way to detect if we're starting fresh, and if not do a brute-force reload of the page.
		// It's ugly, but not as ugly as my attempts to de-singletonize greg's code...
		if (videojs.player) {
//			console.log("Route change: forcing refresh");
			$window.location.reload();
		}

			// Frame detect.  Don't use !== as IE8 gets that wrong
			/* jshint -W116 */
			$rootScope.isFramed = (window.parent != window);
			/* jshint +W116 */

			// iPad or iPhone detect.
			// HACK put in rootScope for easy access from vid
			$rootScope.isIPad = (navigator.platform.indexOf('iPad') > -1);
			$rootScope.isIPhone = (navigator.platform.indexOf('iPhone') > -1 || navigator.platform.indexOf('iPod') > -1);

		// patches up scrolling in iframe on ipad:
		if (($rootScope.isIPad || $rootScope.isIPod || $rootScope.isIPhone) && $rootScope.isFramed) {
			var w = angular.element(window);
			angular.element('#CONTAINER')
				.height(w.height())
				.width(w.width())
				.addClass('iosScrollFix');
				
			// can't bind to window resize events, that's a crasher in ios safari. So we make our own.
			$interval( function(){
					$scope.IOSFrameheight = angular.element(window).height();
					$scope.IOSFramewidth = angular.element(window).width();
			},250,0,false);

			// Safari helpfully tries to resize the iframe to match our contents, so we have to beat it to the punch by first
			// resizing our contents to match the iframe.  This takes some doing, because it's a moving target:
			
			$scope.$watch(function() {return $scope.IOSFramewidth;},function(newV,oldV) {
				if (oldV === undefined) {return;}
				if (newV > oldV) {
					// We still need to set this slightly smaller than the actual window size, or else we won't be able to shrink later
					angular.element('#CONTAINER').height($scope.IOSFrameheight-1).width($scope.IOSFramewidth-1);
				} else {
					// Shrinking.  THis is harder.  Make it too small first:
					angular.element('#CONTAINER').height(1).width(1);
					// update the scope vals before the next digest, and before Safari has time to change it on us:
					$scope.IOSFrameheight = angular.element(window).height();
					$scope.IOSFramewidth = angular.element(window).width();
					// and then immediately change the container to match before our interval setter has time to change that on us:
					angular.element('#CONTAINER').height($scope.IOSFrameheight-1).width($scope.IOSFramewidth-1);
				}
			});
			
			// For now we're not going to support iPad1 or iPad2 inside an iframe.  iPad3 is ok
			if (window.devicePixelRatio < 2) {
				// This will place a giant escape button on top of the video
				$scope.forcedEscape=true;
			}
		}

		// OK, now that that's all out of the way we can actually start the app.


		dataSvc.get($routeParams, function (data) { // ON SUCCESS

			var i, j;

			// To be used by framebreaker (see toolbar controller):
			$scope.episodeID = $routeParams.epId;
			$scope.authKey = $routeParams.authKey;

			// Create an episode model.
			$scope.episode = modelFactory.createEpisodeModel(data.episode);

			// Create a collection of scene models
			$scope.scenes = [];
			
			// sort all events first:
			data.events.sort(function (a, b) {
				return a.start_time - b.start_time;
			});

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


		// HACK HACK HACK HACKITY HACK HACK HACK
		// We should adjust the end time to allow for transitions ONLY in cases where showCurrent is true in the content pane, and transitions are in use on the item, and the next item starts at the same time the current item ends.
		// For now applying it everywhere, because the episode model has no knowledge of showcurrent or transitions at this point.
		// This will become easier when there's an explicit derived-values service...
						itemModel.adjustedEndTime =
							(itemModel.type === 'annotation' && itemModel.startTime +1 < itemModel.endTime) ?
								itemModel.endTime -1 :
								itemModel.endTime
							;
					
						cuePointScheduler.subscribe({
							begin: itemModel.startTime,
							end: itemModel.adjustedEndTime
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

			// Inject references to nextScene, prevScene values here, as long as we already have a sorted array of them.
			// TODO these are derived values; refactor.
			// Skips untitled scenes; these are used for navigation only.
			for (i = 1; i < $scope.scenes.length; i++) {
				for (j = i - 1; j > -1; j = j - 1) {
					if ($scope.scenes[j].title) {
						$scope.scenes[i].prevSceneStart = $scope.scenes[j].startTime;
						break;
					}
				}
			}
			for (i = 0; i < $scope.scenes.length - 1; i++) {
				for (j = i + 1; j < $scope.scenes.length; j++) {
					if ($scope.scenes[j].title) {
						$scope.scenes[i].nextSceneStart = $scope.scenes[j].startTime;
						break;
					}
				}
			}



//			console.log("Created episode scope:", $scope);


		}, function (data) { // ON ERROR
			// TODO: Should probably be using a service instead of root scope
			// TODO: dataSvc is always returning a 404 even when the epId is correct...?

			$rootScope.uiErrorMsg = "Wasn't able to load episode data. Sorry!";
			$rootScope.uiErrorDetails = JSON.stringify(data);
			$location.path('/error');
		});

	});
