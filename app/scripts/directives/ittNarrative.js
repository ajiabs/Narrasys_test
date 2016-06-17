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
angular.module('com.inthetelling.story')
	.directive('ittNarrative', ittNarrative)
	.controller('ittNarrativeCtrl', ittNarrativeCtrl);

function ittNarrative() {
	return {
		templateUrl: 'templates/narrative/default.html',
		controller: 'ittNarrativeCtrl',
		scope: {
			narrativeData: '='
		}
	};
}

function ittNarrativeCtrl($scope, $location, authSvc, appState, modelSvc, dataSvc) {

	angular.extend($scope, {
		toggleEditing: toggleEditing,
		toggleEditingTimeline: toggleEditingTimeline,
		doneEditingTimeline: doneEditingTimeline,
		toggleOwnership: toggleOwnership,
		toggleEpisodeList: toggleEpisodeList,
		createNarrative: createNarrative,
		updateNarrative: updateNarrative,
		addTimeline: addTimeline,
		saveTimeline: saveTimeline,
		updateTimeline: updateTimeline,
		isEditing: false,
		isEditingTimeline: false
	});

	onInit();
	//set up scope and bindings
	function onInit() {
		$scope.loading = true;
		$scope.logout = authSvc.logout;
		$scope.isOwner = false;

		$scope.narrative = $scope.narrativeData;
		doAfterAuthentication();
		$scope.loading = false;
	}

	function doAfterAuthentication() {
		$scope.userHasRole = authSvc.userHasRole;
		$scope.user = appState.user;
		if (authSvc.userHasRole('admin') || authSvc.userHasRole('customer admin')) {
			dataSvc.getCustomerList().then(function (data) {
				$scope.customerList = data;
			});
		}
	}

	function updateNarrative(update) {
		dataSvc.updateNarrative(update).then(function (resp) {
			$scope.isEditing = false;
			//updateNarrative returns just the new narrative object, without timelines array
			//merge the existing narrative on scope with the one returned via our post resp.
			angular.extend($scope.narrative, resp);
		});
	}

	function toggleEditing() {
		$scope.isEditing = !$scope.isEditing;
	}

	function toggleEditingTimeline(tl) {
		$scope.timelineUnderEdit = tl;
		$scope.isEditingTimeline = !$scope.isEditingTimeline;
	}

	function doneEditingTimeline() {
		$scope.timelineUnderEdit = null;
	}

	function toggleOwnership() {
		$scope.isOwner = !$scope.isOwner;
	}

	function toggleEpisodeList() {
		$scope.showEpisodeList = !$scope.showEpisodeList;
	}

	$scope.$on('episodeSelected', function (evt, epId) {
		$scope.showEpisodeList = false;
		$scope.addTimeline(epId);
	});

	function createNarrative() {
		// get the current user's id
		// create a group

		// create a narrative with that group
		// add the user to the group
		// redirect
		authSvc.authenticate().then(function () {

			// dataSvc.createUserGroup({
			// 	en: "All users"
			// }).then(function (groupData) {
			// 	$scope.narrative.everyone_group_id = groupData._id;
			// 	$scope.narrative.sub_groups_id = [];

			dataSvc.createNarrative(
				$scope.narrative
			).then(function (narrativeData) {

				$location.path('/story/' + narrativeData._id);
			});

			// });
		});

	}

	function addTimeline(epId) {
		dataSvc.getEpisodeOverview(epId).then(function (episodeData) {

			var newTimeline = {
				"name": episodeData.title,
				"description": episodeData.description,
				"hidden": false,
				"path_slug": "",
				"sort_order": $scope.narrative.timelines.length,
				"parent_episode": episodeData
			};

			// as long as we're here, get the duration before moving on:
			dataSvc.getSingleAsset(episodeData.master_asset_id).then(function (data) {
				if (data) {
					newTimeline.duration = data.duration;
				} else {
					newTimeline.duration = 0;
				}
				$scope.narrative.timelines.push(newTimeline);
				$scope.isAddingTimeline = true;
			});

		});

	}

	function updateTimeline(newTimeline, oldTimeline) {
		dataSvc.storeTimeline($scope.narrative._id, newTimeline).then(function(resp) {
			angular.extend(oldTimeline, resp);
			doneEditingTimeline();
		});
	}


	function saveTimeline(timeline) {
		timeline.saveInProgress = true;
		if (timeline._id) {
			// updating an existing timeline: just store it
			dataSvc.storeTimeline($scope.narrative._id, timeline).then(function () {
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
				dataSvc.storeTimeline($scope.narrative._id, timeline).then(function (timelineData) {
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
						dataSvc.storeTimeline($scope.narrative._id, timelineData).then(function () {
							$scope.isAddingTimeline = false;
							// finally, refresh the narrative data:
							var narrativeId = $scope.narrative._id;
							dataSvc.getNarrative(narrativeId).then(function () {
								$scope.narrative = modelSvc.narratives[narrativeId];
								tmpSetNarrativeTemplate();
							});
						});
					});
				});
			});
		}
	}
}

