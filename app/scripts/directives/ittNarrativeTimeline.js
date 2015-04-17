'use strict';
/* For now this is just a thin wrapper around the playerController */

angular.module('com.inthetelling.story')
	.directive('ittNarrativeTimeline', function ($routeParams, $timeout, dataSvc, appState, modelSvc, dataMgr, timelineTranslator, errorSvc) {
		return {
			restrict: 'A',
			replace: true,
			templateUrl: 'templates/player-timeline.html',

			link: function (scope) {
				appState.init();

				appState.product = "player";
				dataSvc.getNarrative($routeParams.narrativePath) //TODO: move this to dataMgr. get rid of dependency on dataSvc (from here)
					.then(function (narrative) {
						appState.narrativeId = narrative._id;
						scope.narrative = narrative;


						angular.forEach(narrative.timelines, function (timeline) {
							// TODO remove this hack to work around i18n paths when the api is sorted
							//
							// Let's set episode segments instead of one segment

							if (timeline.path === $routeParams.timelinePath ||
								timeline.path.en === $routeParams.timelinePath) {

								//TEMP:  I'd like to move this to a single place that kicks off the data init. probably do it where getEpisodes is (PlayerController)
								// I'm not doing this now because I'm trying to isolate the change/risk to just the new narratives routes
								appState.timeline = timeline; //use timelineid, and then leverage datasvc on init...

								var handleEpisodeSegmentData = function (segment) {
									return function (data) {
										console.log('handleEpisodeSegmentData: ', data);
										modelSvc.cache("episode", dataSvc.resolveIDs(data.episode)); //TODO: resolveIDs? where should this live?
										//assets
										for (var a = 0, lena = data.expanded.assets.length; a < lena; a++) {
											data.expanded.assets[a].cur_episode_id = data.episode._id;
											modelSvc.cache("asset", data.expanded.assets[a]);
										}
										modelSvc.resolveEpisodeAssets(data.episode._id);
										//containers
										for (var b = 0, lenb = data.expanded.containers.length; b < lenb; b++) {
											data.expanded.containers[b].cur_episode_id = data.episode._id;
											modelSvc.cache("container", data.expanded.containers[b]);
										}
										modelSvc.resolveEpisodeContainers(data.episode._id);
										//events
										var segmentTimelineStart = timelineTranslator.getTimelineTimeFromSegmentTime(timeline.episode_segments, segment, 0);
										for (var c = 0, lenc = data.expanded.events.length; c < lenc; c++) {
											data.expanded.events[c].cur_episode_id = data.episode._id;
											var eventStartActual = segmentTimelineStart + (data.expanded.events[c].start_time - segment.start_time);
											var eventEndActual = segmentTimelineStart + (data.expanded.events[c].end_time - segment.start_time);
											data.expanded.events[c].start_time = eventStartActual;

											data.expanded.events[c].end_time = eventEndActual;
											modelSvc.cache("event", dataSvc.resolveIDs(data.expanded.events[c]));
										}
										modelSvc.resolveEpisodeEvents(data.episode._id);
									};
								};
								var segments = timeline.episode_segments;
								for (var i = 0, len = segments.length; i < len; i++) {
									(function (seg) {
										var segment = seg;

										dataMgr.getEpisodeSegmentExpandedBySegmentId(segment._id)
											.then(handleEpisodeSegmentData(segment));
									})(segments[i]);
								}
								modelSvc.cache("timeline", timeline);
								appState.timelineId = timeline._id;
								//single episode work... TODO: remove 
								var sortSegments = function (segmentA, segmentB) {

									var a = parseInt(segmentA.sort_order, 10);
									var b = parseInt(segmentB.sort_order, 10);
									return a - b;
								};
								timeline.episode_segments = timeline.episode_segments.sort(sortSegments);
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
