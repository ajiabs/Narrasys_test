'use strict';

// Controller for the search panel overlay
angular.module('com.inthetelling.player')
.controller('SearchPanelController', function ($scope, videojs) {

	// map for the search panel checkboxes to bind to, which can also be passed to the type filter
	$scope.selectedItemTypes = {
		transcript: true,
		link: true,
		slide: true,
		indepth: true,
		project: true,
		discussion: true
	};

	// convenience method for the template to change playhead position
	$scope.gotoItem = function(item) {
		// set the video playhead to the item's start time
		videojs.player.currentTime(item.startTime);
		$scope.$close();
	};

});
