'use strict';

angular.module('com.inthetelling.story')
	.controller('ItemEditController', function ($scope, $rootScope, appState, modelSvc, timelineSvc) {

		$scope.addItem = function (type) {
			console.log("ItemEditController.addItem, ", type);

			// TODO pause the video

			appState.editing = generateEmptyItem(type);

			modelSvc.cache("event", appState.editing);
			modelSvc.resolveEpisodeEvents(appState.episodeId);
			timelineSvc.injectEvents([modelSvc.events["internal:editing"]]);

		};

		$scope.editItem = function (TODO) {
			// TODO (copy existing item id into appState.editing), keep a  copy of the item's 
			// original state so it can be brought back on cancel
		};

		$scope.cancelEdit = function () {
			console.log("Cancel edit", appState.editing);
			if (appState.editing) {

				// TODO if appState.editing._id != internal:editing, restore the original version of the item
				// TODO if its id is internal:editing, remove the event from  timelineSvc
				delete(appState.editing);
				delete(modelSvc.events["internal:editing"]);
				modelSvc.resolveEpisodeEvents(appState.episodeId);

			}
		};

		$scope.saveEdit = function () {
			console.log("TODO");
			// TODO store item in api, get its id, update modelSvc and timelineSvc with a clean copy (not just a reference to appState.editing)

			delete(appState.editing);
			delete(modelSvc.events["internal:editing"]);
			modelSvc.resolveEpisodeEvents(appState.episodeId);
		};

		var generateEmptyItem = function (type) {
			var base = {
				"_id": "internal:editing",
				"start_time": appState.time,
				"end_time": appState.time,
				"episode_id": appState.episodeId,
				"annotator": 'Professor Smith', // TODO get real name from somewhere
				"templateUrl": 'templates/item/sxs-comment.html',
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
