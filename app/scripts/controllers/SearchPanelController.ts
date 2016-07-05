'use strict';

// Controller for the search panel results
SearchPanelController.$inject = ['$scope', '$rootScope', '$timeout', 'timelineSvc', 'modelSvc', 'appState'];

export default function SearchPanelController($scope, $rootScope, $timeout, timelineSvc, modelSvc, appState) {
	// Events searchableText is:
	// (event.display_annotation || event.display_description) + " " + (event.display_title || event.display_annotator)

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
				"transcript", "annotation", "file", "image", "link", "video", "question", "other"
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

			var padDigits = function (number, digits) {
				return new Array(Math.max(digits - String(parseInt(number, 10)).length + 1, 0)).join(0) + number;
			};

			angular.forEach($scope.episode.items, function (item) {
				// Chrome has decided to sort these alphabetically instead of numerically...
				item.wtfchromesort = padDigits(item.start_time, 5);

				// include cosmetic items only in producer:
				if (appState.product !== 'producer' && item.cosmetic) {
					return;
				}
				if (item._type === 'Scene') {
					return;
				}

				// build 'by type' arrays:
				if (item.producerItemType && $scope.showTypes[item.producerItemType]) {
					$scope.showTypes[item.producerItemType].items.push(item);
				} else {
					$scope.showTypes.other.items.push(item);
				}

				// control whether annotations are shown header-style:
				if (item.producerItemType === 'annotation') {
					// HACK template url dependency
					item.showAsHeader = !(item.templateUrl.match(/(transmedia|definition)/));
				}
			});
		};

		$rootScope.$on('searchReindexNeeded', $scope.indexEvents); // HACK

}
