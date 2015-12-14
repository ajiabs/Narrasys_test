'use strict';
/*

 TODO:

 split this file up into separate directive files
 when displaying a narrative, compare its user_id to the current user's id to set isOwner
 i18n


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
export default function ittNarrative(authSvc, appState, $location, $routeParams, modelSvc, dataSvc) {
	'ngInject';
	return {
		template: function () {
			return '<div ng-include="narrative.templateUrl"></div>';
		},

		link: function (scope) {
			//console.log("ittNarrative");
			scope.loading = true;

			scope.logout = authSvc.logout;

			// TODO remove this when I build in real template support
			scope.tmpSetNarrativeTemplate = function () {
				scope.narrative.templateUrl = 'templates/narrative/default.html';
				if ($routeParams.admin) {
					scope.narrative.templateUrl = 'templates/narrative/edit.html';
				}
			};

			// TEMPORARY
			scope.stopEditing = function () {
				$location.search('admin', null);
			};

			// Need to let getNarrative do the authentication, so it can pass the narrative ID.
			var doAfterAuthentication = function () {
				scope.userHasRole = authSvc.userHasRole;
				scope.user = appState.user;
				if (authSvc.userHasRole('admin')) {
					dataSvc.getCustomerList().then(function (data) {
						scope.customerList = data;
					});
				}
			};

			scope.isOwner = false;
			scope.toggleOwnership = function () {
				scope.isOwner = !scope.isOwner;
			};

			// The route param might be the narrative path or its ID (both are interchangeable in the API)
			var path_or_id = (scope._id) ? scope._id : $routeParams.narrativePath;

			if (path_or_id) {
				// For simplicity's sake, not trying to retrieve narrative from cache; just get it from the API for now.
				dataSvc.getNarrative(path_or_id).then(function (narrativeData) {
					doAfterAuthentication();
					scope.loading = false;
					scope.narrative = narrativeData;
					scope.tmpSetNarrativeTemplate();
				});
			} else {
				authSvc.authenticate().then(doAfterAuthentication);
				// New narrative
				console.log("CREATE NEW NARRATIVE");
				scope.loading = false;
				scope.toggleOwnership(true);
				scope.narrative = {};
				scope.tmpSetNarrativeTemplate();
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

					// dataSvc.createUserGroup({
					// 	en: "All users"
					// }).then(function (groupData) {
					// 	scope.narrative.everyone_group_id = groupData._id;
					// 	scope.narrative.sub_groups_id = [];

					dataSvc.createNarrative(
						scope.narrative
					).then(function (narrativeData) {

						$location.path('/story/' + narrativeData._id);
					});

					// });
				});

			};

			scope.updateNarrative = function () {
				scope.narrative.saveInProgress = true;

				dataSvc.updateNarrative(scope.narrative).then(function () {
					scope.tmpSetNarrativeTemplate();
					scope.narrative.saveInProgress = false;
				});
			};

			scope.addTimeline = function (epId) {
				dataSvc.getEpisodeOverview(epId).then(function (episodeData) {

					var newTimeline = {
						"name": episodeData.title,
						"description": episodeData.description,
						"hidden": false,
						"path_slug": "",
						"sort_order": scope.narrative.timelines.length,
						"parent_episode": episodeData
					};

					// as long as we're here, get the duration before moving on:
					dataSvc.getSingleAsset(episodeData.master_asset_id).then(function (data) {
						if (data) {
							newTimeline.duration = data.duration;
						} else {
							newTimeline.duration = 0;
						}
						scope.narrative.timelines.push(newTimeline);
						scope.isAddingTimeline = true;
					});

				});

			};

			scope.saveTimeline = function (timeline) {
				timeline.saveInProgress = true;
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
						dataSvc.storeTimeline(scope.narrative._id, timeline).then(function (timelineData) {
							// create episode segment
							dataSvc.createEpisodeSegment(timelineData._id, {
								"episode_id": childEpisode._id,
								"start_time": 0,
								"end_time": timeline.duration,
								"sort_order": 0,
								"timeline_id": timelineData._id
							}).then(function (segmentData) {
								// store the segment in the timeline
								timelineData.episode_segments = [segmentData];
								dataSvc.storeTimeline(scope.narrative._id, timelineData).then(function () {
									scope.isAddingTimeline = false;
									// finally, refresh the narrative data:
									var narrativeId = scope.narrative._id;
									dataSvc.getNarrative(narrativeId).then(function () {
										scope.narrative = modelSvc.narratives[narrativeId];
										scope.tmpSetNarrativeTemplate();
									});
								});
							});
						});
					});
				}
			};
		}
	};
}
