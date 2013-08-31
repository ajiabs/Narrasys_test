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
		$scope.episode = {
			title: data.episode.title,
			templateUrl: data.episode.template
		};

		$scope.scenes = [];
		for (var i=0; i < data.chapters.length; i++) {
			$scope.scenes.push({
				title: data.chapters[i].title,
				templateUrl: data.chapters[i].template
			});
		}

		$scope.currentScene = $scope.scenes[0];
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