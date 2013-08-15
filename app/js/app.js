'use strict';

/* Declare the top-level application module 'player' and its dependencies */

angular.module('player', ['player.filters', 'player.services', 'player.directives', 'player.controllers', 'ui.state']).
	
	// Application States
	config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
		
		// For any unmatched url, send to route
		$urlRouterProvider.otherwise("/episode");
		
		$stateProvider
			
			// Episode State
			.state('episode', {
				controller: 'EpisodeCtrl',
				url: "/episode",
				templateUrl: "partials/episode.html"
				//url: "/{bind-to-epid-in-controller}",
				//templateUrl: function (stateParams) {
				//	console.log("stateParams:" + stateParams);
				//	return "{map-to-template-for-epid}";
				//}
			})
			
			// Scene State
			.state('episode.scene', {
				controller: 'SceneCtrl',
				url: "/scene",
				templateUrl: "partials/scene.html"
				//url: "/{bind-to-sceneid-in-controller}",
				//templateUrl: function (stateParams) {
				//	console.log("stateParams:" + stateParams);
				//	return "{map-to-template-for-sceneid}";
				//}
			});
		
	}]);
