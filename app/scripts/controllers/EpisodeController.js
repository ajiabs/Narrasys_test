'use strict';

angular.module('com.inthetelling.player')
	.controller('EpisodeController', function($scope, modelSvc, $routeParams) {
		console.log('EpisodeController');

		$scope.episode = modelSvc.episode(modelSvc.appState.episodeId);
		$scope.appState = modelSvc.appState;


	});
