'use strict';

angular.module('com.inthetelling.player')
	.controller('EpisodeController', function($scope, modelSvc, $routeParams, timelineSvc) {
		console.log('EpisodeController');

		$scope.episode = modelSvc.episode($routeParams.epId);
		$scope.appState = modelSvc.appState;


	});
