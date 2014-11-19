'use strict';

angular.module('com.inthetelling.story')
	.controller('EpisodeListController', function ($scope, config, dataSvc) {

		// TODO call modelSvc.deriveContainer for each container in the tree... also confirm that appState exists here

		$scope.loading = true;
		dataSvc.getAllContainers().then(function (data) {

			$scope.containers = data;
			$scope.loading = false;
		});
	});
