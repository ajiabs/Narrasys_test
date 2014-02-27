'use strict';

// Declare the top level application module and its dependencies
angular.module('com.inthetelling.player', ['ngRoute', 'ngAnimate', 'pasvaz.bindonce'])

// Configure routing
.config(function ($routeProvider, $locationProvider) {
	$routeProvider
		.when('/error', {
			controller: 'UIErrorController',
			templateUrl: 'templates/error.html'
		})
		.when('/episode/:epId', {
			controller: 'EpisodeController',
			templateUrl: 'templates/player.html'
		})
		.when('/episode/:epId/:authKey', {
			controller: 'EpisodeController',
			templateUrl: 'templates/player.html'
		})
		.otherwise({
			redirectTo: '/error' // only for 404s
		}
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
