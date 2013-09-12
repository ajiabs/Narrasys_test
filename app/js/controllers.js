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
			templateUrl: data.episode.template
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

			// since we're creating anonymous callbacks in a loop we
			// create a closure to preserve variable scope in each iteration
			(function(sceneObj){
				timelineSvc.subscribe({
					begin: sceneObj.startTime,
					end: sceneObj.endTime
				}, function(span, evt, playheadPos) {
					$scope.$apply(function(){
						if (evt === timelineSvc.ENTER) {
							sceneObj.isActive = true;
						}
						else if (evt === timelineSvc.EXIT) {
							sceneObj.isActive = false;
							sceneObj.wasActive = true;
						}
					});
				});
			})(sceneObj);

			$scope.scenes.push(sceneObj);
		}

		// create transmedia and sort them into their respective scenes based on their start times
		// TODO: sort and combine transmedia array(s) before looping, they should be in order of start times otherwise the end time calculations could break
		for (var i=0; i < data.transmedia.length; i++) {

			var transmediaObj = {
				title: data.transmedia[i].title,
				templateUrl: data.transmedia[i].template,
				startTime: data.transmedia[i].start,
				endTime: data.transmedia[i].end,
				displayTime: Math.floor(data.transmedia[i].start/60) + ":" + ("0"+Math.floor(data.transmedia[i].start)%60).slice(-2)
			};

			// since we're creating anonymous callbacks in a loop we
			// create a closure to preserve variable scope in each iteration
			(function(transmediaObj){
				timelineSvc.subscribe({
					begin: transmediaObj.startTime,
					end: transmediaObj.endTime
				}, function(span, evt, playheadPos) {
					$scope.$apply(function(){
						if (evt === timelineSvc.ENTER) {
							transmediaObj.isActive = true;
						}
						else if (evt === timelineSvc.EXIT) {
							transmediaObj.isActive = false;
							transmediaObj.wasActive = true;
						}
					});
				});
			})(transmediaObj);
			
			// TODO: If a transmedia item ever spanned across scene boundaries it would
			// not be added to any scene container and we are not handling that case
			for (var j=0; j < $scope.scenes.length; j++) {
				if (transmediaObj.startTime >= $scope.scenes[j].startTime &&
					transmediaObj.startTime <= $scope.scenes[j].endTime) {
					$scope.scenes[j].transmedia.push(transmediaObj);
					break;
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
