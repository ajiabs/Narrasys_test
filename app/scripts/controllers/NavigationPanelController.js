'use strict';

// Controller for the navigation panel overlay
angular.module('com.inthetelling.player')
	.controller('NavigationPanelController', function ($scope, videojs) {

		// convenience method for the template to change playhead position
		$scope.gotoScene = function (time) {
			// set the video playhead to the scene's start time
			videojs.player.currentTime(time);
			$scope.hidePanels();
		};

	});
