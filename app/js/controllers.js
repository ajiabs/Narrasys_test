'use strict';

// Declare the player.controllers module
angular.module('player.controllers', [])

// UI Error Controller (Shows an error through the UI)
.controller('UIErrorController', ['$scope', '$rootScope', function($scope, $rootScope) {

	$scope.errorMsg = $rootScope.uiErrorMsg || 'The requested route does not exist. Please use /episode/<episodeId> format.';

}])
	
// Episode Controller
.controller('EpisodeController', ['$timeout', '$scope', '$rootScope', '$location', '$routeParams', '$http', function($timeout, $scope, $rootScope, $location, $routeParams, $http) {

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
				endTime: data.chapters[(i+1)] ? data.chapters[(i+1)].start-1 : 9999999999999999999999999999, //TODO: no magic numbers
				transmedia: []
			};
			$scope.scenes.push(sceneObj);
		}

		// TODO: Temporary until we bind to timeline service
		$scope.episode.currentScene = $scope.scenes[0];

		// sort transmedia into their respective scenes based on their start times
		for (var i=0; i < data.transmedia.length; i++) {
			// GREG: is there a reason not to do this instead of copying individual data fields in one at a time)?
			var transmediaObj = data.transmedia[i];

			transmediaObj.templateUrl = transmediaObj.template; // why two names?
			transmediaObj.startTime = transmediaObj.start;      // ditto
			
			// more conversions (is this the appropriate place for these?
			transmediaObj.displayTime = Math.floor(transmediaObj.start/60) + ":" + ("0"+Math.floor(transmediaObj.start)%60).slice(-2);

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

		/*
		$timeout(function(){
			$scope.currentScene = $scope.scenes[1];
		}, 2000);
		*/
	})
	.error(function(data, status, headers, config) {
		// TODO: Should probably be using a service instead of root scope
		$rootScope.uiErrorMsg = "Unable to load data for Episode: " + $routeParams.epId;
		$location.path('/error');
	});

}]);
