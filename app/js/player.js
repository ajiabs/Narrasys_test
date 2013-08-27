'use strict';

// Declare the top level application module 'player'
angular.module('player', [
	// dependencies
	'ngRoute',
	'player.filters',
	'player.services',
	'player.directives',
	'player.controllers'
])

// Configure routing
.config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/', {
			controller: function($scope) {
				$scope.message = 'The requested route does not exist. Please use /episode/<episodeId> format.'
			},
			templateUrl: 'partials/error.html',
		})
		.when('/episode/:episodeId', {
			controller: 'EpisodeController',
			templateUrl: function(routeParams) {
				return 'remote/templates/episode-' + routeParams.episodeId + '.html'
			}
		})
		.otherwise({redirectTo: '/'});
}]);