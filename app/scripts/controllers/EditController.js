'use strict';

angular.module('com.inthetelling.story')
	.controller('EditController', function ($q, $scope, $rootScope, $timeout, appState, dataSvc, modelSvc, timelineSvc, awsSvc) {
		$scope.uneditedScene = angular.copy($scope.item); // to help with diff of original scenes

		$scope.chooseAsset = function () {
			$scope.showAssetPicker = true;
			$scope.w1 = $rootScope.$on('UserSelectedAsset', function (e, id) {
				$scope.attachChosenAsset(id); // in ittItemEditor or ittEpisodeEditor
				$scope.showUploadButtons = false;
				$scope.endChooseAsset();
			});
			$scope.w2 = $rootScope.$on('userKeypress.ESC', $scope.endChooseAsset);
		};
		$scope.endChooseAsset = function () {
			$scope.w1();
			$scope.w2();
			$scope.showAssetPicker = false;
		};

		// TODO rename this to toggleUploadField (or eliminate it)
		$scope.toggleUpload = function () {
			$scope.showUploadField = !$scope.showUploadField;
			// TODO: trigger 'click' event on the file upload field if showUpload=true.  Or come up with a less hacky way to do the same thing
		};

		$scope.handleAssetUpload = function (files, containerId) {
			// if no container ID, put it in the user's container
			var defer = $q.defer();

			//Start the upload status out at 0 so that the
			//progress bar renders correctly at first
			$scope.uploadStatus[0] = {
				"bytesSent": 0,
				"bytesTotal": 1
			};
			if (containerId) {
				$scope.uploads = awsSvc.uploadContainerFiles(containerId, files);
			} else {
				$scope.uploads = awsSvc.uploadUserFiles(appState.user._id, files);
			}
			$scope.uploads[0].then(function (data) {
					if (data.file) {
						modelSvc.cache("asset", data.file);
						delete $scope.uploads;
						defer.resolve(data.file);
					} else {
						console.log("FAIL", data);
						defer.reject(data);
					}
				},
				function (data) {
					console.log("FAIL", data);
					defer.reject();
				},
				function (update) {
					$scope.uploadStatus[0] = update;
				});
			return defer.promise;
		};

		$scope.addDistractor = function () {
			$scope.item.data._plugin.distractors.push({
				text: "",
				index: ($scope.item.data._plugin.distractors.length + 1)
			});
		};

		// var isScene = function (event) {
		// 	return (event._type === 'Scene');
		// };

		var isOnExistingSceneStart = function (time) {

			// let's change this to iterate over just the scenes instead of the entire modelSvc.events hash:
			angular.forEach(getScenes(), function (scene) {
				if (scene.start_time === time) {
					return true;
				}
			});
			return false;
			// for (var property in modelSvc.events) {
			// 	if (modelSvc.events.hasOwnProperty(property)) {
			// 		if (isScene(modelSvc.events[property])) {
			// 			if (modelSvc.events[property].start_time === time) {
			// 				isOverlapping = true;
			// 				break;
			// 			}
			// 		}
			// 	}
			// }
			// return isOverlapping;
		};

		$scope.addEvent = function (producerItemType) {

			if (producerItemType === 'scene') {
				if (isOnExistingSceneStart(appState.time)) {
					return $scope.editCurrentScene();
				}
			}
			//captureCurrentScenes();
			// console.log("itemEditController.addEvent");
			var newEvent = generateEmptyItem(producerItemType);
			newEvent.cur_episode_id = appState.episodeId;
			newEvent.episode_id = appState.episodeId;
			if (appState.user && appState.user.avatar_id) {
				newEvent.avatar_id = appState.user.avatar_id;
			}
			modelSvc.cache("event", newEvent);

			appState.editEvent = modelSvc.events["internal:editing"];
			appState.videoControlsActive = true; // TODO see playerController showControls; this may not be sufficient on touchscreens
			appState.videoControlsLocked = true;

			modelSvc.resolveEpisodeEvents(appState.episodeId);
			timelineSvc.injectEvents([modelSvc.events["internal:editing"]]);
			if (producerItemType === 'scene') {
				timelineSvc.updateSceneTimes(appState.episodeId);
			}
			$rootScope.$emit('searchReindexNeeded'); // HACK
		};
		var isTranscript = function (item) {
			if (item._type === 'Annotation' && item.templateUrl.match(/transcript/)) {
				return true;
			} else {
				return false;
			}
		};

		var getTranscriptItems = function () {
			var episode = modelSvc.episodes[appState.episodeId];
			var allItems = angular.copy(episode.items);
			return allItems.filter(isTranscript);
		};
		var getItemIndex = function (items, item) {
			var centerIndex = 0;
			for (var i = 0, len = items.length; i < len; i++) {
				if (items[i]._id === item._id) {
					centerIndex = i;
					break;
				}
			}
			return centerIndex;
		};
		var filterToItemBefore = function (items, centerItem) {
			items = items.sort(sortByStartTime);
			var centerIndex = getItemIndex(items, centerItem);
			var itemBefore = [];
			if (centerIndex === 0) {
				return itemBefore;
			} else {
				if (centerIndex < items.length - 1) {
					if (centerIndex >= 1) {
						if (!isInternal(items[centerIndex - 1])) {
							itemBefore.push(items[centerIndex - 1]);
						}
					}
				}
			}
			return itemBefore;
		};

		var filterToBookends = function (items, centerItem) {
			items = items.sort(sortByStartTime);
			var centerIndex = getItemIndex(items, centerItem);
			var itemsBeforeAndAfter = [];

			if (centerIndex === 0) {
				if (centerIndex < items.length - 1) {
					if (!isInternal(items[centerIndex + 1])) {
						itemsBeforeAndAfter.push(items[centerIndex + 1]);
					}
				}
			} else {
				if (centerIndex < items.length - 1) {
					if (!isInternal(items[centerIndex + 1])) {
						itemsBeforeAndAfter.push(items[centerIndex + 1]);
					}
					if (centerIndex >= 1) {
						if (!isInternal(items[centerIndex - 1])) {
							itemsBeforeAndAfter.push(items[centerIndex - 1]);
						}
					}
				}
			}
			return itemsBeforeAndAfter;
		};

		var saveAdjustedEvents = function (item, operation, original) {
			if (isTranscript(item)) {
				var itemsToSave = [];
				// assuming that this is called after a resolve and that we are dealing with events that have been adjusted already
				var transcriptItems = getTranscriptItems();
				switch (operation) {
				case "create":
					itemsToSave = filterToBookends(transcriptItems, item);
					console.log('adjust for create');
					break;
				case "delete":
					itemsToSave = filterToItemBefore(transcriptItems, item);
					console.log('adjust for delete');
					break;
				case "update":
					// if an event moved, should we brute force it? if not we need to capture original position and new position. and update like a delete for the original and a create on the new. 
					if (original) {
						saveAdjustedEvents(original, "delete");
					}
					saveAdjustedEvents(item, "create");
					console.log('adjust for update');
					break;
				}
				angular.forEach(itemsToSave, function (item) {
					dataSvc.storeItem(item)
						.then(function () {
							console.log('updated transcript item', item);
						}, function (data) {
							console.error("FAILED TO STORE EVENT", data);
						});
				});
			}
		};

		$scope.saveEvent = function () {
			var toSave = angular.copy(appState.editEvent);

			//assign current episode_id
			toSave.cur_episode_id = appState.episodeId;
			if (toSave._type === 'Scene') {
				var adjusted = adjustScenes(toSave);
				angular.forEach(adjusted, function (scene) {
					dataSvc.storeItem(scene)
						.then(function () {
							// console.log("scene end_time updated");
						}, function (data) {
							console.error("FAILED TO STORE EVENT", data);
						});
				});
			}
			dataSvc.storeItem(toSave)
				.then(function (data) {
					data.cur_episode_id = appState.episodeId;
					if (appState.editEvent._id === 'internal:editing') {
						// update the new item with its real ID (and remove the temp version)
						timelineSvc.removeEvent("internal:editing");
						delete(modelSvc.events["internal:editing"]);
						modelSvc.cache("event", dataSvc.resolveIDs(data));
						modelSvc.resolveEpisodeEvents(appState.episodeId);
						timelineSvc.injectEvents([modelSvc.events[data._id]]);
						saveAdjustedEvents(data, "create");
					} else {
						modelSvc.resolveEpisodeEvents(appState.episodeId);
						timelineSvc.updateEventTimes(modelSvc.events[data._id]);
						saveAdjustedEvents(data, "update"); //TODO: send in the original (pre-move) event as last param
					}

					// Delete attached asset(s)  (this should only occur for sxs items, for now)
					// yes we could combine these into one call I suppose but there will almost always only be one
					// unless the user was very indecisive and uploaded/detached a bunch of assets to the same event.
					// It was probably already a premature optimization to use an array here in the first place
					angular.forEach(toSave.removedAssets, function (id) {
						dataSvc.deleteAsset(id);
					});
					appState.editEvent = false;
					$rootScope.$emit('searchReindexNeeded'); // HACK
				}, function (data) {
					console.error("FAILED TO STORE EVENT", data);
				});

		};
		var getScenes = function () {
			return modelSvc.episodes[appState.episodeId].scenes;
		};
		// var getItems = function () {
		// 	return modelSvc.episodes[appState.episodeId].items;
		// };

		// var isntInternal = function (item) {
		// 	return !isInternal(item);
		// };
		var isInternal = function (item) {
			if (item._id && item._id.match(/internal/)) {
				return true;
			} else {
				return false;
			}
		};
		// var getScenesNonInternal = function () {
		// 	var scenes = getScenes();
		// 	if (typeof (scenes) === 'undefined' || scenes.length < 1) {
		// 		return [];
		// 	}
		// 	return scenes.filter(isntInternal);
		// };

		// $scope.checkIfTimesAfter = function (items, duration) {
		// 	for (var i = 0, len = items.length; i < len; i++) {
		// 		if (!isInternal(items[i])) {
		// 			if (duration < items[i].start_time || duration < items[i].end_time) {
		// 				return true;
		// 			}
		// 		}
		// 	}
		// 	return false;
		// };

		$scope.getItemsAfter = function (items, after) {
			var itemsAfter = [];
			for (var i = 0, len = items.length; i < len; i++) {
				if (!isInternal(items[i])) {
					if (after < items[i].start_time || after < items[i].end_time) {
						itemsAfter.push(items[i]);
					}
				}
			}
			return itemsAfter;
		};

		// $scope.willCauseOrphanedData = function (duration) {
		// 	var scenes = getScenes();
		// 	var items = getItems();
		// 	var orphaned = false;
		// 	orphaned = $scope.checkIfTimesAfter(scenes, duration);
		// 	if (orphaned) {
		// 		return true;
		// 	}
		// 	return $scope.checkIfTimesAfter(items, duration);
		// };
		// $scope.confirmDurationImpact = function (oldDuration, newDuration, callback) {
		// 	var noop = function () {};
		// 	callback = callback || noop;
		// 	var durationDiff = oldDuration - newDuration;
		// 	var minutes = Math.floor(durationDiff / 60);
		// 	var seconds = durationDiff % 60;
		// 	var secondsText = seconds.toString();
		// 	if (secondsText.length === 1) {
		// 		secondsText = "0" + secondsText;
		// 	}

		// 	//TODO: i18n. translation
		// 	//
		// 	//NOTE: this window.confirm was causing an -unexpected- angular apply (and the inprog digest error). 
		// 	// it seems (in firefox only?) that this triggers an nested apply. to fix it we are going async (to get out of the current digest loop) and using a callback.
		// 	if (!window.confirm("Warning: Your new video is " + minutes + ":" + secondsText + " shorter than the current video and we've detected that some events will be impacted. These events will have their start and end times adjusted to the new episode end.  Are you sure you wish to continue?")) {
		// 		callback(false);
		// 	} else {
		// 		callback(true);
		// 	}
		// };
		// $scope.checkAndConfirmDuration = function (previousMasterAsset, asset, callback) {
		// 	var shouldWarnOfTruncation = false;
		// 	var newDuration = 0;
		// 	var oldDuration = 0;
		// 	newDuration = parseInt(asset.duration, 10);
		// 	if (typeof (previousMasterAsset) !== 'undefined') {
		// 		oldDuration = parseInt(previousMasterAsset.duration, 10);
		// 		//we are changing assets, we need to check if we are impacting existing items/scenes by chopping duration
		// 		if (newDuration < oldDuration) {
		// 			shouldWarnOfTruncation = $scope.willCauseOrphanedData(asset.duration);
		// 		}
		// 	}
		// 	if (shouldWarnOfTruncation) {
		// 		return $scope.confirmDurationImpact(oldDuration, newDuration, callback);
		// 	} else {
		// 		return callback(true);
		// 	}
		// };

		// $scope.setStartAndEndTimes = function (items, time) {
		// 	for (var i = 0, len = items.length; i < len; i++) {
		// 		items[i].start_time = time;
		// 		items[i].end_time = time;
		// 	}
		// };

		// $scope.getEndingSceneId = function (episodeId) {
		// 	//for now we will fabricate this... as it is really just "internal:endingscreen:[episodeId]"
		// 	return "internal:endingscreen:" + episodeId;
		// };
		// $scope.removeEndingScene = function () {
		// 	var endsceneid = $scope.getEndingSceneId(appState.episodeId);
		// 	timelineSvc.removeEvent(endsceneid);
		// };
		// $scope.adjustEndingScene = function () {
		// 	timelineSvc.removeEvent("internal:endingscreen:" + appState.episodeId);
		// 	modelSvc.addEndingScreen(appState.episodeId);
		// };

		// $scope.moveEventsAfter = function (after) {
		// 	var scenes = getScenes();
		// 	var items = getItems();

		// 	var orphanedScenes = $scope.getItemsAfter(scenes, after);
		// 	var orphanedItems = $scope.getItemsAfter(items, after);

		// 	//move and save
		// 	$scope.setStartAndEndTimes(orphanedScenes, after);
		// 	$scope.setStartAndEndTimes(orphanedItems, after);
		// 	angular.forEach(orphanedScenes, function (scene) {
		// 		timelineSvc.removeEvent(scene._id);
		// 		dataSvc.storeItem(scene);
		// 	});
		// 	angular.forEach(orphanedItems, function (item) {
		// 		timelineSvc.removeEvent(item._id);
		// 		dataSvc.storeItem(item);
		// 	});

		// 	timelineSvc.injectEvents(orphanedScenes);
		// 	timelineSvc.injectEvents(orphanedItems);
		// 	$scope.adjustEndingScene();
		// 	timelineSvc.updateSceneTimes(appState.episodeId);
		// };

		// var ensureEpisodeScenes = function (episode, doneCallback) {

		// 	var duration = modelSvc.assets[episode.master_asset_id].duration;
		// 	var nonInternalScenes = getScenesNonInternal();
		// 	if (nonInternalScenes.length === 0) {
		// 		console.error('Found episode with no scenes in it!');
		// 		return doneCallback();
		// 	} else {
		// 		var lastSceneIndex = nonInternalScenes.length - 1;
		// 		console.log("nonInternalScenes is ", nonInternalScenes, lastSceneIndex);
		// 		//check this scene and see if we need to adjust it so it takes up the entire episode length...
		// 		if (nonInternalScenes[lastSceneIndex].end_time !== duration) {
		// 			nonInternalScenes[lastSceneIndex].end_time = duration;
		// 			dataSvc.storeItem(nonInternalScenes[lastSceneIndex])
		// 				.then(function (data) {

		// 					data.episode_id = appState.episodeId;
		// 					data.cur_episode_id = appState.episodeId;
		// 					modelSvc.events[data._id] = data;
		// 					modelSvc.resolveEpisode(appState.episodeId);
		// 					modelSvc.resolveEpisodeEvents(appState.episodeId);
		// 					timelineSvc.removeEvent(data._id);
		// 					timelineSvc.injectEvents([data]);

		// 					return doneCallback();
		// 				}, function (data) {
		// 					console.error("FAILED TO UPDATE scene duration ", data);
		// 					return doneCallback();
		// 				});
		// 		}
		// 	}
		// };

		$scope.saveEpisode = function () {
			var toSave = angular.copy(appState.editEpisode);

			// $timeout(function () {
			dataSvc.storeEpisode(toSave)
				.then(function (data) {
					modelSvc.cache("episode", dataSvc.resolveIDs(data));
					if (data.master_asset_id) {
						var duration = modelSvc.assets[data.master_asset_id].duration;
						var endTime = duration - 0.01;
						modelSvc.episodes[appState.episodeId].masterAsset = modelSvc.assets[$scope.episode.master_asset_id];
						modelSvc.episodes[appState.episodeId].master_asset_id = data.master_asset_id;

						/*
						drop internal endingScene

						iterate through episode.scenes. 
							if start time > duration, delete the scene.
							if end time > duration, set end time to duration.
						iterate through episode.items.
							if start or end time > duration, set to duration.

						add endingScene
						resolveEpisode and resolveEpisodeEvents

						*/
						var modifiedEvents = [];

						var episode = modelSvc.episodes[toSave._id];
						angular.forEach(episode.scenes, function (scene) {
							if (scene.start_time > duration) {
								// TODO api delete this scene
							} else if (scene.end_time > duration) {
								scene.end_time = endTime;
								modifiedEvents.push(scene);
							}
						});
						angular.forEach(episode.items, function (item) {
							if (item.start_time > duration) {
								item.start_time = endTime;
							}
							if (item.end_time > duration) {
								item.end_time = endTime;
							}
							modifiedEvents.push(item);
						});

						modelSvc.events["internal:endingscreen:" + toSave._id].start_time = endTime;
						modelSvc.events["internal:endingscreen:" + toSave._id].end_time = endTime;

						modelSvc.deriveEpisode(modelSvc.episodes[appState.episodeId]);
						// modelSvc.resolveEpisodeContainers(appState.episodeId); // only needed for navigation_depth changes
						modelSvc.resolveEpisodeAssets(appState.episodeId);
						appState.duration = duration;
						appState.editEpisode = false;
						appState.videoControlsLocked = false;
						timelineSvc.init(appState.episodeId);

						// push each of modifiedEvents to server (TODO combine these into one call!)
						angular.forEach(modifiedEvents, function (event) {
							dataSvc.storeItem(event);
						});

					} else {
						// modelSvc.resolveEpisodeContainers(appState.episodeId); // only needed for navigation_depth changes
						modelSvc.resolveEpisodeAssets(appState.episodeId);
						appState.editEpisode = false;
						appState.videoControlsLocked = false;

					}
				}, function (data) {
					console.error("FAILED TO STORE EPISODE", data);
				});
			// }, 0);
		};

		var resetScenes = function (updatedScenes, originalScene) {
			for (var i = 0; i < updatedScenes.length; i++) {
				if (typeof (updatedScenes[i]._id) === 'undefined' || updatedScenes[i]._id === 'internal:editing') {
					updatedScenes.splice(i, 1);
					break;
				}
				if (originalScene) {
					if (updatedScenes[i]._id === originalScene._id) {
						updatedScenes[i] = originalScene;
						break;
					}
				}
			}
			return updatedScenes;
		};

		var fixEndTimes = function (scenes, duration) {
			for (var i = 1, len = scenes.length; i < len; i++) {
				if (i === len - 1) {
					scenes[i].end_time = duration;
				} else {
					if (scenes[i].end_time !== scenes[i + 1].start_time) {
						scenes[i].end_time = scenes[i + 1].start_time;
					}
				}
			}
		};
		var pushScene = function (scenes, scene) {
			var exists = false;
			for (var i = 0, len = scenes.length; i < len; i++) {
				if (scenes[i]._id === scene._id) {
					exists = true;
					//do nothing, as already exists	
					break;
				}
			}
			if (!exists) {
				scenes.push(scene);
			}
		};
		var removeScene = function (scenes, id) {
			for (var i = 0, len = scenes.length; i < len; i++) {
				if (scenes[i]._id === id) {
					scenes.splice(i, 1);
					break;
				}
			}
		};
		var sortByStartTime = function (a, b) {
			return a.start_time - b.start_time;
		};

		var adjustScenes = function (modifiedScene, isDelete) {
			var duration = appState.duration;
			var scenes = angular.copy(getScenes());
			var adjusted = [];
			// get scenes back into original state (before editing,adding,deleting)
			if (isDelete) {
				pushScene(scenes, $scope.uneditedScene);
			} else {
				resetScenes(scenes, $scope.uneditedScene);
			}
			scenes = scenes.sort(sortByStartTime);
			fixEndTimes(scenes, duration);

			// now scenes is back to pre edit state.  let's drop in our new scene and then see what is impacted (and needs updating)
			removeScene(scenes, modifiedScene._id);
			if (!isDelete) {
				scenes.push(modifiedScene);
			}
			scenes = scenes.sort(sortByStartTime);
			for (var i = 1, len = scenes.length; i < len; i++) {
				if (i === len - 1) {
					if (scenes[i].end_time !== duration) {
						scenes[i].end_time = duration;
						adjusted.push(scenes[i]);
					}
				} else {
					if (scenes[i].end_time !== scenes[i + 1].start_time) {
						scenes[i].end_time = scenes[i + 1].start_time;
						adjusted.push(scenes[i]);
					}
				}

			}
			return adjusted;
		};

		$scope.editCurrentScene = function () {
			angular.forEach(getScenes(), function (scene) {
				if (scene.isCurrent) {
					// TODO This is redundant with ittItem editItem...
					appState.editEvent = modelSvc.events[scene._id];
					appState.editEvent.cur_episode_id = appState.episodeId;
					appState.editEvent.episode_id = appState.episodeId;
					appState.editEvent.producerItemType = 'scene';
					appState.videoControlsActive = true; // TODO see playerController showControls; this may not be sufficient on touchscreens
					appState.videoControlsLocked = true;
				}
			});
		};

		$scope.editEpisode = function () {
			appState.editEpisode = modelSvc.episodes[appState.episodeId];
			appState.videoControlsActive = true; // TODO see playerController showControls; this may not be sufficient on touchscreens
			appState.videoControlsLocked = true;
		};

		$scope.deleteEvent = function (eventId) {
			if (window.confirm("Are you sure you wish to delete this item?")) {
				//fabricate scene event
				var event = {};
				event._id = eventId;
				var eventType = modelSvc.events[eventId]._type;
				if (eventType === 'Scene') {
					var adjusted = adjustScenes(event, true);
					angular.forEach(adjusted, function (scene) {
						dataSvc.storeItem(scene)
							.then(function () {
								// console.log("scene end_time updated");
							}, function (data) {
								console.error("FAILED TO STORE EVENT", data);
							});
					});
				}

				dataSvc.deleteItem(eventId)
					.then(function () {
						if (appState.product === 'sxs' && modelSvc.events[eventId].asset) {
							dataSvc.deleteAsset(modelSvc.events[eventId].asset._id);
						}
						timelineSvc.removeEvent(eventId);
						delete modelSvc.events[eventId];
						modelSvc.resolveEpisodeEvents(appState.episodeId);

						if (eventType === 'Scene') {
							timelineSvc.updateSceneTimes(appState.episodeId);
						}
						saveAdjustedEvents(event, "delete");
						appState.editEvent = false;
						appState.videoControlsLocked = false;
					}, function (data) {
						console.warn("failed to delete:", data);
					});
			}
		};

		$scope.cancelEventEdit = function (originalEvent) {
			var episodeId = originalEvent.cur_episode_id ? originalEvent.cur_episode_id : originalEvent.episode_id;
			if (appState.editEvent._id === 'internal:editing') {
				delete(modelSvc.events['internal:editing']);
				timelineSvc.removeEvent("internal:editing");
			} else {
				modelSvc.events[appState.editEvent._id] = originalEvent;
			}
			modelSvc.resolveEpisodeEvents(episodeId);

			if (originalEvent._type === 'Scene') {
				timelineSvc.updateSceneTimes(episodeId);
			} else {
				timelineSvc.updateEventTimes(originalEvent);
			}

			appState.editEvent = false;
			appState.videoControlsLocked = false;
		};

		$scope.cancelEpisodeEdit = function (originalEvent) {

			modelSvc.episodes[appState.episodeId] = originalEvent;

			modelSvc.deriveEpisode(modelSvc.episodes[originalEvent._id]);
			modelSvc.resolveEpisodeContainers(originalEvent._id); // only needed for navigation_depth changes
			modelSvc.resolveEpisodeEvents(originalEvent._id); // needed for template or style changes
			// console.log("Episode StyleCss is now ", modelSvc.episodes[originalEvent._id].styleCss);
			appState.editEpisode = false;
			appState.videoControlsLocked = false;
		};

		var generateEmptyItem = function (type) {
			var base = {
				"_id": "internal:editing",
				"start_time": appState.time,
				"episode_id": appState.episodeId,
				// "type": type,  <-- NOPE that's a bug.  Confusing, so I'm leaving in this comment:  API types are Plugin, Scene, Upload, Link; these producer item types are different
				"isCurrent": true,
				"producerItemType": type,
				"layouts": ["inline"],
				"styles": []
			};
			/*
			Item types:

			producer only
				scene
				transcript
				annotation

			sxs only
				comment

			sxs and producer
				image
				file
				link
				question
				video (injected episode) TODO
			*/

			var stub = {};
			if (type === 'scene') {
				stub = {
					"_type": "Scene",
					"title": {},
					"description": {}
				};
			}
			if (type === 'video') {
				// TODO: this should be an injected episode with the linked/uploaded video as its master asset.
				// For now we're faking it as a link item.
				stub = {
					"_type": "Link",
					"link_image_id": "",
					"url": "",
					"title": {},
					"description": {}
				};
			}

			if (type === 'comment' || type === 'transcript' || type === 'annotation') {
				stub = {
					"_type": "Annotation",
					"annotation": {},
					"annotator": {},
					"annotation_image_id": ""
				};
			}

			if (type === 'file' || type === 'image') {
				stub = {
					"_type": "Upload",
					"asset_id": "",
					"title": {},
					"description": {}
				};
			}

			if (type === 'link') {
				stub = {
					"_type": "Link",
					"link_image_id": "",
					"url": "https://",
					"title": {},
					"description": {}
				};
			}

			if (type === 'question') {
				// TODO i18n
				stub = {
					"_type": "Plugin",
					"title": {},
					"data": {
						"_pluginType": "question",
						"_version": 2,
						"_plugin": {
							"questiontext": "",
							"questiontype": "mc-formative",
							"distractors": [{
								"index": 1,
								"text": ""
							}, {
								"index": 2,
								"text": ""
							}, {
								"index": 3,
								"text": ""
							}, {
								"index": 4,
								"text": ""
							}],
							"correctfeedback": "",
							"incorrectfeedback": ""
						}
					}
				};
				stub.plugin = stub.data._plugin;
			}

			if (appState.product === 'sxs') {
				// SxS overrides a lot of the item options:
				stub.sxs = true; // temporary?
				stub.annotator = {
					en: appState.user.name
				};
				stub.layouts = ["windowFg"];
				stub.end_time = appState.time;
				stub.stop = true;

				// Override default template selection with a special SXS one:
				stub.templateUrl = 'templates/item/sxs-' + type + '.html';
			} else {
				var defaultTemplateUrls = {
					"scene": "templates/scene/1col.html",
					"transcript": "templates/item/transcript.html",
					"annotation": "templates/item/pullquote-noattrib.html",
					"link": "templates/item/link.html",
					"image": "templates/item/image-plain.html",
					"file": "templates/item/link.html",
					"question": "templates/item/question-mc.html",
					"video": "TODO:VIDEO"
				};
				stub.templateUrl = defaultTemplateUrls[type];
			}
			angular.extend(base, stub);
			return base;
		};

	});
