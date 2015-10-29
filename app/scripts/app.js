'use strict';

// Declare the top level application module and its dependencies
angular.module('com.inthetelling.story', ['ngRoute', 'ngAnimate', 'ngSanitize', 'textAngular'])

// Configure routing
.config(function ($routeProvider) {

	var forceVideoDisposal = function ($q, $timeout, $rootScope) {
		// Workaround for a probable race condition TS-813 -- videoController $destroy isn't always killing the video object on its own during route changes.)
		// If we manually trigger that $destroy before attempting the route change, the issue seems to go away.
		// There's certainly a more DRY way to include forceVideoDisposal in every route's resolve, but eh
		var defer = $q.defer();
		$rootScope.$emit('video.forceDisposal');
		// wait a tick for videoController to handle that, then continue the route change:
		$timeout(function () {
			defer.resolve();
		});
		return defer.promise;
	};

	$routeProvider
		.when('/', {
			title: "Telling STORY",
			templateUrl: 'templates/root.html',
			resolve: {
				unloadVideo: forceVideoDisposal
			}
		})
		.when('/auth', {
			templateUrl: 'templates/auth.html',
			reloadOnSearch: false,
			resolve: {
				unloadVideo: forceVideoDisposal
			}
		})
		.when('/user', {
			template: '<div class="standaloneAncillaryPage"><div itt-user></div></div>',
			resolve: {
				unloadVideo: forceVideoDisposal
			}
		})
		.when('/stories', {
			title: "Existing narratives",
			template: '<div class="standaloneAncillaryPage"><div itt-narrative-list></div></div>',
			resolve: {
				unloadVideo: forceVideoDisposal
			}
		})
		.when('/story', {
			template: '<div class="standaloneAncillaryPage"><div itt-narrative></div></div>',
			resolve: {
				unloadVideo: forceVideoDisposal
			}
		})
		.when('/story/:narrativePath', {
			template: '<div class="standaloneAncillaryPage"><div itt-narrative></div></div>',
			resolve: {
				unloadVideo: forceVideoDisposal
			}

		})
		.when('/story/:narrativePath/:timelinePath', {
			template: '<div itt-narrative-timeline></div>',
			resolve: {
				product: function (appState) {
					appState.product = "player";
					appState.productLoadedAs = "narrative";
				},
				unloadVideo: forceVideoDisposal
			}
		})
		.when('/episodes', {
			title: "Available episodes",
			templateUrl: 'templates/producer/episodelist.html',
			resolve: {
				unloadVideo: forceVideoDisposal
			}
		})
		.when('/episode/:epId', {
			title: "Telling STORY",
			controller: 'PlayerController',
			templateUrl: 'templates/player.html',
			resolve: {
				product: function (appState) {
					appState.product = "player";
					appState.productLoadedAs = "player";
				},
				unloadVideo: forceVideoDisposal
			}
		})
		.when('/episode/:epId/:viewMode', {
			title: "Telling STORY",
			controller: 'PlayerController',
			templateUrl: 'templates/player.html',
			resolve: {
				product: function (appState) {
					appState.product = "player";
					appState.productLoadedAs = "player";
				},
				unloadVideo: forceVideoDisposal
			}
		})
		.when('/sxs/:epId', {
			title: "Telling STORY",
			controller: 'PlayerController',
			templateUrl: 'templates/player.html',
			resolve: {
				product: function (appState) {
					appState.product = "sxs";
					appState.productLoadedAs = "sxs";
				},
				unloadVideo: forceVideoDisposal
			}
		})
		.when('/editor/:epId', {
			title: "Telling STORY",
			controller: 'PlayerController',
			templateUrl: 'templates/player.html',
			resolve: {
				product: function (appState) {
					appState.product = "sxs";
					appState.productLoadedAs = "sxs";
				},
				unloadVideo: forceVideoDisposal
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
				},
				unloadVideo: forceVideoDisposal
			}
		})
		.when('/assets/:containerId', {
			title: "Container Assets test",
			controller: 'ContainerAssetsTestController',
			template: '<div class="standaloneAncillaryPage"><div><a class="goUp" href="#episodes">Episodes</a><div sxs-container-assets="containerId"></div></div></div>',
			resolve: {
				unloadVideo: forceVideoDisposal
			}
		})
		.when('/event/:eventId', {
			title: "Event test",
			controller: 'EventTestController',
			templateUrl: 'templates/testbed-event.html',
			resolve: {
				unloadVideo: forceVideoDisposal
			}
		})
		.otherwise({
			title: "Telling STORY: Error",
			controller: 'ErrorController',
			templateUrl: 'templates/error-404.html',
			resolve: {
				unloadVideo: forceVideoDisposal
			}
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
		if (
			fhotkb ||
			document.activeElement.tagName === 'INPUT' ||
			document.activeElement.tagName === 'TEXTAREA' ||
			document.activeElement.attributes.contenteditable
		) {
			return;
		}

		fhotkb = true;
		if (e.keyCode === 27) {
			$rootScope.$emit("userKeypress.ESC");
			e.preventDefault();
		}
		if (e.which === 32) {
			$rootScope.$emit("userKeypress.SPACE");
			e.preventDefault();
		}

	});
	$(document).on("keyup", function () {
		fhotkb = false; // oh good they've woken up
	});
})

// Configure x-domain resource whitelist (TODO: do we actually need this?)
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
				errorSvc.error(rejection);
				return $q.reject(rejection);
			}
		};
	});
})

// Configuration for textAngular toolbar
.config(function ($provide) {
	$provide.decorator('taOptions', ['taRegisterTool', '$delegate', function (taRegisterTool, taOptions) { // $delegate is the taOptions we are decorating
		taOptions.toolbar = [
			['h1', 'h2', 'h3'],
			['bold', 'italics', 'underline', 'strikeThrough'],
			['ul', 'ol'],
			['undo', 'redo', 'clear']
			// ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
			// ['justifyLeft','justifyCenter','justifyRight','indent','outdent'],
			// ['html', 'insertImage', 'insertLink', 'insertVideo', 'wordcount', 'charcount']
		];
		return taOptions;
	}]);
});
