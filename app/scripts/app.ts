
import './plugin/newrelic';
import '../config';

import 'angular';
import 'angular-route';
import 'angular-animate';
import 'angular-sanitize';
import 'angular-ui-tree';
import './filters/filters';
import './controllers/Controllers.module';
import './directives/directives.module';
import './services/services.module';
import './templates';
import './app.module.third-party.ts';
import './app.module.configs';
import '../styles/styles';

// Declare the top level application module and its dependencies
let ittApp = angular.module('iTT', [
	'ngRoute',
	'ngAnimate',
	'ngSanitize',
	'iTT.3rdPartyLibs',
	'iTT.configs',
	'iTT.filters',
	'iTT.templates',
	'iTT.controllers',
	'iTT.directives',
	'iTT.services'
])

// Configure routing
.config(['$routeProvider', function ($routeProvider) {
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
			template: '<div class="standaloneAncillaryPage"><div itt-narrative-list narratives-data="narrativesResolve" customers-data="customersResolve"></div></div>',
			controller: 'NarrativesCtrl',
			resolve: {
				narrativesResolve: ['$route', '$q', 'ittUtils', 'authSvc', 'dataSvc', 'modelSvc', function($route, $q, ittUtils, authSvc, dataSvc, modelSvc) {
					var cachedNars = modelSvc.narratives;
					var cachedCustomers;
					//if use visits /story/:id prior to visiting this route, they will have a single
					//narrative in modelSvc. We consider the cache 'empty' if the only narrative
					//in it came from loading data for /story/:id. Otherwise when they visit
					// /stories, the only listing they would see would be the narrative from
					// /stories/:id.
					var isCached = Object.keys(cachedNars).length > 1;

					if (isCached) {
						//since this is going to be displayed in a dropdown, it needs to be an array of objects.
						cachedCustomers = Object.keys(modelSvc.customers).map(function(c) { return modelSvc.customers[c]; });
						return $q(function(resolve) {
							return resolve({n: cachedNars, c: cachedCustomers});
						});
					}

					return authSvc.authenticate().then(function() {
						return dataSvc.getCustomerList().then(function(customers) {
							return dataSvc.getNarrativeList().then(function(narratives) {
								angular.forEach(narratives, function(n) {
									n.subDomain = modelSvc.customers[n.customer_id].domains[0];
									modelSvc.cache('narrative', n);
								});
								return {n: narratives, c: customers};
							});
						});
					});
				}]
			}
		})
		.when('/story/:narrativePath', {
			template: '<div class="standaloneAncillaryPage"><div itt-narrative narrative-data="narrativeResolve" customer-data="customersResolve"></div></div>',
			controller: 'NarrativeCtrl',
			resolve: {
				narrativeResolve: ['$route', '$q', 'authSvc', 'dataSvc', 'modelSvc', 'ittUtils', function($route, $q, authSvc, dataSvc, modelSvc, ittUtils) {
					var pathOrId = $route.current.params.narrativePath;
					//this only pulls from the cache.
					var cachedNarr = modelSvc.getNarrativeByPathOrId(pathOrId);
					var cachedCustomers;

					var doPullFromCache = ittUtils.existy(cachedNarr) &&
						ittUtils.existy(cachedNarr.path_slug) &&
						ittUtils.existy(cachedNarr.timelines) &&
						(cachedNarr.path_slug.en === pathOrId || cachedNarr._id === pathOrId);

					if (doPullFromCache) {
						cachedCustomers = Object.keys(modelSvc.customers).map(function(c) { return modelSvc.customers[c]; });
						return $q(function(resolve) {return resolve({n:cachedNarr, c: cachedCustomers });});
					}
					return dataSvc.getNarrative(pathOrId).then(function(narrativeData) {
						return dataSvc.getCustomerList().then(function(customers) {
							return {n: narrativeData, c: customers};
						});
					});
				}]
			}
		})
		.when('/story/:narrativePath/:timelinePath', {
			template: '<div itt-narrative-timeline></div>',
			resolve: {
				product: ['appState', function (appState) {
					appState.product = "player";
					appState.productLoadedAs = "narrative";
				}]
			}
		})
		.when('/episodes', {
			title: "Available episodes",
			templateUrl: 'templates/producer/episodelist.html'
		})
		.when('/episode/:epId', {
			title: "Telling STORY",
			controller: 'PlayerController',
			templateUrl: 'templates/player.html',
			resolve: {
				product: ['appState', function (appState) {
					appState.product = "player";
					appState.productLoadedAs = "player";
				}]
			}
		})
		.when('/episode/:epId/:viewMode', {
			title: "Telling STORY",
			controller: 'PlayerController',
			templateUrl: 'templates/player.html',
			resolve: {
				product: ['appState', function (appState) {
					appState.product = "player";
					appState.productLoadedAs = "player";
				}]
			}
		})
		.when('/sxs/:epId', {
			title: "Telling STORY",
			controller: 'PlayerController',
			templateUrl: 'templates/player.html',
			resolve: {
				product:['appState', function (appState) {
					appState.product = "sxs";
					appState.productLoadedAs = "sxs";
				}]
			}
		})
		.when('/editor/:epId', {
			title: "Telling STORY",
			controller: 'PlayerController',
			templateUrl: 'templates/player.html',
			resolve: {
				product: ['appState', function (appState) {
					appState.product = "sxs";
					appState.productLoadedAs = "sxs";
				}]
			}
		})
		.when('/producer/:epId', {
			title: "Telling STORY",
			controller: 'PlayerController',
			templateUrl: 'templates/player.html',
			resolve: {
				product: ['appState',function (appState) {
					appState.product = "producer";
					appState.productLoadedAs = "producer";
				}]
			}
		})
		.when('/assets/:containerId', {
			title: "Container Assets test",
			controller: 'ContainerAssetsTestController',
			template: '<div class="standaloneAncillaryPage"><div><a class="goUp" href="#episodes">Episodes</a><div sxs-container-assets="containerId"></div></div></div>'
		})
		.when('/event/:eventId', {
			title: "Event test",
			controller: 'EventTestController',
			templateUrl: 'templates/testbed-event.html'
		})
		.otherwise({
			title: "Telling STORY: Error",
			controller: 'ErrorController',
			templateUrl: 'templates/error-404.html'
		});

	//$locationProvider.html5Mode(false); // TODO we had trouble getting the server config working for this... thought we had it but IE still choked
}])

.run(['$rootScope', 'errorSvc', function ($rootScope, errorSvc) {
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
}]);

export default ittApp;
