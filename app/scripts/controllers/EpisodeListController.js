'use strict';

angular.module('com.inthetelling.story')
	.controller('EpisodeListController', function ($scope, config, dataSvc) {

		$scope.loading = true;
		dataSvc.getAllContainers().then(function (data) {

			$scope.containers = data;
			$scope.loading = false;
		});
	});
