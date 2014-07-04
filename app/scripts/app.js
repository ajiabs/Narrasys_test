'use strict';

// Declare the top level application module and its dependencies
//angular.module('com.inthetelling.player', ['ngRoute', 'ngAnimate', 'pasvaz.bindonce'])
angular.module('com.inthetelling.player', ['ngRoute', 'ngAnimate', 'ngSanitize'])

// Configure routing
.config(function($routeProvider) {
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
	// .when('/producer/:epId', {
	// 	title: "Producer",
	// 	controller: 'EpisodeEditorController',
	// 	templateUrl: 'templates/producer/episode.html',
	// 	reloadOnSearch: false
	// })
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


.run(function($rootScope) {
	// set page titles on route changes:
	$rootScope.$on("$routeChangeSuccess", function(event, currentRoute, previousRoute) {
		document.title = currentRoute.title ? currentRoute.title : 'Telling STORY';
	});

	// globally emit rootscope event for certain keypresses:
	$(document).on("keypress", function(e) {
		if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
			if (e.which === 0) {
				$rootScope.$emit("userKeypress.ESC");
				e.preventDefault();
			}
			if (e.which === 32) {
				$rootScope.$emit("userKeypress.SPACE");
				e.preventDefault();
			}
		}
	});
})

// Configure x-domain resource whitelist
.config(function($sceDelegateProvider) {
	$sceDelegateProvider.resourceUrlWhitelist([
		'self',
		/.*/,
		/^https?:\/\/platformuniv-p.edgesuite.net/
	]);
})

// Configure http headers
.config(function($httpProvider) {
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
					console.warn("INTERCEPTOR GOT 401");
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
				console.warn("INTERCEPTOR GOT NON-401 ERROR:", response);
				//return $q.reject(response);
			}
			return function(promise) {
				return promise.then(success, error);
			};
		}
	]);

})

;
