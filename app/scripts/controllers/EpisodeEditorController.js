'use strict';

angular.module('com.inthetelling.story')
	.controller('EpisodeEditorController', function ($scope, $routeParams, config, dataSvc, errorSvc, modelSvc, appState) {

		appState.init();
		errorSvc.init();
		appState.episodeId = $routeParams.epId;
		dataSvc.getEpisode(appState.episodeId);
		$scope.episode = modelSvc.episodes[appState.episodeId];

	});
