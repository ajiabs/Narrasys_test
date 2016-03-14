'use strict';
import './plugin/newrelic';
import '../config';

import angular from 'angular';
import 'angular-route';
import 'angular-animate';
import 'angular-sanitize';
import Filters from './filters/filters';

import Controllers from './controllers/Controllers.module';
import Directives from './directives/directives.module';
import Services from './services/services.module';
import Templates from './templates';
import Configs from './app.module.configs';
import * as Styles from '../styles/styles';

// Declare the top level application module and its dependencies
let ittApp = angular.module('iTT', [
	Configs.name,
	'ngRoute',
	'ngAnimate',
	//'textAngular',
	'ngSanitize',
	Filters.name,
	Templates.name,
	Controllers.name,
	Directives.name,
	Services.name
])


// Configure routing
.config(function ($routeProvider) {
	'ngInject';
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
			template: '<div class="standaloneAncillaryPage"><div itt-narrative-list></div></div>'
		})
		.when('/story', {
			template: '<div class="standaloneAncillaryPage"><div itt-narrative></div></div>'
		})
		.when('/story/:narrativePath', {
			template: '<div class="standaloneAncillaryPage"><div itt-narrative></div></div>'
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
		.when('/episodes', {
			title: "Available episodes",
			templateUrl: 'templates/producer/episodelist.html'
		})
		.when('/episode/:epId', {
			title: "Telling STORY",
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
			title: "Telling STORY",
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
			title: "Telling STORY",
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
			title: "Telling STORY",
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
})

.run(function ($rootScope, errorSvc) {
	'ngInject';
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
});

export default ittApp;
