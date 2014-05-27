'use strict';

angular.module('com.inthetelling.player')
	.controller('EpisodeListController', function ($scope, dataSvc) {

		dataSvc.getEpisodeList().then(function(data) {
			$scope.episodes = data;
		});
	});
