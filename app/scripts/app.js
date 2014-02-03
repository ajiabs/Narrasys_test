'use strict';

// Declare the top level application module and its dependencies
angular.module('com.inthetelling.player', ['ngRoute', 'ngAnimate'])

// Configure routing
.config(function ($routeProvider, $locationProvider) {
	$routeProvider
		.when('/error', {
			controller: 'UIErrorController',
			templateUrl: 'templates/error.html'
		})
		.when('/episode/:epId', {
			controller: 'EpisodeController',
			template: '<div ng-include="episode.templateUrl">Loading Episode...</div>'
		})
		.when('/episode/:epId/:authKey', {
			controller: 'EpisodeController',
			template: '<div ng-include="episode.templateUrl">Loading Episode...</div>'
		})
		.otherwise({
				redirectTo: '/error'
			} // TODO I'd rather not rewrite the url if the user makes a typo; is there a better way to handle errors than a route redirect?
	);
	$locationProvider.html5Mode(false); // TODO sigh, can't get the server config working for this... thought we had it but IE still choked
})

// Configure x-domain resource whitelist
.config(function ($sceDelegateProvider) {
	$sceDelegateProvider.resourceUrlWhitelist([
		'self',
		/.*/,
		/^https?:\/\/danielbeck.net/,
		/^https?:\/\/platformuniv-p.edgesuite.net/
	]);
})

// Configure http headers
.config(function($httpProvider) {
	/*
	$httpProvider.defaults.headers.get = {
		'Authorization': 'Token token="c7624368e407355eb587500862322413"',
		'Content-Type': 'application/json'
	};
	*/
	$httpProvider.defaults.useXDomain = true;
	$httpProvider.defaults.withCredentials = true;
	delete $httpProvider.defaults.headers.common['X-Requested-With'];
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
