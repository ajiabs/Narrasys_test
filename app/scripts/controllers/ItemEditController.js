'use strict';

angular.module('com.inthetelling.story')
	.controller('ItemEditController', function ($scope, $rootScope, appState, dataSvc, modelSvc, timelineSvc) {

		$scope.addItem = function (type) {
			console.log("ItemEditController.addItem, ", type);

			// TODO pause the video

			appState.editing = generateEmptyItem(type);

			modelSvc.cache("event", appState.editing);
			modelSvc.resolveEpisodeEvents(appState.episodeId);
			timelineSvc.injectEvents([modelSvc.events["internal:editing"]]);

		};

		$scope.editItem = function () {
			// TODO (copy existing item id into appState.editing), keep a  copy of the item's 
			// original state so it can be brought back on cancel
		};

		$scope.cancelEdit = function () {
			console.log("Cancel edit", appState.editing);
			if (appState.editing) {

				if (appState.editing._id === 'internal:editing') {
					timelineSvc.removeEvent('internal:editing');
				} else {
					// TODO: restore the original unedited version of the item, update timelineSvc
					// (may need to change the event time)
				}

				delete(appState.editing);
				delete(modelSvc.events["internal:editing"]);
				modelSvc.resolveEpisodeEvents(appState.episodeId);

			}
		};

		$scope.saveEdit = function () {
			console.log("TODO");

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

					// TODO: resolve event layout IDs
					// TODO: force scene to redraw

				} else {
					// TODO: don't delete the old event, just update it
				}
			}, function (data) {
				console.log("failed", data);
			});

		};

		var generateEmptyItem = function (type) {
			var base = {
				"_id": "internal:editing",
				"start_time": appState.time,
				"end_time": appState.time,
				"episode_id": appState.episodeId,
				"annotator": 'Professor Smith', // TODO get real name from somewhere
				"templateUrl": 'templates/item/sxs-' + type + '.html',
				"layouts": ["windowFg"],
				"stop": true,
				"type": type,
				"isCurrent": true,
				"sxs": true // TEMPORARY
			};

			var stub;
			if (type === 'comment') {
				stub = {
					"_type": "Annotation",
					"annotation": ''
				};
			}

			if (type === 'file' || type === 'image') {
				stub = {
					"_type": "Upload",
					//"link_image_id": "",
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

			if (type === 'video') {
				stub = {
					"_type": "Upload",
					//"link_image_id": "",
					"title": "",
					"description": ""
				};
			}

			angular.extend(base, stub);
			return base;
		};
	});
