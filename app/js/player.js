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
		.when('/error', {
			controller: 'UIErrorController',
			templateUrl: 'partials/error.html'
		})
		.when('/episode/:epId', {
			controller: 'EpisodeController',
			template: '<div ng-include="episode.templateUrl">Loading...</div>'
		})
		.otherwise({redirectTo: '/error'});
}]);