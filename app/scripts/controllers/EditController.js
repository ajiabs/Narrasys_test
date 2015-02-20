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
			var asset = modelSvc.assets[asset_id];
			$scope.masterAsset = asset;
			if ($scope.item) {
				$scope.item.asset = asset;
				if ($scope.item.type === 'image') {
					$scope.item.asset_id = asset_id;
				} else if ($scope.item.type === 'link') {
					$scope.item.link_image_id = asset_id;
				} else if ($scope.item.type === 'annotation') {
					$scope.item.annotation_image_id = asset_id;
				} else {
					console.error("Tried to select asset for unknown item type", $scope.item);
				}
			}
			if ($scope.episode) {
				//BUGBUG? - could episode be truthy and the asset be video during "item" edition (and not episode editing) 
				// causing us to inadvertently change the master asset to the item video asset?  Due to using editcontroller for both item and episode
				if (asset._type === 'Asset::Video') {
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
				text: ""
			});
		};

		$scope.addEvent = function (producerItemType) {
			//captureCurrentScenes();
			// console.log("itemEditController.addEvent");
			var newEvent = generateEmptyItem(producerItemType);
			newEvent.cur_episode_id = appState.episodeId;
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

		var hasScenes = function () {
			var scenes = getScenes();
			if (typeof (scenes) === 'undefined') {
				return false;
			}
			if (scenes.length < 1) {
				return false;
			}
			var internalScenesOnly = true;
			// we have scenes, but may be internal	
			for (var i = 0, len = scenes.length; i < len; i++) {
				if (isInternal(scenes[i])) {
					continue;
				} else {
					internalScenesOnly = false;
					break;
				}
			}
			return !internalScenesOnly;
		};
		var isInternal = function (item) {
			if (item._id && item._id.match(/internal/)) {
				return true;
			} else {
				return false;
			}
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

		$scope.saveEpisode = function () {
			var toSave = angular.copy(appState.editEpisode);

			$timeout(function () {
				dataSvc.storeEpisode(toSave)
					.then(function (data) {
						//	$timeout(function () {
						modelSvc.cache("episode", dataSvc.resolveIDs(data));
						var scene = generateEmptyItem("scene");
						var duration = modelSvc.assets[data.master_asset_id].duration;
						if (!hasScenes()) {
							scene.start_time = 0;
							scene.end_time = duration;
							dataSvc.storeItem(scene)
								.then(function () {
									// console.log("default scene created");
								}, function (data) {
									console.error("FAILED TO STORE EVENT", data);
								});
						}
						modelSvc.deriveEpisode(modelSvc.episodes[appState.episodeId]);
						modelSvc.resolveEpisodeContainers(appState.episodeId); // only needed for navigation_depth changes
						modelSvc.resolveEpisodeAssets(appState.episodeId);
						appState.duration = modelSvc.assets[data.master_asset_id].duration;
						appState.editEpisode = false;
						appState.videoControlsLocked = false;

						$scope.moveEventsAfter(duration);
						//		}, 0);
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

		var fixEndTimes = function (scenes) {
			for (var i = 1, len = scenes.length; i < len - 1; i++) {
				if (scenes[i].end_time !== scenes[i + 1].start_time) {
					scenes[i].end_time = scenes[i + 1].start_time;
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
			var scenes = getScenesSnapshot();
			var adjusted = [];

			// get scenes back into original state (before editing,adding,deleting)
			if (isDelete) {
				pushScene(scenes, $scope.uneditedScene);
			} else {
				resetScenes(scenes, $scope.uneditedScene);
			}
			scenes = scenes.sort(sortByStartTime);
			fixEndTimes(scenes);

			// now scenes is back to pre edit state.  let's drop in our new scene and then see what is impacted (and needs updating)
			removeScene(scenes, modifiedScene._id);
			if (!isDelete) {
				scenes.push(modifiedScene);
			}
			scenes = scenes.sort(sortByStartTime);
			for (var i = 1; i < scenes.length - 1; i++) {
				if (scenes[i].end_time !== scenes[i + 1].start_time) {
					scenes[i].end_time = scenes[i + 1].start_time;
					adjusted.push(scenes[i]);
				}
			}
			return adjusted;
		};
		$scope.editCurrentScene = function () {
			angular.forEach(getScenes(), function (scene) {
				if (scene.isCurrent) {
					// TODO This is redundant with ittItem editItem...
					appState.editEvent = modelSvc.events[scene._id];
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
				"type": type,
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
					"data": {
						"_pluginType": "question",
						"_version": 1,
						"_plugin": {
							"questiontext": "",
							"questiontype": "mc-formative",
							"distractors": [{
								"text": ""
							}, {
								"text": ""
							}, {
								"text": ""
							}, {
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
					en: 'Professor Smith' // TODO get real name from somewhere
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
					"annotation": "templates/item/pullquote.html",
					"link": "templates/item/link.html",
					"image": "templates/item/image.html",
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
