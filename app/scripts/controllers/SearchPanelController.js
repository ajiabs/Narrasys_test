'use strict';

// Controller for the search panel results
angular.module('com.inthetelling.player')
	.controller('SearchPanelController', function($scope, timelineSvc) {

		// map which we could in future also bind to user selection of types.
		// TODO should use categories instead of item "type".  But to do that we need to define categories
		$scope.searchTypes = {
			Annotation: true,
			Link: true,
			Upload: true
		};

		// map type literals to pretty/printable version
		$scope.searchTypeNames = {
			Annotation: "Transcript",
			Link: "Link",
			Upload: "Image"
		};

		// default sort order
		$scope.sortBy = "startTime";

		$scope.seek = function(t, eventID) {
			$scope.enableAutoscroll(); // in playerController
			timelineSvc.seek(t, "clickedOnEventInSearch", eventID);
		};

		// generate searchable text for the episode (on demand).
		// TODO handle more than one episode.....
		$scope.indexEvents = function() {
			angular.forEach($scope.episode.items, function(item) {
				item.searchableText = (item.annotation || item.description) + " " + (item.title || item.annotator);
			});
		};

	});
