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
			template: '<div ng-include="episode.templateUrl">Loading Episode...</div>'
		})
		.otherwise({redirectTo: '/error'});
}])

// App kickoff
.run(['timelineSvc', '$window', function(timelineSvc, $window) {
	// fake a timeline provider (temporary until videoJSWrapper directive is finished)
	var setPlayhead = timelineSvc.registerProvider('mockTimeline', 1000);
	var position = 0;
	$window.setInterval(function(){
		position += 1;
		setPlayhead(position);
	}, 1000);
}]);