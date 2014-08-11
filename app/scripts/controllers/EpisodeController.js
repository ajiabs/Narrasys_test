'use strict';

angular.module('com.inthetelling.story')
	.controller('EpisodeController', function ($scope, $routeParams, modelSvc, appState) {
		$scope.episode = modelSvc.episode(appState.episodeId);
		$scope.appState = appState;
	});
