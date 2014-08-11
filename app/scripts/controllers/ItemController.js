'use strict';

angular.module('com.inthetelling.story')
	.controller('ItemController', function ($scope, timelineSvc) {

		$scope.seek = function (t) {
			timelineSvc.seek(t, "clickedOnItem", $scope.item._id);
		};

		// $scope.editItem = function($event) {
		// 	if (appState.producer) {
		// 		appState.editing = angular.copy($scope.item); // to change this to  live preview, don't use angular.copy.  But need to stash a copy of the original in case the user wants to undo...
		// 	}
		// 	$event.preventDefault();
		// };

	});
