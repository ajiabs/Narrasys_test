'use strict';

// Controller for the search panel overlay
angular.module('com.inthetelling.player')
.controller('SearchPanelController', function ($scope, videojs) {

	// map for the search panel checkboxes to bind to, which can also be passed to the type filter
	$scope.searchTypes = {
		transcript: true,
		link: true,
		slide: true,
		indepth: true,
		project: true,
		discussion: true
	};

	// for the sort control to bind to
	$scope.sortBy = "startTime";

	// map type literals to pretty/printable version
	$scope.prettyTypeMap = {
		transcript: "Transcripts",
		link: "Links",
		slide: "Slides",
		indepth: "In Depth",
		project: "Projects",
		discussion: "Discussions"
	};

	// create a dictionary of all items keyed by their type, for easy view iteration
	// TODO: JSPerfTest this to see how expensive it is and move it to main controller if necessary
	$scope.allItemsByType = {};
	var i, j;
	for (i=0; i < $scope.scenes.length; i++) {
		for (j=0; j < $scope.scenes[i].items.length; j++) {
			if (!$scope.allItemsByType[$scope.scenes[i].items[j].type]) {
				$scope.allItemsByType[$scope.scenes[i].items[j].type] = [];
			}
			$scope.allItemsByType[$scope.scenes[i].items[j].type].push($scope.scenes[i].items[j]);
		}
	}

	// convenience method for the template to change playhead position
	$scope.gotoItem = function(item) {
		// set the video playhead to the item's start time
		videojs.player.currentTime(item.startTime);
		$scope.$close();
	};

});
