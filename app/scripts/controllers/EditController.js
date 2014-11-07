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
			console.log("SELECTED: ", asset_id);

			$scope.item.asset = modelSvc.assets[asset_id];
			if ($scope.item.type === 'image') {
				$scope.item.asset_id = asset_id;
			} else if ($scope.item.type === 'link') {
				$scope.item.link_image_id = asset_id;
			} else if ($scope.item.type === 'annotation') {
				$scope.item.annotation_image_id = asset_id;
			} else {
				console.error("Tried to select asset for unknown item type", $scope.item);
			}
			$scope.endChooseAsset();
		};
		$scope.toggleUpload = function () {
			$scope.showUpload = !$scope.showUpload;
		};
		$scope.endChooseAsset = function () {
			$scope.w1();
			$scope.w2();
			$scope.showAssetPicker = false;
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
		};

		$scope.saveEvent = function () {
			var toSave = angular.copy(appState.editEvent);
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
			dataSvc.storeEpisode(toSave).then(function (data) {
				console.log("Stored episode", data);
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
				console.log(modelSvc.events[eventId]);
				dataSvc.deleteItem(eventId).then(function (data) {
					console.log("success deleting:", data);
					if (appState.product === 'sxs' && modelSvc.events[eventId].asset) {
						dataSvc.deleteAsset(modelSvc.events[eventId].asset._id);
					}
					timelineSvc.removeEvent(eventId);
					delete modelSvc.events[eventId];
					modelSvc.resolveEpisodeEvents(appState.episodeId);
					appState.editEvent = false;
					appState.videoControlsLocked = false;
				}, function (data) {
					console.log("failed to delete:", data);
				});
			}
		};

		$scope.cancelEventEdit = function (originalEvent) {
			if (appState.editEvent._id === 'internal:editing') {
				delete(modelSvc.events['internal:editing']);
				timelineSvc.removeEvent("internal:editing");
			} else {
				modelSvc.events[appState.editEvent._id] = originalEvent;
				timelineSvc.updateEventTimes(originalEvent);
			}
			modelSvc.resolveEpisodeEvents(appState.episodeId);
			appState.editEvent = false;
			appState.videoControlsLocked = false;
		};

		$scope.cancelEpisodeEdit = function (originalEvent) {
			modelSvc.episodes[appState.episodeId] = angular.copy(originalEvent);
			modelSvc.deriveEpisode(modelSvc.episodes[appState.episodeId]);
			appState.editEpisode = false;
			appState.videoControlsLocked = false;
		};

		var generateEmptyItem = function (type) {
			console.log("generateEmptyItem", type);
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
					"title": {
						en: ""
					},
					"description": {
						en: ""
					}
				};
			}
			if (type === 'video') {
				// TODO: this should be an injected episode with the linked/uploaded video as its master asset
			}

			if (type === 'comment' || type === 'transcript' || type === 'annotation') {
				stub = {
					"_type": "Annotation",
					"annotation": {
						en: ""
					},
					"annotator": {
						en: ""
					},
					"annotation_image_id": ""
				};
			}

			if (type === 'file' || type === 'image') {
				stub = {
					"_type": "Upload",
					"asset_id": "",
					"title": {
						en: ""
					},
					"description": {
						en: ""
					}
				};
			}

			if (type === 'link') {
				stub = {
					"_type": "Link",
					"link_image_id": "",
					"url": "https://",
					"title": {
						en: ""
					},
					"description": {
						en: ""
					}
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
					"question": "templates/item/question-mc-formative.html",
					"video": "TODO:VIDEO"
				};
				stub.templateUrl = defaultTemplateUrls[type];
			}
			angular.extend(base, stub);
			return base;
		};

	});
