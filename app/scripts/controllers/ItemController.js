'use strict';

// Controller for ittItem
angular.module('com.inthetelling.player')
.controller('ItemController', function ($scope, $element, videojs) {

	
	
	// convenience method to set video time
	$scope.gotoItem = function() {
		videojs.player.currentTime($scope.item.startTime);
	};

});
