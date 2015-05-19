'use strict';

angular.module('com.inthetelling.story')
	.controller('EditController', function ($scope, $rootScope, $timeout, appState, dataSvc, modelSvc, timelineSvc) {
		$scope.uneditedScene = angular.copy($scope.item); // to help with diff of original scenes

		$scope.chooseAsset = function () {
			$scope.showAssetPicker = true;
			$scope.w1 = $rootScope.$on('UserSelectedAsset', function (e, id) {
				$scope.selectedAsset(id);
			});
			$scope.w2 = $rootScope.$on('userKeypress.ESC', $scope.endChooseAsset);
		};

		$scope.selectedAsset = function (asset_id) {
			console.log($scope.item);
			var asset = modelSvc.assets[asset_id];
			if ($scope.item) {
				$scope.item.asset = asset;
				if ($scope.item._type === 'Upload' || $scope.item._type === 'Plugin') {
					$scope.item.asset_id = asset_id;
				} else if ($scope.item._type === 'Link') {
					$scope.item.link_image_id = asset_id;
				} else if ($scope.item._type === 'Annotation') {
					$scope.item.annotation_image_id = asset_id;
				} else {
					console.error("Tried to select asset for unknown item type", $scope.item);
				}
			}
			if ($scope.episode) {
				//BUGBUG? - could episode be truthy and the asset be video during "item" edition (and not episode editing) 
				// causing us to inadvertently change the master asset to the item video asset?  Due to using editcontroller for both item and episode
				if (asset._type === 'Asset::Video') {
					$scope.masterAsset = asset;
					var previousAsset = modelSvc.assets[$scope.episode.master_asset_id];
					$timeout(function () {
						$scope.checkAndConfirmDuration(previousAsset, asset, function (confirmed) {
							if (confirmed) {
								$scope.episode.master_asset_id = asset_id;
							}
						});
					}, 0);
				}
			}
			$scope.endChooseAsset();
		};
		$scope.toggleUpload = function () {
			$scope.showUpload = !$scope.showUpload;
			// TODO: trigger 'click' event on the file upload field if showUpload=true.  Or come up with a less hacky way to do the same thing
		};
		$scope.endChooseAsset = function () {
			$scope.w1();
			$scope.w2();
			$scope.showAssetPicker = false;
		};

		$scope.addDistractor = function () {
			$scope.item.data._plugin.distractors.push({
				text: "",
				index: ($scope.item.data._plugin.distractors.length + 1)
			});
		};
		var isScene = function (event) {
			if (event.Type === 'Scene') {
				return true;
			}
			if (event._type === 'Scene') {
				return true;
			}
			return false;
		};
		var isOnExistingSceneStart = function (time) {
			var isOverlapping = false;
			for (var property in modelSvc.events) {
				if (modelSvc.events.hasOwnProperty(property)) {
					if (isScene(modelSvc.events[property])) {
						if (modelSvc.events[property].start_time === time) {
							isOverlapping = true;
							break;
						}
					}
				}
			}
			return isOverlapping;
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
			modelSvc.cache("event", newEvent);

			appState.editEvent = modelSvc.events["internal:editing"];
			appState.videoControlsActive = true; // TODO see playerController showControls; this may not be sufficient on touchscreens
			appState.videoControlsLocked = true;

			modelSvc.resolveEpisodeEvents(appState.episodeId);
			timelineSvc.injectEvents([modelSvc.events["internal:editing"]]);
			if (producerItemType === 'scene') {
				timelineSvc.updateSceneTimes(appState.episodeId);
			}
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
					appState.editEvent = false;
				}, function (data) {
					console.error("FAILED TO STORE EVENT", data);
				});

		};
		var getScenes = function () {
			var episode = modelSvc.episodes[appState.episodeId];
			return episode.scenes;
		};
		var getItems = function () {
			var episode = modelSvc.episodes[appState.episodeId];
			return episode.items;
		};

		var isntInternal = function (item) {
			return !isInternal(item);
		};
		var isInternal = function (item) {
			if (item._id && item._id.match(/internal/)) {
				return true;
			} else {
				return false;
			}
		};
		var getScenesNonInternal = function () {
			var scenes = getScenes();
			if (typeof (scenes) === 'undefined' || scenes.length < 1) {
				return [];
			}
			return scenes.filter(isntInternal);
		};
		$scope.checkIfTimesAfter = function (items, duration) {
			for (var i = 0, len = items.length; i < len; i++) {
				if (!isInternal(items[i])) {
					if (duration < items[i].start_time || duration < items[i].end_time) {
						return true;
					}
				}
			}
			return false;
		};
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
		$scope.willCauseOrphanedData = function (duration) {
			var scenes = getScenes();
			var items = getItems();
			var orphaned = false;
			orphaned = $scope.checkIfTimesAfter(scenes, duration);
			if (orphaned) {
				return true;
			}
			return $scope.checkIfTimesAfter(items, duration);
		};
		$scope.confirmDurationImpact = function (oldDuration, newDuration, callback) {
			var noop = function () {};
			callback = callback || noop;
			var durationDiff = oldDuration - newDuration;
			var minutes = Math.floor(durationDiff / 60);
			var seconds = durationDiff % 60;
			var secondsText = seconds.toString();
			if (secondsText.length === 1) {
				secondsText = "0" + secondsText;
			}

			//TODO: i18n. translation
			//
			//NOTE: this window.confirm was causing an -unexpected- angular apply (and the inprog digest error). 
			// it seems (in firefox only?) that this triggers an nested apply. to fix it we are going async (to get out of the current digest loop) and using a callback.
			if (!window.confirm("Warning: Your new video is " + minutes + ":" + secondsText + " shorter than the current video and we've detected that some events will be impacted. These events will have their start and end times adjusted to the new episode end.  Are you sure you wish to continue?")) {
				callback(false);
			} else {
				callback(true);
			}
		};
		$scope.checkAndConfirmDuration = function (previousMasterAsset, asset, callback) {
			var shouldWarnOfTruncation = false;
			var newDuration = 0;
			var oldDuration = 0;
			newDuration = parseInt(asset.duration, 10);
			if (typeof (previousMasterAsset) !== 'undefined') {
				oldDuration = parseInt(previousMasterAsset.duration, 10);
				//we are changing assets, we need to check if we are impacting existing items/scenes by chopping duration
				if (newDuration < oldDuration) {
					shouldWarnOfTruncation = $scope.willCauseOrphanedData(asset.duration);
				}
			}
			if (shouldWarnOfTruncation) {
				return $scope.confirmDurationImpact(oldDuration, newDuration, callback);
			} else {
				return callback(true);
			}
		};
		$scope.setStartAndEndTimes = function (items, time) {
			for (var i = 0, len = items.length; i < len; i++) {
				items[i].start_time = time;
				items[i].end_time = time;
			}
		};

		$scope.getEndingSceneId = function (episodeId) {
			//for now we will fabricate this... as it is really just "internal:endingscreen:[episodeId]"
			return "internal:endingscreen:" + episodeId;
		};
		$scope.removeEndingScene = function () {
			var endsceneid = $scope.getEndingSceneId(appState.episodeId);
			timelineSvc.removeEvent(endsceneid);
		};
		$scope.adjustEndingScene = function () {
			$scope.removeEndingScene();
			modelSvc.addEndingScreen(appState.episodeId);
		};
		$scope.moveEventsAfter = function (after) {

			var scenes = getScenes();
			var items = getItems();

			var orphanedScenes = $scope.getItemsAfter(scenes, after);
			var orphanedItems = $scope.getItemsAfter(items, after);

			//move and save
			$scope.setStartAndEndTimes(orphanedScenes, after);
			$scope.setStartAndEndTimes(orphanedItems, after);
			angular.forEach(orphanedScenes, function (scene) {
				timelineSvc.removeEvent(scene._id);
				dataSvc.storeItem(scene);
			});
			angular.forEach(orphanedItems, function (item) {
				timelineSvc.removeEvent(item._id);
				dataSvc.storeItem(item);
			});

			timelineSvc.injectEvents(orphanedScenes);
			timelineSvc.injectEvents(orphanedItems);
			$scope.adjustEndingScene();
			timelineSvc.updateSceneTimes(appState.episodeId);
		};

		var ensureEpisodeScenes = function (episode, doneCallback) {
			var duration = modelSvc.assets[episode.master_asset_id].duration;
			var nonInternalScenes = getScenesNonInternal();
			$scope.adjustEndingScene();
			if (nonInternalScenes.length === 0) {
				//console.log('this is where we would create a default scene');
				return doneCallback();
			} else if (nonInternalScenes.length === 1) {
				//check this scene and see if we need to adjust it so it takes up the entire episode length...
				if (nonInternalScenes[0].end_time !== duration) {
					nonInternalScenes[0].end_time = duration;
					dataSvc.storeItem(nonInternalScenes[0])
						.then(function (data) {
							data.episode_id = appState.episodeId;
							data.cur_episode_id = appState.episodeId;
							modelSvc.events[data._id] = data;
							modelSvc.resolveEpisodeEvents(appState.episodeId);
							timelineSvc.removeEvent(data._id);
							timelineSvc.injectEvents([data]);
							return doneCallback();
						}, function (data) {
							console.error("FAILED TO UPDATE scene duration ", data);
							return doneCallback();
						});
				}
			} else {
				return doneCallback();
			}
		};

		$scope.saveEpisode = function () {
			var toSave = angular.copy(appState.editEpisode);

			$timeout(function () {
				dataSvc.storeEpisode(toSave)
					.then(function (data) {
						modelSvc.cache("episode", dataSvc.resolveIDs(data));
						if (data.master_asset_id) {
							var duration = modelSvc.assets[data.master_asset_id].duration;
							//TODO: figure out which (or both) of these masterAsset properties are needed. and maybe get rid of one.
							appState.masterAsset = modelSvc.assets[$scope.episode.master_asset_id];
							modelSvc.episodes[appState.episodeId].masterAsset = modelSvc.assets[$scope.episode.master_asset_id];
							modelSvc.episodes[appState.episodeId].master_asset_id = data.master_asset_id;
							ensureEpisodeScenes(data, function () {
								console.log('done ensureEpisodeScenes');
								appState.duration = duration;
								$scope.moveEventsAfter(duration);
								modelSvc.deriveEpisode(modelSvc.episodes[appState.episodeId]);
								modelSvc.resolveEpisodeContainers(appState.episodeId); // only needed for navigation_depth changes
								modelSvc.resolveEpisodeAssets(appState.episodeId);
								appState.editEpisode = false;
								appState.videoControlsLocked = false;
							});
							//timelineSvc.init(appState.episodeId);
						} else {
							modelSvc.resolveEpisodeContainers(appState.episodeId); // only needed for navigation_depth changes
							modelSvc.resolveEpisodeAssets(appState.episodeId);
							appState.editEpisode = false;
							appState.videoControlsLocked = false;

						}
					}, function (data) {
						console.error("FAILED TO STORE EPISODE", data);
					});
			}, 0);
		};

		var getScenesSnapshot = function () {
			//var episode = modelSvc.episodes[appState.episodeId];
			return angular.copy(getScenes());
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
			var scenes = getScenesSnapshot();
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
				var adjusted = adjustScenes(event, true);
				angular.forEach(adjusted, function (scene) {
					dataSvc.storeItem(scene)
						.then(function () {
							// console.log("scene end_time updated");
						}, function (data) {
							console.error("FAILED TO STORE EVENT", data);
						});
				});

				var eventType = modelSvc.events[eventId]._type;
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
			if (appState.editEvent._id === 'internal:editing') {
				delete(modelSvc.events['internal:editing']);
				timelineSvc.removeEvent("internal:editing");
			} else {
				modelSvc.events[appState.editEvent._id] = originalEvent;
			}
			modelSvc.resolveEpisodeEvents(originalEvent.episode_id);

			if (originalEvent._type === 'Scene') {
				timelineSvc.updateSceneTimes(originalEvent.episode_id);
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

			var stub = {};
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

TODO merge 'comment' with 'annotation'?


			*/

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

		$scope.generateEmptyItem = generateEmptyItem;
	});
