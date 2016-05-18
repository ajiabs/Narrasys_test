(function () {
	'use strict';
	/* For now this is just a thin wrapper around the playerController */

	angular.module('com.inthetelling.story')
		.controller('ittNarativeTimelineCtrl', ittNarativeTimelineCtrl)
		.directive('ittNarrativeTimeline', ittNarrativeTimeline);

	function ittNarativeTimelineCtrl($scope, $routeParams, appState, dataSvc, authSvc) {
		appState.init();
		appState.product = 'player';
		dataSvc.getNarrative($routeParams.narrativePath)
			.then(function (narrative) {
				appState.narrativeId = narrative._id;
				$scope.narrative = narrative;
				// console.log('NARRATIVE: ', narrative);
				var narrativeRole = authSvc.getRoleForNarrative(narrative._id);
				var defaultProduct = authSvc.getDefaultProductForRole(narrativeRole);
				appState.product = defaultProduct;
				angular.forEach(narrative.timelines, function (timeline) {
					if (
						timeline._id === $routeParams.timelinePath ||
						timeline.path_slug.en === $routeParams.timelinePath
					) {
						appState.timelineId = timeline._id;
						if (timeline.episode_segments[0]) {
							appState.episodeId = timeline.episode_segments[0].episode_id;
							appState.episodeSegmentId = timeline.episode_segments[0]._id;
							$scope.showPlayer = true;
						}
					}
				});
				if (!appState.episodeId) {
					errorSvc.error({
						data: "Sorry, no episode was found in this timeline."
					});
				}
			}).catch(function(e) {
				console.log('that explains it', e);
			})
	}


	function ittNarrativeTimeline() {
		return {
			restrict: 'A',
			replace: true,
			templateUrl: 'templates/player-timeline.html',
			controller: 'ittNarativeTimelineCtrl'
		};
	}


})();
