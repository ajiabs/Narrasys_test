'use strict';

/*

TODO: i18n


To create a narrative:
* get the user ID, make a group containing that ID, 
* create narrative with name,description,group id

TO add a timeline:
* user chooses a parent episode

* create timeline with name,description,hidden,path, sort_order
* make a child episode of parent episode
* make an episode segment (needs timeline id, start, end, child episode id, sort_order)

* then reload narrative/resolve

(resolve should sort timelines and segments, API won't necessarily handle this for us)

to update narrative or timeline: just send the basic fields, not the fully-resolved data.




*/
angular.module('com.inthetelling.story')
	.directive('ittNarrativeList', function (dataSvc, authSvc) {
		return {
			restrict: 'A',
			replace: true,
			templateUrl: 'templates/narrative/narrativelist.html',

			link: function (scope) {
				authSvc.authenticate().then(function () {
					scope.userIsAdmin = authSvc.userHasRole('admin');
					console.log(scope.userIsAdmin);
				});

				dataSvc.getNarrativeList().then(function (narratives) {
					scope.narratives = narratives;
					console.log("XXXXXX", scope.narratives);
				});
			}
		};
	})
	.directive('ittNarrativeTimeline', function ($routeParams, $timeout, dataSvc, appState, modelSvc, errorSvc) {
		return {
			restrict: 'A',
			replace: true,
			templateUrl: 'templates/narrative/timeline.html',

			link: function (scope) {
				// for now this simply points to the episode player.  When timelines support multiple segments this will need to change significantly
				console.log('ittNarrativeTimeline link');
				appState.init();
				appState.narrativeId = $routeParams.narrativeId;
				scope.narrativeId = $routeParams.narrativeId;
				appState.product = "player";

				dataSvc.getNarrative(scope.narrativeId).then(function () {
					console.log("NARRATIVE IS ", modelSvc.narratives[scope.narrativeId]);
					var narr = modelSvc.narratives[scope.narrativeId];
					angular.forEach(narr.timelines, function (timeline) {
						if (timeline.path === $routeParams.timelinePath) {
							console.log("TL IS ", timeline);
							if (timeline.episode_segments[0]) {

								appState.episodeId = timeline.episode_segments[0].episode_id;
								appState.episodeSegmentId = timeline.episode_segments[0]._id;

								/* 
								player will need to know this is a segment instead of an episode, so for its events it will call
								/v3/episode_segments/:episode_segment_id/events intead of /v3/episode/:episode_id/events

								For v1 I am just going to skip all that and send the parent episode ID to the player since we are only using full episodes at this point
								*/

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
	})
	.directive('ittNarrative', function (authSvc, $location, $routeParams, userSvc, modelSvc, dataSvc, errorSvc) {
		return {
			scope: {
				_id: '=ittNarrative',
			},
			templateUrl: "templates/narrative/narrative.html",

			link: function (scope, element) {
				scope.loading = true;
				authSvc.authenticate().then(function () {
					scope.userIsAdmin = authSvc.userHasRole('admin');
				});

				scope.isOwner = false;
				scope.toggleOwnership = function (x) {
					console.log(x);
					scope.isOwner = x;
				};

				var narrativeId = (scope._id) ? scope.id : $routeParams.narrativeId;
				if (narrativeId) {
					scope.narrative = modelSvc.narratives[narrativeId];
					if (scope.narrative) {
						scope.loading = false;
					} else {
						dataSvc.getNarrative(narrativeId).then(function () {
							scope.narrative = modelSvc.narratives[narrativeId];
							scope.loading = false;
						}, function () {
							scope.loading = false;
							errorSvc.error({
								data: "No narrative with that ID exists."
							});

						});

					}
				} else {
					scope.loading = false;
					scope.toggleOwnership(true);
					scope.narrative = {};
				}

				scope.toggleEpisodeList = function () {
					scope.showEpisodeList = !scope.showEpisodeList;
				};

				scope.$on('episodeSelected', function (evt, epId) {
					scope.showEpisodeList = false;
					scope.addTimeline(epId);
				});

				scope.createNarrative = function () {
					// get the current user's id
					// create a group

					// create a narrative with that group
					// add the user to the group
					// redirect
					authSvc.authenticate().then(function () {
						userSvc.getCurrentUser().then(function (userData) {
							console.log("USER:", userData);

							dataSvc.createUserGroup("All users").then(function (groupData) {
								console.log("Group:", groupData);
								scope.narrative.everyone_group_id = groupData._id;
								scope.narrative.sub_groups_id = [];

								console.log("about to create narrative: ", scope.narrative);
								dataSvc.createNarrative(
									scope.narrative
								).then(function (narrativeData) {
									console.log("created narrative", narrativeData);
									$location.path('/story/' + narrativeData._id);
								});

							});
						});
					});

				};

				scope.updateNarrative = function () {
					scope.narrative.saveInProgress = true;

					dataSvc.updateNarrative(scope.narrative).then(function () {
						scope.narrative.saveInProgress = false;
					});
				};

				scope.addTimeline = function (epId) {
					dataSvc.getEpisodeOverview(epId).then(function (episodeData) {
						console.log("EP:", episodeData);

						var newTimeline = {
							"name": episodeData.title,
							"description": episodeData.description,
							"hidden": false,
							"path": "",
							"sort_order": scope.narrative.timelines.length,
							"parent_episode": episodeData
						};

						// as long as we're here, get the duration before moving on:
						dataSvc.getSingleAsset(episodeData.master_asset_id).then(function (data) {
							newTimeline.duration = data.duration;
							scope.narrative.timelines.push(newTimeline);
							scope.isAddingTimeline = true;
						});

					});

				};

				scope.saveTimeline = function (timeline) {
					console.log("About to store ", timeline);
					timeline.saveInProgress = true;

					// validate path, make sure no other timeline is using it

					if (timeline._id) {
						// updating an existing timeline: just store it
						dataSvc.storeTimeline(scope.narrative._id, timeline).then(function () {
							timeline.saveInProgress = false;
						});
					} else {
						// creating a new timeline is a lot more complex:
						// create child episode, get episode duration, then store a new episode segment, then store the timeline.

						// TODO In future when timelines aren't 1:1 to (child) episodes, split this up into separate actions

						// create child episode
						dataSvc.createChildEpisode({
							"parent_id": timeline.parent_episode._id,
							"title": timeline.name
								//"container_id": timeline.parent_episode.container_id

						}).then(function (childEpisode) {
							console.log("Created child episode", childEpisode);
							dataSvc.storeTimeline(scope.narrative._id, timeline).then(function (timelineData) {
								console.log("Created timeline", timelineData);

								// create episode segment 
								dataSvc.createEpisodeSegment(timelineData._id, {
									"episode_id": childEpisode._id,
									"start_time": 0,
									"end_time": timeline.duration,
									"sort_order": 0,
									"timeline_id": timelineData._id
								}).then(function (segmentData) {
									// store the segment in the timeline
									console.log("Created episode segment", segmentData);
									timelineData.episode_segments = [segmentData];
									console.log(timelineData);
									dataSvc.storeTimeline(scope.narrative._id, timelineData).then(function (atLongLast) {
										console.log("all done:", atLongLast);
										scope.isAddingTimeline = false;

										// refresh the narrative data:
										var narrativeId = scope.narrative._id;
										dataSvc.getNarrative(narrativeId).then(function () {
											scope.narrative = modelSvc.narratives[narrativeId];

										});
									});

								});
							});
						});

					}
				};

				console.log("ittNarrative", scope.narrativeId, element);
			}
		};
	});
