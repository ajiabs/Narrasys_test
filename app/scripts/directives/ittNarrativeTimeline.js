'use strict';
/* For now this is just a thin wrapper around the playerController */

angular.module('com.inthetelling.story')
	.directive('ittNarrativeTimeline', function ($routeParams, $timeout, dataSvc, appState, modelSvc, errorSvc) {
		return {
			restrict: 'A',
			replace: true,
			templateUrl: 'templates/player-timeline.html',

			link: function (scope) {
				appState.init();

				appState.product = "player";
				dataSvc.getNarrative($routeParams.narrativePath).then(function (narrative) {
					appState.narrativeId = narrative._id;
					scope.narrative = narrative;
					angular.forEach(narrative.timelines, function (timeline) {
						// TODO remove this hack to work around i18n paths when the api is sorted
						if (timeline.path === $routeParams.timelinePath ||
							timeline.path.en === $routeParams.timelinePath) {
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
