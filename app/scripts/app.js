'use strict';

// Declare the top level application module and its dependencies
//angular.module('com.inthetelling.player', ['ngRoute', 'ngAnimate', 'pasvaz.bindonce'])
angular.module('com.inthetelling.player', ['ngRoute', 'ngAnimate'])

// Configure routing
.config(function ($routeProvider) {
	$routeProvider
		.when('/episodes', {
			title: "Telling STORY: All episodes",
			templateUrl: 'templates/episodelist.html'
		})
		.when('/episode/:epId', {
			title: "Telling STORY",
			controller: 'PlayerController',
			templateUrl: 'templates/player.html',
			reloadOnSearch: false
		})
		.when('/episode/:epId/:viewMode', {
			title: "Telling STORY",
			controller: 'PlayerController',
			templateUrl: 'templates/player.html',
			reloadOnSearch: false
		})
		.otherwise({
			title: "Telling STORY: Error",
			controller: 'ErrorController',
			templateUrl: 'templates/error.html'
			//			redirectTo: '/error' // only for 404s
		});
	//$locationProvider.html5Mode(false); // TODO sigh, can't get the server config working for this... thought we had it but IE still choked
})

// set page titles on route changes:
.run(function ($rootScope) {
	$rootScope.$on("$routeChangeSuccess", function (event, currentRoute, previousRoute) {
		document.title = currentRoute.title ? currentRoute.title : 'Telling STORY';
	});
})

// Configure x-domain resource whitelist
.config(function ($sceDelegateProvider) {
	$sceDelegateProvider.resourceUrlWhitelist([
		'self',
		/.*/,
		/^https?:\/\/platformuniv-p.edgesuite.net/
	]);
})

// Configure http headers
.config(function ($httpProvider) {
	/*
	$httpProvider.defaults.headers.get = {
		'Authorization': 'Token token="c7624368e407355eb587500862322413"',
		'Content-Type': 'application/json'
	};
	*/
	$httpProvider.defaults.useXDomain = true;
	$httpProvider.defaults.withCredentials = true;
	delete $httpProvider.defaults.headers.common['X-Requested-With'];
})

;
