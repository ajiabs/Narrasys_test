'use strict';
/*


TODO: creating new scenes needs to affect end times of other scenes.
Force all scenes to end-time=auto, always recalculate scene end times from scratch.



*/
angular.module('com.inthetelling.story')
	.controller('ItemEditController', function ($scope, $rootScope, appState, dataSvc, modelSvc, timelineSvc) {

		$scope.addEvent = function (producerItemType) {
			// console.log("itemEditController.addEvent");
			var newEvent = generateEmptyItem(producerItemType);
			modelSvc.cache("event", newEvent);

			appState.editing = modelSvc.events["internal:editing"];
			appState.videoControlsLocked = true;

			modelSvc.resolveEpisodeEvents(appState.episodeId);
			timelineSvc.injectEvents([modelSvc.events["internal:editing"]]);

		};

		$scope.saveEvent = function () {

			var toSave = angular.copy(appState.editing);
			dataSvc.storeItem(toSave).then(function (data) {

				if (appState.editing._id === 'internal:editing') {
					// update the new item with its real ID (and remove the temp version)
					timelineSvc.removeEvent("internal:editing");
					delete(modelSvc.events["internal:editing"]);
					modelSvc.cache("event", dataSvc.resolveIDs(data));
					modelSvc.resolveEpisodeEvents(appState.episodeId);
					timelineSvc.injectEvents([modelSvc.events[data._id]]);
				}

				appState.editing = false;
			}, function (data) {
				console.error("FAILED TO STORE EVENT", data);
			});

		};

		$scope.editCurrentScene = function () {
			var episode = modelSvc.episodes[appState.episodeId];
			angular.forEach(episode.scenes, function (scene) {
				if (scene.isCurrent) {
					// TODO This is redundant with ittItem editItem...
					timelineSvc.seek(scene.start_time);
					appState.editing = modelSvc.events[scene._id];
					appState.editing.producerItemType = 'scene';
					appState.videoControlsActive = true;
					appState.videoControlsLocked = true;
				}
			});
		};

		$scope.deleteEvent = function (eventId) {
			if (window.confirm("Are you sure you wish to delete this item?")) {
				dataSvc.deleteItem(appState.editing._id).then(function (data) {
					console.log("success deleting:", data);
					timelineSvc.removeEvent(appState.editing._id);
					delete modelSvc.events[appState.editing._id];
					modelSvc.resolveEpisodeEvents(appState.episodeId);
					if (appState.product === 'sxs' && appState.editing.asset) {
						dataSvc.deleteAsset(appState.editing.asset._id);
					}
					appState.editing = false;
					appState.videoControlsLocked = false;
				}, function (data) {
					console.log("failed to delete:", data);
				});
			}

			modelSvc.resolveEpisodeEvents(appState.episodeId);
			timelineSvc.removeEvents([modelSvc.events[eventId]]);
			appState.editing = false;
			appState.videoControlsLocked = false;
		};

		$scope.cancelEventEdit = function (originalEvent) {
			if (appState.editing._id === 'internal:editing') {
				delete(modelSvc.events['internal:editing']);
				timelineSvc.removeEvent([modelSvc.events["internal:editing"]]);
			} else {
				modelSvc.events[appState.editing._id] = originalEvent;
				timelineSvc.updateEventTimes(originalEvent);
				if (originalEvent.start_time) {
					// make sure they can see the unedited event come back, if they changed its start time:
					timelineSvc.seek(originalEvent.start_time);
				}
			}

			modelSvc.resolveEpisodeEvents(appState.episodeId);
			appState.editing = false;
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
				video (injected episode)

			*/

			if (type === 'scene') {
				// TODO 
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
				stub.annotator = 'Professor Smith'; // TODO get real name from somewhere
				stub.layouts = ["windowFg"];
				stub.end_time = appState.time;
				stub.stop = true;

				// Override default template selection with a special SXS one:
				stub.templateUrl = 'templates/item/sxs-' + type + '.html';
			} else {
				var defaultTemplateUrls = {
					"scene": "templates/item/TODO-DEFAULTSCENETEMPLATE.html",
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

			console.log("EMPTY: ", base);
			return base;
		};

	});
