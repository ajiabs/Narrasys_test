'use strict';

angular.module('com.inthetelling.player')
	.controller('ItemController', function($scope, modelSvc, timelineSvc) {

		$scope.seek = function(t) {
			timelineSvc.seek(t, "clickedOnItem", $scope.item._id);
		};


		$scope.editItem = function($event) {
			if (modelSvc.appState.producer) {
				modelSvc.appState.videoControlsActive = true;
				modelSvc.appState.editing = angular.copy($scope.item); // to change this to  live preview, don't use angular.copy.  But need to stash a copy of the original in case the user wants to undo...
			}
			$event.preventDefault();
		};


	});
