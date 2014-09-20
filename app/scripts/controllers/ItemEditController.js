'use strict';

angular.module('com.inthetelling.story')
	.controller('ItemEditController', function ($scope, appState, modelSvc) {

		$scope.addItem = function (type) {
			console.log("adding item of type ", type);

			// TODO pause the video

			// TODO get username (and profile photo) from 

			appState.editing = {
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

			angular.extend(appState.editing, stub);

			//TODO insert new item into timelineSvc

			//TODO watch start time, if it changes, update it in timelineSvc

			modelSvc.cache("event", appState.editing);
			modelSvc.resolveEpisodeEvents(appState.episodeId);

			$scope.$watch(function () {
				return appState.editing;
			}, function () {
				console.log("updtaed appState.editing");
				modelSvc.cache("event", appState.editing);

			}, true);

		};

		$scope.cancelEdit = function () {
			console.log("Cancel edit");
			if (appState.editing) {
				appState.editing = false;
				delete(modelSvc.events["internal:editing"]);
				modelSvc.resolveEpisodeEvents(appState.episodeId);
			}
		};

	});
