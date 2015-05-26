'use strict';

// Controller for the search panel results
angular.module('com.inthetelling.story')
	.controller('SearchPanelController', function ($scope, timelineSvc, modelSvc) {

		// default sort order
		$scope.sortBy = "startTime";
		$scope.setSortBy = function (sortedBy) {
			$scope.sortBy = sortedBy;
		};
		$scope.toggleSortBy = function (sortedBy) {
			$scope.sortBy = getFlippedSortValue(sortedBy);
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
		$scope.seek = function (t, eventID) {
			$scope.enableAutoscroll(); // in playerController
			timelineSvc.seek(t, "clickedOnEventInSearch", eventID);
		};

		// generate searchable text for the episode (on demand).
		// TODO need to handle multi-episode timelines.

		$scope.indexEvents = function () {

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
					item.searchableText = (item.display_annotation || item.display_description) + " " + (item.display_title || item.display_annotator);
					if (!item.cosmetic) {
						item.cosmetic = false; // otherwise events without a cosmetic field at all will get filtered out
					}
					if (item.sxs) { // HACK
						item.cosmetic = false;
					}
					if (item.avatar_id) {
						item.avatar = modelSvc.assets[item.avatar_id];
					}
					// build 'by type' arrays:
					if (item.producerItemType) {
						$scope.showTypes[item.producerItemType].items.push(item);
					} else {
						$scope.showTypes["other"].items.push(item);
					}
				}
			});
		};

	});
