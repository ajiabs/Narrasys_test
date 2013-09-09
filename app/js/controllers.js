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
		
		// Create an episode object on the scope
		$scope.episode = {
			title: data.episode.title,
			templateUrl: data.episode.template,
			playheadPosition: 0,
			currentScene: null
		};

		// Create a collection of scenes from the chapters array
		// TODO: sort chapters array by start before we iterate, otherwise we could break endTime
		$scope.scenes = [];
		for (var i=0; i < data.chapters.length; i++) {
			var sceneObj = {
				title: data.chapters[i].title,
				templateUrl: data.chapters[i].template,
				startTime: data.chapters[i].start,
				endTime: data.chapters[i].end,
				isActive: false,
				wasActive: false,
				transmedia: []
			};

			var scenesLen = $scope.scenes.push(sceneObj);

			// since we're creating anonymous callbacks in a loop we
			// create a closure to preserve variable scope in each iteration
			(function(sceneIdx){
				timelineSvc.subscribe({
					begin: $scope.scenes[sceneIdx].startTime,
					end: $scope.scenes[sceneIdx].endTime
				}, function(span, evt, playheadPos) {
					console.log("Callback event:", evt, "for: ", $scope.scenes[sceneIdx].title);
					$scope.episode.playheadPosition = playheadPos;
					if (evt === timelineSvc.ENTER) {
						$scope.scenes[sceneIdx].isActive = true;
						$scope.episode.currentScene = sceneObj;
					}
					else if (evt === timelineSvc.EXIT) {
						$scope.scenes[sceneIdx].isActive = false;
						$scope.scenes[sceneIdx].wasActive = true;
					}
					console.log("isActive set to:", $scope.scenes[sceneIdx].isActive, "and wasActive set to:", $scope.scenes[sceneIdx].wasActive);
				});
			})(scenesLen-1);
		}

		// create transmedia and sort them into their respective scenes based on their start times
		// TODO: sort and combine transmedia array(s) before looping, they should be in order of start times otherwise the end time calculations could break
		for (var i=0; i < data.transmedia.length; i++) {

			var transmediaObj = {
				title: data.transmedia[i].title,
				templateUrl: data.transmedia[i].template,
				startTime: data.transmedia[i].start
			};
			
			transmediaObj.displayTime = Math.floor(transmediaObj.startTime/60) + ":" + ("0"+Math.floor(transmediaObj.startTime)%60).slice(-2);

			for (var j=0; j < $scope.scenes.length; j++) {
				if (transmediaObj.startTime >= $scope.scenes[j].startTime &&
					transmediaObj.startTime <= $scope.scenes[j].endTime) {
					$scope.scenes[j].transmedia.push(transmediaObj);
					break;
				}
			}
		}

		// TODO: Temporary until we bind to timeline service
		for (var i=0; i < $scope.scenes.length; i++) {
			$scope.scenes[i].currentTransmedia = $scope.scenes[i].transmedia[0];
		}

		console.log("EPISODE CONTROLLER SCOPE:", $scope);

	})
	.error(function(data, status, headers, config) {
		// TODO: Should probably be using a service instead of root scope
		$rootScope.uiErrorMsg = "Unable to load data for Episode: " + $routeParams.epId;
		$location.path('/error');
	});

}]);
