'use strict';

angular.module('com.inthetelling.player')
	.controller('EpisodeController', function($scope, $routeParams, modelSvc, appState) {
		console.log('EpisodeController');

		$scope.episode = modelSvc.episode(appState.episodeId);
		$scope.appState = appState;


	});
