'use strict';

// Controller for the search panel results
angular.module('com.inthetelling.story')
	.controller('SearchPanelController', function ($scope, $timeout, timelineSvc, modelSvc, appState) {

		// default sort order
		$scope.sortBy = "startTime";

		$scope.toggleSortBy = function (sortedBy) {
			$scope.sortBy = getFlippedSortValue(sortedBy);
			appState.autoscroll = ($scope.sortBy === 'startTime'); // autoscroll only when sorted by time
		};

		$scope.getToggledValue = function (currentSortBy) {
			return getFlippedSortValue(currentSortBy);
		};

		var getFlippedSortValue = function (current) {
			if (current === "startTime") {
				return "type";
			} else {
				return "startTime";
			}
		};

		$scope.getFriendlySortText = function (sortBy) {
			if (sortBy === "startTime") {
				return "time";
			} else {
				return "type";
			}
		};

		// NOTE this is only called from episodeUI -- searchMode does not reach this! (which is probably what we want)
		$scope.seek = function (t, eventID) {
			$scope.enableAutoscroll(); // in playerController
			timelineSvc.seek(t, "clickedOnEventInSearch", eventID);
		};

		// generate searchable text for the episode (on demand).
		// TODO need to handle multi-episode timelines.

		$scope.indexed = false;
		$scope.indexEvents = function () {
			// console.log("indexEvents", $scope.episode.items);
			if (!$scope.episode.items) {
				$timeout(function () { // HACK Sorry, future me
					$scope.indexEvents();
				}, 300);
				return false;
			}
			$scope.indexed = true;
			// map the increasingly-misnamed producerItemType to search categories.
			// Array so we can control sort order in panel.
			$scope.typeCategories = [
				"transcript", "annotation", "file", "image", "link", "video", "question", ""
			];

			// map type literals to pretty/printable version. 
			$scope.showTypes = {
				transcript: {
					name: "Transcript",
					items: []
				},
				annotation: {
					name: "Annotations",
					items: []
				},
				file: {
					name: "Files",
					items: []
				},
				image: {
					name: "Images",
					items: []
				},
				link: {
					name: "Links",
					items: []
				},
				video: {
					name: "Videos",
					items: []
				},
				question: {
					name: "Questions",
					items: []
				},
				other: {
					name: "Other",
					items: []
				}
			};

			angular.forEach($scope.episode.items, function (item) {
				if (item._type !== 'Scene') {
					// build 'by type' arrays:
					if (item.producerItemType) {
						$scope.showTypes[item.producerItemType].items.push(item);
					} else {
						$scope.showTypes.other.items.push(item);
					}
				}
			});
		};

	});
