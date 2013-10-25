'use strict';

// Declare the top level application module and its dependencies
angular.module('com.inthetelling.player', ['ngRoute'])

// Configure routing
.config(function($routeProvider) {
	$routeProvider
		.when('/error', {
			controller: 'UIErrorController',
			templateUrl: 'views/error.html'
		})
		.when('/episode/:epId', {
			controller: 'EpisodeController',
			template: '<div ng-include="episode.templateUrl">Loading Episode...</div>'
		})
		.otherwise({redirectTo: '/error'});
})

// Configure x-domain resource whitelist
.config(function($sceDelegateProvider) {
	$sceDelegateProvider.resourceUrlWhitelist([
		'self',
		/^https?:\/\/danielbeck.net/,
		/^https?:\/\/platformuniv-p.edgesuite.net/
	]);
});


/*
.run(['timelineSvc', '$window', function(timelineSvc, $window) {
	// fake a timeline provider (for testing and debugging)
	var setPlayhead = timelineSvc.registerProvider('mockTimeline', 1000);
	var position = 0;
	$window.setInterval(function(){
		position += 1;
		setPlayhead(position);
	}, 1000);
}]);
*/
