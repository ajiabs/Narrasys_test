'use strict';

/* Declare the top-level application module 'player' and its dependencies */

angular.module('player', ['player.filters', 'player.services', 'player.directives', 'player.controllers', 'ui.state']).
	
	// Application States
	config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
		
		// For any unmatched url, send to route
		$urlRouterProvider.otherwise("/");
		
		$stateProvider
			// Episode State
			.state('episode', {
				controller: 'EpisodeCtrl',
				url: "/episode/:epid",
				templateUrl: function (stateParams) {
					console.log("$stateParams", stateParams);
					return "partials/episode-" + stateParams.epid + ".html";
				}
			})
			// Scene State
			.state('episode.scene', {
				controller: 'SceneCtrl',
				url: "/scene/:scid",
				templateUrl: function (stateParams) {
					console.log("$stateParams", stateParams);
					return "partials/scene-" + stateParams.scid + ".html";
				}
			});
		
	}]);
