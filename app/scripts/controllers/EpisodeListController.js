'use strict';

angular.module('com.inthetelling.player')
	.controller('EpisodeListController', function($scope, config, dataSvc) {

		dataSvc.getEpisodeList().then(function(data) {
			$scope.episodes = data;
		});

		$scope.authenticate = function(episodeID) {
			console.log("clearing localStorage for reauthentication");
			if (localStorage) {
				localStorage.removeItem("storyAuth");
			}
			window.location = (config.apiDataBaseUrl + "/pages/launch_oauth2?episode=" + episodeID);

		};
	});
