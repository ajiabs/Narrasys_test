'use strict';

/* Declare the player.controllers module and its dependencies */

angular.module('player.controllers', []).
	
	// Episode Controller
	controller('EpisodeCtrl', ['$scope', function($scope) {
		$scope.currTemplate = "partials/episode.html";
	}])
	
	// Scene Controller
	.controller('SceneCtrl', ['$scope', function($scope) {
		$scope.currTemplate = "partials/scene.html";
	}]);
	
	// Transmedia Controller
	//.controller('TransmediaCtrl', [function() {
		
	//}]);
