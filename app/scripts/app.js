'use strict';

// Declare the top level application module and its dependencies
angular.module('com.inthetelling.player', ['ngRoute', 'ngAnimate', 'pasvaz.bindonce'])

// Configure routing
.config(function($routeProvider, $locationProvider) {
	$routeProvider
		.when('/error', {
			controller: 'UIErrorController',
			templateUrl: 'templates/error.html'
		})
		.when('/episode/:epId', {
			controller: 'EpisodeController',
			templateUrl: 'templates/player.html',
			reloadOnSearch: false
		})
		.when('/episode/:epId/:authKey', {
			controller: 'EpisodeController',
			templateUrl: 'templates/player.html',
			reloadOnSearch: false
		})
	/*
		.when('/seekritbackdoor/inventory',{
			controller: 'Inventory',
			templateUrl: 'templates/inventory.html'
		})
*/
	.otherwise({
		redirectTo: '/error' // only for 404s
	});
	$locationProvider.html5Mode(false); // TODO sigh, can't get the server config working for this... thought we had it but IE still choked
})

// Configure x-domain resource whitelist
.config(function($sceDelegateProvider) {
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

	// Add an interceptor to globally catch 401 errors and do something with them:
	$httpProvider.responseInterceptors.push(['$q',
		function(scope, $q) {
			function success(response) {
				return response;
			}

			function error(response) {
				var status = response.status;
				if (status === 401) {
					console.log("INTERCEPTOR GOT 401");
					if (localStorage.storyAuth) {
						// read the login url, if there is one, and redirect to it:
						var storedData = angular.fromJson(localStorage.storyAuth);
						localStorage.removeItem("storyAuth");
						if (storedData.login_url) {
							if (storedData.login_via_top_window_only) {
								window.top.location.href = storedData.login_url;
							} else {
								window.location.href = storedData.login_url;
							}
						}
					}
					// if all else fails, force a reload as guest
					window.location.reload();
					return false;
				}
				console.log("INTERCEPTOR REJECT:", response);
				// return $q.reject(response);
			}
			return function(promise) {
				return promise.then(success, error);
			};
		}
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
