'use strict';

angular.module('com.inthetelling.player')
	.controller('EpisodeListController', function($scope, config, dataSvc, appState) {

		dataSvc.getEpisodeList().then(function(data) {
			$scope.episodes = data;
		});

		$scope.authenticate = function(episodeID) {
			console.warn("clearing localStorage for reauthentication");
			if (localStorage) {
				localStorage.removeItem("storyAuth");
			}
			appState.user = {};
			window.location = (config.apiDataBaseUrl + "/pages/launch_oauth2?episode=" + episodeID);

		};
	});
