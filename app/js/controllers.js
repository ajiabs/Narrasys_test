'use strict';

// Declare the player.controllers module
angular.module('player.controllers', [])

// UI Error Controller (Shows an error through the UI)
.controller('UIErrorController', ['$scope', '$rootScope', function($scope, $rootScope) {

	$scope.errorMsg = $rootScope.uiErrorMsg || 'The requested route does not exist. Please use /episode/<episodeId> format.';

}])
	
// Episode Controller
.controller('EpisodeController', ['$scope', '$rootScope', '$location', '$routeParams', '$http', function($scope, $rootScope, $location, $routeParams, $http) {

	$http({method: 'GET', url: 'remote/data/episode-' + $routeParams.epId + '.json'})
	.success(function(data, status, headers, config) {
		$scope.episode = {
			title: data.episode.title,
			templateUrl: data.episode.template
		};
	})
	.error(function(data, status, headers, config) {
		$rootScope.uiErrorMsg = "Unable to load data for Episode: " + $routeParams.epId;
		$location.path('/error');
	});

}]);