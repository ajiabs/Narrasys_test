'use strict';
/*
TODO: This is too tightly bound to ittItemEditor; need to make better decisions about 
which functions go here vs there 

*/
angular.module('com.inthetelling.story')
	.controller('ItemEditController', function ($scope, $rootScope, appState, dataSvc, modelSvc, timelineSvc) {

		$scope.addEvent = function (producerItemType) {
			console.log("itemEditController.addEvent");
			var newEvent = generateEmptyItem(producerItemType);
			modelSvc.cache("event", newEvent);

			appState.editing = modelSvc.events["internal:editing"];

			modelSvc.resolveEpisodeEvents(appState.episodeId);
			timelineSvc.injectEvents([modelSvc.events["internal:editing"]]);
		};

		$scope.saveEvent = function () {

			if (appState.editing._id === 'internal:editing') {
				// store it to API, then
				// ... modelSvc.cache returned item (with new ID)
				// ... timelineSvc.injectEvents([modelSvc.events["internal:editing"]]);

				// ... delete(modelSvc.events['internal:editing']);
				// ... timelineSvc.removeEvent('internal:editing');

				modelSvc.resolveEpisodeEvents(appState.episodeId);
				timelineSvc.injectEvents([modelSvc.events["internal:editing"]]);
			} else {
				// just store it to API and ignore the return, since it's already correct in the browser
			}

			// cancel watchers
			appState.editing = false;
		};

		$scope.deleteEvent = function (eventId) {

			// if sxs, delete event's asset from API async

			// if id !== internal:editing, delete event from API async

			// delete event from modelSvc.events

			modelSvc.resolveEpisodeEvents(appState.episodeId);
			timelineSvc.removeEvents([modelSvc.events[eventId]]);
			appState.editing = false;
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
					"title": "",
				};
			}
			if (type === 'video') {
				// TODO: this should be an injected episode with the linked/uploaded video as its master asset
			}

			if (type === 'comment' || type === 'transcript' || type === 'annotation') {
				stub = {
					"_type": "Annotation",
					"annotation": "",
					"annotation_image_id": ""
				};
			}

			if (type === 'file' || type === 'image') {
				stub = {
					"_type": "Upload",
					"asset_id": "",
					"title": "",
					"description": ""
				};
			}

			if (type === 'link') {
				stub = {
					"_type": "Link",
					"link_image_id": "asset1",
					"url": "https://",
					"title": "",
					"description": ""
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

		/* OLD CODE BELOW */
		/*
				$scope.addItem = function (type) {
					console.log("ItemEditController.addItem, ", type);

					// TODO pause the video

					appState.editing = generateEmptyItem(type);

					modelSvc.cache("event", appState.editing);
					modelSvc.resolveEpisodeEvents(appState.episodeId);
					timelineSvc.injectEvents([modelSvc.events["internal:editing"]]);

				};

				$scope.cancelEdit = function () {
					console.log("Cancel edit", appState.editing);
					if (appState.editing) {
						if (appState.editing._id === 'internal:editing') {
							timelineSvc.removeEvent('internal:editing');
						} else {
							// TODO: restore the original unedited version of the item, update timelineSvc

							modelSvc.events[appState.editing._id] = angular.copy(appState.uneditedItem);
							delete(appState.uneditedItem);
							modelSvc.resolveEpisodeEvents(appState.episodeId);
							// TODO may need to update the timeline as well, if they changed the item start time...
						}

						delete(appState.editing);
						delete(modelSvc.events["internal:editing"]);
						modelSvc.resolveEpisodeEvents(appState.episodeId);

					}
				};

				$scope.saveEdit = function () {
					var toSave = angular.copy(appState.editing);
					toSave.type = toSave._type;

					// TODO: if we're editing an existing item (its id won't be internal:editing) then don't delete internal:editing
					dataSvc.storeItem(toSave).then(function (data) {
						console.log("success", data);
						delete(appState.editing);

						if (toSave._id === 'internal:editing') {
							console.log("Saved:", data);
							timelineSvc.removeEvent("internal:editing");
							delete(modelSvc.events["internal:editing"]);
							modelSvc.cache("event", dataSvc.resolveIDs(data));
							modelSvc.resolveEpisodeEvents(appState.episodeId);
							timelineSvc.injectEvents([modelSvc.events[data._id]]);

						} else {
							// nothing to do here, it's already in the cache!
							// (TODO test this to make sure I've not missed something stupid here.....)
						}
					}, function (data) {
						console.log("failed", data);
					});
				};

				$scope.deleteItem = function () {
					if (window.confirm("Are you sure you wish to delete this item?")) {
						dataSvc.deleteItem(appState.editing._id).then(function (data) {
							console.log("success deleting:", data);
							timelineSvc.removeEvent(appState.editing._id);
							delete(modelSvc.events[appState.editing._id]);
							modelSvc.resolveEpisodeEvents(appState.episodeId);
							if (appState.editing.asset) {
								dataSvc.deleteAsset(appState.editing.asset._id);
							}
							delete(appState.editing);
						}, function (data) {
							console.log("failed to delete:", data);
						});
					}
				};
		*/
	});
