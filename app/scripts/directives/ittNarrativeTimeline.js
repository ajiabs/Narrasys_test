'use strict';
/* For now this is just a thin wrapper around the playerController */

angular.module('com.inthetelling.story')
	.directive('ittNarrativeTimeline', function ($routeParams, $timeout, dataSvc, appState, authSvc, modelSvc, errorSvc) {
		return {
			restrict: 'A',
			replace: true,
			templateUrl: 'templates/player-timeline.html',

			link: function (scope) {
				appState.init();
				//        console.log('user', appState.user);
				//appState.product = "player";
				dataSvc.getNarrative($routeParams.narrativePath)
					.then(function (narrative) {
						appState.narrativeId = narrative._id;
						scope.narrative = narrative;
						var narrativeRole = authSvc.getRoleForNarrative(narrative._id);
						var defaultProduct = authSvc.getDefaultProductForRole(narrativeRole);
						appState.product = defaultProduct;
						angular.forEach(narrative.timelines, function (timeline) {
							// TEMP COMPAT
							if (timeline.path && !timeline.path_slug) {
								timeline.path_slug = angular.copy(timeline.path);
							}
							if (
								timeline._id === $routeParams.timelinePath ||
								timeline.path_slug.en === $routeParams.timelinePath ||
								timeline.path === $routeParams.timelinePath
							) {
								appState.timelineId = timeline._id;
								if (timeline.episode_segments[0]) {
									appState.episodeId = timeline.episode_segments[0].episode_id;
									appState.episodeSegmentId = timeline.episode_segments[0]._id;
									scope.showPlayer = true;
								}
							}
						});
						if (!appState.episodeId) {
							errorSvc.error({
								data: "Sorry, no episode was found in this timeline."
							});
						}
					});

			}
		};

	});
