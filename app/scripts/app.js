'use strict';

// Declare the top level application module and its dependencies
angular.module('com.inthetelling.story', ['ngRoute', 'ngAnimate', 'ngSanitize'])

// Configure routing
.config(function ($routeProvider) {
	$routeProvider
		.when('/', {
			title: "Telling STORY",
			templateUrl: 'templates/root.html'
		})
		.when('/auth', {
			templateUrl: 'templates/auth.html',
			reloadOnSearch: false
		})
		.when('/user', {
			template: '<div class="standaloneAncillaryPage"><div itt-user></div></div>'
		})
		.when('/stories', {
			title: "Existing narratives",
			template: '<div class="standaloneAncillaryPage"><div itt-narrative-list></div></div>',
		})
		.when('/story', {
			template: '<div class="standaloneAncillaryPage"><div itt-narrative></div></div>',
		})
		.when('/story/:narrativePath', {
			template: '<div class="standaloneAncillaryPage"><div itt-narrative></div></div>',
		})
		.when('/story/:narrativePath/:timelinePath', {
			template: '<div itt-narrative-timeline></div>',
			reloadOnSearch: false
		})
		.when('/episodes', {
			title: "Available episodes",
			templateUrl: 'templates/producer/episodelist.html'
		})
		// Was for testing uploads
		// .when('/upload', {
		// 	title: "Upload test",
		// 	templateUrl: 'templates/producer/upload.html'
		// })
		.when('/episode/:epId', {
			title: "Telling STORY",
			controller: 'PlayerController',
			templateUrl: 'templates/player.html',
			resolve: {
				product: function (appState) {
					appState.product = "player";
				}
			}
		})
		.when('/episode/:epId/:viewMode', {
			title: "Telling STORY",
			controller: 'PlayerController',
			templateUrl: 'templates/player.html',
			resolve: {
				product: function (appState) {
					appState.product = "player";
				}
			}
		})
		.when('/sxs/:epId', {
			title: "Telling STORY",
			controller: 'PlayerController',
			templateUrl: 'templates/player.html',
			resolve: {
				product: function (appState) {
					appState.product = "sxs";
				}
			}
		})
		.when('/editor/:epId', {
			title: "Telling STORY",
			controller: 'PlayerController',
			templateUrl: 'templates/player.html',
			resolve: {
				product: function (appState) {
					appState.product = "sxs";
				}
			}
		})
		.when('/producer/:epId', {
			title: "Telling STORY",
			controller: 'PlayerController',
			templateUrl: 'templates/player.html',
			resolve: {
				product: function (appState) {
					appState.product = "producer";
					appState.productLoadedAs = "producer";
				}
			}
		})
		.when('/assets/:containerId', {
			title: "Container Assets test",
			controller: 'ContainerAssetsTestController',
			template: '<div style="margin:1em" class="admin"><a class="goUp" href="#episodes">Episodes</a><div sxs-container-assets="containerId"></div></div>',
		})
		.when('/event/:eventId', {
			title: "Event test",
			controller: 'EventTestController',
			templateUrl: 'templates/testbed-event.html',
		})
		.otherwise({
			title: "Telling STORY: Error",
			controller: 'ErrorController',
			templateUrl: 'templates/error-404.html'
		});

	//$locationProvider.html5Mode(false); // TODO we had trouble getting the server config working for this... thought we had it but IE still choked
})

.run(function ($rootScope, errorSvc) {

	$rootScope.$on("$routeChangeSuccess", function (event, currentRoute) {
		document.title = currentRoute.title ? currentRoute.title : 'Telling STORY';
		errorSvc.init(); // clear display of any errors from the previous route
	});

	// globally emit rootscope event for certain keypresses:
	var fhotkb = false; // user's forehead is not on the keyboard
	$(document).on("keydown", function (e) {
		if (!fhotkb && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
			fhotkb = true;
			if (e.keyCode === 27) {
				$rootScope.$emit("userKeypress.ESC");
				e.preventDefault();
			}
			if (e.which === 32) {
				$rootScope.$emit("userKeypress.SPACE");
				e.preventDefault();
			}
		}
	});
	$(document).on("keyup", function () {
		fhotkb = false; // oh good they've woken up
	});
})

// Configure x-domain resource whitelist (TODO: do we actually need this?) (TODO: is this the answer to youtube/safari woes?)
.config(function ($sceDelegateProvider) {
	$sceDelegateProvider.resourceUrlWhitelist([
		'self',
		/.*/,
		/^http(s)?:\/\/platformuniv-p.edgesuite.net/,
		/^http(s)?:\/\/themes.googleusercontent.com/
	]);
})

// Configure http headers and intercept http errors
.config(function ($httpProvider) {
	$httpProvider.defaults.useXDomain = true;
	$httpProvider.defaults.withCredentials = true;
	delete $httpProvider.defaults.headers.common['X-Requested-With'];

	$httpProvider.interceptors.push(function ($q, errorSvc) {
		return {
			'responseError': function (rejection) {
				// console.log("RESPONSEERROR", rejection);
				errorSvc.error(rejection);
				return $q.reject(rejection);
			}
		};
	});
});
