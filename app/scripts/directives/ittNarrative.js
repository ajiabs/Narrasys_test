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
		controllerAs: 'ittNarrative',
		scope: {
			narrativeData: '='
		}
	};
}

function ittNarrativeCtrl($scope, $location, authSvc, appState, dataSvc, ittUtils) {

	var treeOpts = {
		accept: function(/*sourceNodeScope, destNodesScope, destIndex*/) {
			// console.log('onAccept', arguments);
			return true;
		},
		dropped: function(event) {
			var destIndex = event.dest.index;
			_updateSortOrder(destIndex, $scope.narrative.timelines);
			_persistTimelineSortUpdate($scope.narrative.timelines[destIndex]);
		}
	};

	angular.extend($scope, {
		toggleEditing: toggleEditing,
		toggleEditingTimeline: toggleEditingTimeline,
		doneEditingTimeline: doneEditingTimeline,
		toggleOwnership: toggleOwnership,
		toggleEpisodeList: toggleEpisodeList,
		createNarrative: createNarrative,
		updateNarrative: updateNarrative,
		// saveTimeline: saveTimeline,
		updateTimeline: updateTimeline,
		addTmpTimeline: addTmpTimeline,
		onEpisodeSelect: onEpisodeSelect,
		persistTmpTimeline: persistTmpTimeline,
		showTimelineEditor: showTimelineEditor,
		editorAction: editorAction,
		timelinesDuration: timelinesDuration,
		deleteTimeline: deleteTimeline,
		isEditing: false,
		canAccess: false,
		isEditingTimeline: false,
		treeOpts: treeOpts
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
		timelinesDuration($scope.narrative.timelines);
	}

	function toggleEditing() {
		$scope.isEditing = !$scope.isEditing;
	}

	function toggleEditingTimeline(tl) {
		$scope.timelineUnderEdit = tl;
		$scope.isEditingTimeline = !$scope.isEditingTimeline;
	}

	function toggleOwnership() {
		$scope.isOwner = !$scope.isOwner;
	}

	function toggleEpisodeList() {
		$scope.showEpisodeList = !$scope.showEpisodeList;
	}

	function doneEditingTimeline() {
		$scope.timelineUnderEdit = null;
		//remove tmp tl from timelines;
		$scope.narrative.timelines = $scope.narrative.timelines.filter(function(tl) {
			return tl !== $scope.tmpTimeline;
		});
		$scope.tmpTimeline = null;
	}

	function doAfterAuthentication() {
		$scope.userHasRole = authSvc.userHasRole;
		$scope.user = appState.user;
		if (authSvc.userHasRole('admin') || authSvc.userHasRole('customer admin')) {
			$scope.canAccess = true;
			dataSvc.getCustomerList().then(function (data) {
				$scope.customerList = data;
			});
		}
	}

	function editorAction(newTl, currTl) {
		if (newTl.isTemp === true) {
			persistTmpTimeline(newTl);
		} else {
			updateTimeline(newTl, currTl);
		}
	}

	function showTimelineEditor(tl) {
		return (tl === $scope.timelineUnderEdit || tl === $scope.tmpTimeline);
	}

	function timelinesDuration(timelines) {
		$scope.totalNarrativeDuration = timelines.map(function (tl) {
			return tl.episode_segments.map(function(s) {return s.end_time;})[0];
		}).reduce(function(accm, durs) {
			return accm += durs;
		}, 0);
	}


	function deleteTimeline(tl) {
		dataSvc.deleteTimeline(tl._id).then(function() {
			$scope.narrative.timelines = $scope.narrative.timelines.filter(function(t) {
				return tl._id !== t._id;
			});
			doneEditingTimeline();
		});
	}

	//this function kicks off the following sequence: addTmpTimeline -> onEpisodeSelect -> persistTmpTimeline
	//addTempTimeline creates a temporary object and puts it on the narrative.timelines scope (so we can use it
	//in the view via ittTimelineEditor directive)
	//onEpisodeSelect fills some of the temp props with actual props back from the selected episode
	//persistTempTimeline saves the freshly created timeline
	function addTmpTimeline(currTl, timelines) {
		var currIndex = timelines.indexOf(currTl);
		var fromTl = timelines[currIndex];
		var nextTlSortOrder;
		var currSortOrder = fromTl.sort_order;

		if (timelines.slice(-1)[0] === fromTl) {
			currSortOrder += 100;
		} else {
			nextTlSortOrder = timelines[currIndex + 1].sort_order;
			currSortOrder = Math.ceil((nextTlSortOrder + currSortOrder) / 2);
		}

		//TODO: dont forget to strip html tags from episode title
		var newTimeline = {
			name: {en: 'New Timeline'},
			description: {en: 'Timeline Description'},
			hidden: false,
			path_slug: '',
			sort_order: currSortOrder,
			isTemp: true
		};

		//favor slice over splice as splice mutates array in place.
		var head = timelines.slice(0, currIndex + 1);
		var tail = timelines.slice(currIndex + 1, timelines.length);
		head.push(newTimeline);
		timelines = head.concat(tail);
		$scope.narrative.timelines = timelines;
		$scope.tmpTimeline = newTimeline;
		//to open episode select modal
		toggleEpisodeList();
	}

	function onEpisodeSelect(epId) {
		//if tmpTimeline is not set, assume
		//this is the first timeline to create;
		if (!$scope.tmpTimeline && $scope.narrative.timelines.length === 0) {
			var newTimeline = {
				name: {en: 'New Timeline'},
				description: {en: 'Timeline Description'},
				hidden: false,
				path_slug: '',
				sort_order: 0,
				isTemp: true
			};
			$scope.tmpTimeline = newTimeline;
			$scope.narrative.timelines.push(newTimeline);
		}

		dataSvc.getEpisodeOverview(epId).then(function(episodeData) {
			$scope.tmpTimeline.parent_episode = episodeData;
			$scope.tmpTimeline.description.en = ittUtils.stripHtmlTags(episodeData.description.en);
			$scope.tmpTimeline.name.en = ittUtils.stripHtmlTags(episodeData.title.en);
			return episodeData;
		}).then(function(episodeData) {
			dataSvc.getSingleAsset(episodeData.master_asset_id).then(function(data) {
				if (data) {
					$scope.tmpTimeline.duration = data.duration;
				} else {
					$scope.tmpTimeline.duration = 0;
				}
				//to close episode select modal after select
				toggleEpisodeList();
			});
		});
	}

	function persistTmpTimeline(tl) {

		dataSvc.createChildEpisode({
			parent_id: tl.parent_episode._id,
			title: tl.name
		})
			.then(storeChildEpisode)
			.then(handleEpisodeSegment)
			.catch(logErr);

		function storeChildEpisode(childEpisode) {
			return dataSvc.storeTimeline($scope.narrative._id, tl).then(function(tlData) {
				return {d: tlData, e: childEpisode};
			});
		}

		function handleEpisodeSegment(config) {
			var tlData = config.d;
			var childEpisode = config.e;
			dataSvc.createEpisodeSegment(tlData._id, {
				episode_id: childEpisode._id,
				start_time: 0,
				end_time: tl.duration,
				sort_order: 0,
				timeline_id: tlData._id
			}).then(function(segmentData) {
				tlData.episode_segments = [segmentData];
				dataSvc.storeTimeline($scope.narrative._id, tlData).then(function() {
					$scope.tmpTimeline = null;
					doneEditingTimeline();
				}).then(function() {
					// timelinesDuration($scope.narrative.timelines);
				});
			});
		}

		function logErr(e) { console.log(e); }
	}

	function updateNarrative(update) {
		dataSvc.updateNarrative(update).then(function (resp) {
			$scope.isEditing = false;
			//updateNarrative returns just the new narrative object, without timelines array
			//merge the existing narrative on scope with the one returned via our post resp.
			angular.extend($scope.narrative, resp);
		});
	}

	function updateTimeline(newTimeline, oldTimeline) {
		dataSvc.storeTimeline($scope.narrative._id, newTimeline).then(function(resp) {
			angular.extend(oldTimeline, resp);
			doneEditingTimeline();
		});
	}

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

	function _updateSortOrder(destIndex, arr) {
		var len = arr.length;
		var sortIndex = 0;
		if (destIndex > 0) {
			sortIndex = arr[destIndex - 1].sort_order + 1;
		}
		var prevSortIndex = sortIndex;
		arr[destIndex].sort_order = sortIndex;

		for (destIndex + 1; destIndex < len; destIndex++) {
			if (prevSortIndex === arr[destIndex].sort_order) {
				arr[destIndex].sort_order = sortIndex;
			}
			prevSortIndex = sortIndex;
			sortIndex++;
		}
	}

	function _persistTimelineSortUpdate(timeline) {
		dataSvc.storeTimeline($scope.narrative._id, timeline).then(function(resp) {
			angular.extend(timeline, resp);
		});
	}
}

