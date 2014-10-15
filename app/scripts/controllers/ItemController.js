'use strict';

angular.module('com.inthetelling.story')
	.controller('ItemController', function ($scope, timelineSvc) {
		$scope.seek = function (t) {
			timelineSvc.seek(t, "clickedOnItem", $scope.item._id);
		};

	});
