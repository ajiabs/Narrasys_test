'use strict';

// Controller for ittItem
angular.module('com.inthetelling.player')
.controller('ItemController', function ($scope, modalMgr) {

	// pass through method to modal.createItemDetailOverlay() for templates
	$scope.launchDetailView = function() {
		modalMgr.createItemDetailOverlay($scope);
	};

});
