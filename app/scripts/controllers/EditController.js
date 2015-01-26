'use strict';

angular.module('com.inthetelling.story')
	.controller('EditController', function ($scope, $rootScope, appState, dataSvc, modelSvc, timelineSvc) {

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
				console.log("asset", asset);
				//BUGBUG? - could episode be truthy and the asset be video during "item" edition (and not episode editing) 
				// causing us to inadvertently change the master asset to the item video asset?  Due to using editcontroller for both item and episode
				if (asset._type === 'Asset::Video') {
					console.log("setting master episode asset");
					$scope.episode.master_asset_id = asset_id;
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
			// console.log("itemEditController.addEvent");
			var newEvent = generateEmptyItem(producerItemType);
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

		$scope.saveEvent = function () {
			var toSave = angular.copy(appState.editEvent);

			// TODO if we are saving a scene, we need to update other scenes as well to get the end times correct.
			// THough we are ignoring the scene end times anyway, so maybe don't bother?
			if (toSave._type === 'Scene') {
				console.warn("TODO need to update other scenes' end times.");
			}

			dataSvc.storeItem(toSave).then(function (data) {
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

		$scope.saveEpisode = function () {
			var toSave = angular.copy(appState.editEpisode);

			dataSvc.storeEpisode(toSave)
				.then(function (data) {
					modelSvc.cache("episode", dataSvc.resolveIDs(data));
					modelSvc.deriveEpisode(modelSvc.episodes[appState.episodeId]);
					modelSvc.resolveEpisodeContainers(appState.episodeId); // only needed for navigation_depth changes
					modelSvc.resolveEpisodeAssets(appState.episodeId);
					appState.duration = modelSvc.assets[data.master_asset_id].duration;
					appState.editEpisode = false;
					appState.videoControlsLocked = false;

				}, function (data) {
					console.error("FAILED TO STORE EPISODE", data);
				});
		};

		$scope.editCurrentScene = function () {
			var episode = modelSvc.episodes[appState.episodeId];
			angular.forEach(episode.scenes, function (scene) {
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
			console.log("editController editEpisode");
			appState.editEpisode = modelSvc.episodes[appState.episodeId];
			appState.videoControlsActive = true; // TODO see playerController showControls; this may not be sufficient on touchscreens
			appState.videoControlsLocked = true;
		};

		$scope.deleteEvent = function (eventId) {
			if (window.confirm("Are you sure you wish to delete this item?")) {
				console.log("About to delete ", eventId);

				var eventType = modelSvc.events[eventId]._type;
				dataSvc.deleteItem(eventId).then(function (data) {
					console.log("success deleting:", data);
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
					console.log("failed to delete:", data);
				});
			}
		};

		$scope.cancelEventEdit = function (originalEvent) {
			console.log("cancelEventEdit");
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
			console.log("cancelEpisodeEdit", originalEvent);

			modelSvc.episodes[appState.episodeId] = originalEvent;

			modelSvc.deriveEpisode(modelSvc.episodes[originalEvent._id]);
			modelSvc.resolveEpisodeContainers(originalEvent._id); // only needed for navigation_depth changes
			modelSvc.resolveEpisodeEvents(originalEvent._id); // needed for template or style changes
			console.log("Episode StyleCss is now ", modelSvc.episodes[originalEvent._id].styleCss);
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

	});
