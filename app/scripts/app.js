'use strict';


// Declare the top level application module and its dependencies
/**
 * @ngdoc interface
 * @name iTT
 * @description
 * The default namespace / angular module which houses the rest of the application code.
 * Officially titled as 'com.inthetelling.story' but iTT seems a little less verbose
 * @requires ngRoute
 * @requires ngAnimate
 * @requires ngSanitize
 * @requires textAngular
 */
angular.module('com.inthetelling.story', ['ngRoute', 'ngAnimate', 'ngSanitize', 'textAngular', 'ui.tree'])
	.constant('MIMES', {
		'assetLib': 'image/*,text/plain,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/rtf',
		'file': 'text/plain,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/rtf',
		'default': 'image/*',
		'transcripts': 'text/vtt,text/srt'
	})
	.constant('PLAYERSTATES', {
		'-1': 'unstarted',
		'0': 'ended',
		'1': 'playing',
		'2': 'paused',
		'3': 'buffering',
		'5': 'video cued',
		'4': 'quality changed',
		'6': 'player ready'
	})
	.constant('PLAYERSTATES_WORD', {
		'unstarted': '-1',
		'ended': '0',
		'playing': '1',
		'paused': '2',
		'buffering': '3',
		'quality changed': '4',
		'video cued': '5',
		'player ready': '6'
	})
	// Configure routing
	.config(function ($routeProvider) {
		$routeProvider
			.when('/', {
				title: "Narrative Producer",
				templateUrl: 'templates/root.html'
			})
			.when('/auth', {
				templateUrl: 'templates/auth.html',
				reloadOnSearch: false
			})
			.when('/account', {
				template: [
					'<div class="standaloneAncillaryPage">',
					'	<itt-nav on-logout="logout()"></itt-nav>',
					'	<h1>My Account</h1>',
					'	<div itt-user></div>',
					'</div>'
				].join(''),
				controller: ['$scope', 'authSvc', function ($scope, authSvc) {
					$scope.logout = authSvc.logout;
				}]
			})
			.when('/stories', {
				title: "Available Narratives",
				template: [
					'<div class="standaloneAncillaryPage">',
					'	<itt-nav on-logout="logout()"></itt-nav>',
					'	<h1>Narratives</h1>',
					'	<div itt-narrative-list narratives-data="narrativesResolve" customers-data="customersResolve"></div>',
					'</div>'
				].join('\n'),
				controller: 'NarrativesCtrl',
				resolve: {
					narrativesResolve: function ($route, $q, ittUtils, authSvc, dataSvc, modelSvc) {

						//needs to be an array
            var cachedCustomers = modelSvc.getCustomersAsArray();
						//if use visits /story/:id prior to visiting this route, they will have a single
						//narrative in modelSvc. We consider the cache 'empty' if the only narrative
						//in it came from loading data for /story/:id. Otherwise when they visit
						// /stories, the only listing they would see would be the narrative from
						// /stories/:id.
						var isCached = Object.keys(cachedCustomers).length > 0;

						if (isCached) {
							//since this is going to be displayed in a dropdown, it needs to be an array of objects.

							return $q(function (resolve) {
								return resolve({c: cachedCustomers});
							});
						}

						// return authSvc.authenticate().then(function () {
						// 	return dataSvc.getCustomerList().then(function (customers) {
						// 		return dataSvc.getNarrativeList().then(function (narratives) {
						// 			angular.forEach(narratives, function (n) {
						// 			  var cust = modelSvc.customers[n.customer_id];
						// 				n.subDomain = cust.domains[0];
						// 				modelSvc.cache('narrative', n);
						// 			});
						// 			return {n: narratives, c: customers};
						// 		});
						// 	});
						// });

            return authSvc.authenticate().then(function () {
              return dataSvc.getCustomerList().then(function (customers) {
                return {c: customers};
              });
            });
					}
				}
			})
			.when('/story/:narrativePath', {
				template: [
					'<div class="standaloneAncillaryPage">',
					'	<itt-nav on-logout="logout()"></itt-nav>',
					'	<div itt-narrative narrative-data="narrativeResolve" customer-data="customersResolve">',
					'</div>'
				].join(''),
				controller: 'NarrativeCtrl',
				resolve: {
					narrativeResolve: function ($route, $q, authSvc, dataSvc, modelSvc, ittUtils) {
						var pathOrId = $route.current.params.narrativePath;
						//this only pulls from the cache.
						var cachedNarr = modelSvc.getNarrativeByPathOrId(pathOrId);
						var cachedCustomers;

						var doPullFromCache = ittUtils.existy(cachedNarr) &&
							ittUtils.existy(cachedNarr.path_slug) &&
							ittUtils.existy(cachedNarr.timelines) &&
							(cachedNarr.path_slug.en === pathOrId || cachedNarr._id === pathOrId);

						if (doPullFromCache) {
							cachedCustomers = modelSvc.getCustomersAsArray();
							return $q(function (resolve) {
								return resolve({n: cachedNarr, c: cachedCustomers});
							});
						}
						return dataSvc.getNarrative(pathOrId).then(function (narrativeData) {
							return dataSvc.getCustomerList().then(function (customers) {
								return {n: narrativeData, c: customers};
							});
						});
					}
				}
			})
			.when('/story/:narrativePath/:timelinePath', {
				template: '<div itt-narrative-timeline></div>',
				resolve: {
					product: function (appState) {
						appState.product = "player";
						appState.productLoadedAs = "narrative";
					}
				}
			})
			.when('/projects', {
				title: "Available projects",
				templateUrl: 'templates/producer/episodelist.html'
			})
			.when('/episode/:epId', {
				title: "Narrative Producer",
				controller: 'PlayerController',
				templateUrl: 'templates/player.html',
				resolve: {
					product: function (appState) {
						appState.product = "player";
						appState.productLoadedAs = "player";
					}
				}
			})
			.when('/episode/:epId/:viewMode', {
				title: "Narrative Producer",
				controller: 'PlayerController',
				templateUrl: 'templates/player.html',
				resolve: {
					product: function (appState) {
						appState.product = "player";
						appState.productLoadedAs = "player";
					}
				}
			})
			.when('/sxs/:epId', {
				title: "Narrative Producer",
				controller: 'PlayerController',
				templateUrl: 'templates/player.html',
				resolve: {
					product: function (appState) {
						appState.product = "sxs";
						appState.productLoadedAs = "sxs";
					}
				}
			})
			.when('/editor/:epId', {
				title: "Narrative Producer",
				controller: 'PlayerController',
				templateUrl: 'templates/player.html',
				resolve: {
					product: function (appState) {
						appState.product = "sxs";
						appState.productLoadedAs = "sxs";
					}
				}
			})
			.when('/producer/:epId', {
				title: "Narrative Producer",
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
				template: [
					'<div class="standaloneAncillaryPage">',
					'	<itt-nav on-logout="logout()"></itt-nav>',
					'	<div>',
					'		<div sxs-container-assets="containerId" mime-key="assetLib"></div>',
					'	</div>',
					'</div>'].join(''),
				resolve: {
					authEffects: ['authSvc', function (authSvc) {
						//to ensure that canAccess is properly set.
						return authSvc.authenticate().then(angular.noop);
					}]
				}
			})
			.when('/event/:eventId', {
				title: "Event test",
				controller: 'EventTestController',
				templateUrl: 'templates/testbed-event.html'
			})
			.otherwise({
				title: "Narrative Producer: Error",
				controller: 'ErrorController',
				templateUrl: 'templates/error-404.html'
			});

		//$locationProvider.html5Mode(false); // TODO we had trouble getting the server config working for this... thought we had it but IE still choked
	})

	.run(function ($rootScope, errorSvc) {

		$rootScope.$on("$routeChangeSuccess", function (event, currentRoute) {
			document.title = currentRoute.title ? currentRoute.title : 'Narrative Producer';
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
			taOptions.defaultFileDropHandler = function (a, b) {}; //jshint ignore:line
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
	})

	.config(function ($compileProvider) {
		var isDev = false;
		var currentHost = window.location.hostname;
		if (currentHost.indexOf('localhost') === 0 || currentHost.indexOf('api-dev') === 0) {
			isDev = true;
		}

		if (isDev === false) {
			$compileProvider.debugInfoEnabled(false);
		}
	});
