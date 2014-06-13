'use strict';

// TODO: load and resolve categories

// Cache here is for things we never need to expose to the rest of the app (style, layout, template IDs)
// the rest gets passed to modelSvc

//  use PUT to update, POST to create new   
// for assets, DELETE then POST
// Wrap events in event: {}   same for other things?  template didn't seem to need it


angular.module('com.inthetelling.player')
	.factory('dataSvc', function($q, $http, $routeParams, $timeout, config, authSvc, modelSvc) {
		var svc = {};


		svc.templateTmp = function() {
			// $http({
			// 	method: 'POST',
			// 	url: config.apiDataBaseUrl + '/v1/templates',
			// 	data: {name: "Multiple choice question",url: "templates/item/multiplechoice.html"}
			// 			}).success(function(data, status, headers) {
			// 				console.log("Created template:", data, status, headers);

			// 			}).error(function(data, status, headers) {
			// 				console.log("Failed to create template", data, status, headers);
			// 			});


		};


		// svc.deleteEvent = function() {
		// 	$http({
		// 		method: 'DELETE',
		// 		url: config.apiDataBaseUrl + '/v2/events/(event id)', // note different from docs!
		// 	}).success(function(data, status, headers) {
		// 		console.log("deleted event:", data, status, headers);

		// 	}).error(function(data, status, headers) {
		// 		console.log("Failed ", data, status, headers);
		// 	});
		// };

		svc.updateTemplate = function() {
			$http({
				method: 'PUT',
				url: config.apiDataBaseUrl + '/v1/templates/539a07ee2442bd20bf000006',
				data: {
					name: "Multiple choice question",
					url: "templates/item/multiplechoice.html",
					event_types: ["Plugin"]
				}
			}).success(function(data, status, headers) {
				console.log("Created template:", data, status, headers);

			}).error(function(data, status, headers) {
				console.log("Failed to create template", data, status, headers);
			});


		};

		svc.createPluginEvent = function() {

			var newEvent = {
				episode_id: "533aec182442bdd34c000003",
				type: "Plugin",
				start_time: 386,
				data: {
					"foo": "bar"
				},
				template_id: "539a07ee2442bd20bf000006"
			};


			$http({
				method: 'POST',
				url: config.apiDataBaseUrl + '/v2/episodes/533aec182442bdd34c000003/events/',
				data: {
					event: newEvent
				}
			}).success(function(data, status, headers) {
				console.log("Created event:", data, status, headers);

			}).error(function(data, status, headers) {
				console.log("Failed to create event", data, status, headers);
			});
		};

		svc.updateEvent = function() {

			var pluginData = {
				"_pluginType": "multiplechoice",
				"_version": 1,
				"_plugin": {
					"question": "This is the question text. Here's an umlaut: ü",
					"distractors": [{
						"text": "This is the first distractor",
						"feedback": "The text to be shown if the first answer was selected."
					}, {
						"text": "This is the second distractor",
						"feedback": "If the second distractor is chosen, show this text."
					}, {
						"text": "This is the third distractor",
						"feedback": "The text to be shown if you answer correctly by selecting this.",
						"correct": true
					}]
				}
			};


			var eventData = {
				episode_id: "533aec182442bdd34c000003",
				type: "Plugin",
				start_time: 386,
				data: pluginData,
				template_id: "539a07ee2442bd20bf000006"
			};


			$http({
				method: 'PUT',
				url: config.apiDataBaseUrl + '/v2/events/539a0d182442bd86f1000004',
				data: {
					event: eventData
				}
			}).success(function(data, status, headers) {
				console.log("Updated event:", data, status, headers);

			}).error(function(data, status, headers) {
				console.log("Failed:", data, status, headers);
			});


		};


		svc.storeEvent = function(eventData) {
			console.log("TODO");
		};

		svc.storeEpisode = function(episodeData) {
			console.log("TODO");
		};

		svc.storeAsset = function(assetData) {
			console.log("TODO");
		};

		/* ------------------------------------------------------------------------------ */

		// TODO cache this and don't re-request from API if we already have it 
		svc.getEpisodeList = function() {
			var getEpisodeListDefer = $q.defer();
			authSvc.authenticate()
				.then(function() {
					$http.get(config.apiDataBaseUrl + "/v1/episodes")
						.success(function(data) {
							getEpisodeListDefer.resolve(data);
						})
						.error(function(a, b, c, d) {
							//console.log(a,b,c,d);
						});
				});
			return getEpisodeListDefer.promise;
		};

		// getEpisode just needs to retrieve all episode data from the API, and pass it on
		// to modelSvc.  No promises needed, let the $digest do the work
		svc.getEpisode = function(epId) {
			if (modelSvc.episodes[epId]) {
				return; // already requested
			}
			modelSvc.cache("episode", {
				_id: epId
			}); // init with empty object to be filled by asynch process

			if ($routeParams.local) {
				console.log("LOCAL DATA");
				mockEpisode(epId);
			} else {
				authSvc.authenticate()
					.then(function() {
						// console.log("auth succeeded");
						getCommon().then(function() {
							// console.log("getCommon succeeded");
							getEpisode(epId);
						}, function(err) {
							console.error("getCommon failed: ", err);
						});
					}, function(err) {
						console.error("Authentication error: ", err);
					});
			}
		};

		var dataCache = {
			template: {},
			layout: {},
			style: {}
		};

		// Gets all layouts, styles, and templates
		var haveCommon = false;
		var getCommonDefer = $q.defer();
		var getCommon = function() {
			// console.log("dataSvc.getCommon");
			if (haveCommon === true) {
				getCommonDefer.resolve();
			} else
			if (haveCommon === 'in progress') {
				return getCommonDefer.promise;
			} else {
				haveCommon = 'in progress';
				$q.all([
					$http.get(config.apiDataBaseUrl + '/v1/templates'),
					$http.get(config.apiDataBaseUrl + '/v1/layouts'),
					$http.get(config.apiDataBaseUrl + '/v1/styles')
				]).then(function(responses) {
					cache("templates", responses[0].data);
					cache("layouts", responses[1].data);
					cache("styles", responses[2].data);
					haveCommon = true;
					getCommonDefer.resolve();
				}, function(failure) {
					console.error("getCommon failed", failure);
					haveCommon = false;
					getCommonDefer.reject();
				});
			}
			return getCommonDefer.promise;
		};

		var cache = function(cacheType, dataList) {
			angular.forEach(dataList, function(item) {
				if (cacheType === "templates") {
					/* API format: 
					_id									"528d17ebba4f65e578000007"
					applies_to_episodes	false  (if true, event_types is empty)
					created_at					"2013-11-20T20:13:31Z"
					event_types					["Scene"]    (or Annotation, Link, Upload)
					name								"Scene 2 columns right"
					updated_at					"2013-11-20T20:13:31Z"
					url									"templates/scene-centered.html"
				*/
					dataCache.template[item._id] = {
						id: item._id,
						url: item.url,
						type: (item.applies_to_episodes ? "Episode" : item.event_types ? item.event_types[0] : undefined),
						displayName: item.name
					};
				} else if (cacheType === "layouts") {
					/* API format:
					_id									"528d17ebba4f65e57800000a"
					created_at					"2013-11-20T20:13:31Z"
					css_name						"videoLeft"
					description					"The video is on the left"
					display_name				"Video Left"
					updated_at					"2013-11-20T20:13:31Z"
				*/
					dataCache.layout[item._id] = {
						id: item._id,
						css: item.css_name,
						displayName: item.display_name
					};

				} else if (cacheType === "styles") {
					/* API format:
					_id						"528d17f1ba4f65e578000036"
					created_at		"2013-11-20T20:13:37Z"
					css_name			"typographySerif"
					description		"Controls the fonts and relative text sizes"
					display_name	"Typography Serif"
					updated_at		"2013-11-20T20:13:37Z"
				*/
					dataCache.style[item._id] = {
						id: item._id,
						css: item.css_name,
						displayName: item.display_name
					};
				}
			});
		};

		// transform API common IDs into real values
		var resolveIDs = function(obj) {
			// console.log("resolving IDs", obj);
			if (obj.template_id) {
				if (dataCache.template[obj.template_id]) {
					obj.templateUrl = dataCache.template[obj.template_id].url;
					delete obj.template_id;
				} else {
					console.error("Couldn't get templateUrl for id " + obj.template_id);
				}
			}
			if (obj.layout_id) {
				var layouts = [];
				angular.forEach(obj.layout_id, function(id) {
					if (dataCache.layout[id]) {
						layouts.push(dataCache.layout[id].css);
					} else {
						console.error("Couldn't get layout for id " + id);
					}
				});
				if (layouts.length > 0) {
					obj.layouts = layouts;
				}
				delete obj.layout_id;
			}
			if (obj.style_id) {
				var styles = [];
				angular.forEach(obj.style_id, function(id) {
					if (dataCache.style[id]) {
						styles.push(dataCache.style[id].css);
					} else {
						console.error("Couldn't get style for id " + id);
					}
				});
				if (styles.length > 0) {
					obj.styles = styles;
				}
				delete obj.style_id;
			}
			return obj;
		};

		// auth and common are already done before this is called.  Batches all necessary API calls to construct an episode
		var getEpisode = function(epId) {
			$http.get(config.apiDataBaseUrl + "/v1/episodes/" + epId)
				.success(function(episodeData) {

					console.log("episode: ", episodeData);
					if (episodeData.status === "Published" || authSvc.userHasRole("admin")) {

						modelSvc.cache("episode", resolveIDs(episodeData));
						// Get episode events
						getEpisodeEvents(epId);

						// this will get the episode container and its assets, then iterate up the chain to all parent containers
						getContainer(episodeData.container_id, epId);
					} else {
						console.error("Episode not published, and user doesn't have admin role.");
					}
				})
				.error(function(data, status, headers, config) {
					console.error("API call to /v1/episodes/" + epId + " failed (bad episode ID?)");
				});
		};

		var getEpisodeEvents = function(epId) {
			$http.get(config.apiDataBaseUrl + "/v2/episodes/" + epId + "/events")
				.success(function(events) {
					angular.forEach(events, function(eventData) {
						modelSvc.cache("event", resolveIDs(eventData));
					});
					// Tell modelSvc it can build episode->scene->item child arrays
					modelSvc.resolveEpisodeEvents(epId);
				})
				.error(function(err) {
					console.error("getEpisodeEvents failed", err);
				});
		};

		// gets container and container assets, then iterates to parent container
		var getContainer = function(containerId, episodeId) {
			// console.log("getContainer", containerId, episodeId);
			$http.get(config.apiDataBaseUrl + "/v1/containers/" + containerId)
				.success(function(container) {
					modelSvc.cache("container", container[0]);
					// iterate to parent container
					if (container[0].parent_id) {
						getContainer(container[0].parent_id, episodeId);
					}
				})
				.error(function(err) {
					console.error("getContainer failed", err);
				});

			$http.get(config.apiDataBaseUrl + "/v1/containers/" + containerId + "/assets")
				.success(function(containerAssets) {
					// console.log("container assets", containerAssets);
					angular.forEach(containerAssets.files, function(asset) {
						modelSvc.cache("asset", asset);
					});
					modelSvc.resolveEpisodeAssets(episodeId);
				})
				.error(function(err) {
					console.error("getContainerAssets failed", err);
				});
		};

		var mockEpisode = function(epId) {
			// IN PROGRESS
			modelSvc.cache("episode", {
				"_id": epId,
				"created_at": "2014-04-10T02:02:15Z",
				"description": "The Business Case for Sustainability",
				"master_asset_id": "masterasset",
				"title": "Test Episode",
				"status": "Published",
				"templateUrl": "templates/episode/episode.html",
				"styles": [
					"transitionPop", "highlightBorder"
				]
			});
			modelSvc.cache("asset", {
				"_id": "masterasset",
				"_type": "Asset::Video",
				"alternate_urls": [
					"https://www.youtube.com/embed/sRS36lDiDvk",
					"https://s3.amazonaws.com/itt.uploads/development/Test%20Customer/SLIC/The%20Business%20Case/Sustainability%20Pays%20sXs/9aPKP5AJNJdH-UEQ2EB9jg.m3u8",
					"https://s3.amazonaws.com/itt.uploads/development/Test%20Customer/SLIC/The%20Business%20Case/Sustainability%20Pays%20sXs/9aPKP5AJNJdH-UEQ2EB9jg_416x234.webm",
					"https://s3.amazonaws.com/itt.uploads/development/Test%20Customer/SLIC/The%20Business%20Case/Sustainability%20Pays%20sXs/9aPKP5AJNJdH-UEQ2EB9jg_960x540.webm",
					"https://s3.amazonaws.com/itt.uploads/development/Test%20Customer/SLIC/The%20Business%20Case/Sustainability%20Pays%20sXs/9aPKP5AJNJdH-UEQ2EB9jg_416x234.mp4",
					"https://s3.amazonaws.com/itt.uploads/development/Test%20Customer/SLIC/The%20Business%20Case/Sustainability%20Pays%20sXs/9aPKP5AJNJdH-UEQ2EB9jg_960x540.mp4"
				],
				"attachment": "Sustainability_Pays_for_Demo_1.mp4",
				"base_path": "development/Test Customer/SLIC/The Business Case/Sustainability Pays sXs",
				"content_type": "video/mp4",
				"duration": "443.199313",
				"extension": "mp4",
				"file_size": 338886327,
				"filename": "Sustainability_Pays_for_Demo_1.mp4",
				"frame_rate": "10000000/417083",
				"frame_rate_d": 417083,
				"frame_rate_n": 10000000,
				"height": 720,
				"name": "Sustainability Pays for Demo 1",
				"original_filename": "Sustainability_Pays_for_Demo_1.mp4",
				"start_time": "0.000000",
				"status": "complete",
				"url": "https://s3.amazonaws.com/itt.uploads/development/Test%20Customer/SLIC/The%20Business%20Case/Sustainability%20Pays%20sXs/Sustainability_Pays_for_Demo_1.mp4",
				"width": 1280
			});

			var sceneStub = {
				"_id": "-",
				"_type": "Scene",
				"title": "Scene title",
				"description": "Scene Description",
				"keywords": [],
				"start_time": 0,
				"end_time": 10,
				"type": "Scene",
				"episode_id": epId,
				//"templateUrl": "templates/scene/centered.html",
				"layouts": ["", "splitTransmedia", "showCurrent"]
			};

			var scenetemplateurls = [
				"templates/scene/1col.html",
				"templates/scene/2colL.html",
				"templates/scene/2colR.html",
				"templates/scene/centered.html",
				"templates/scene/cornerH.html",
				"templates/scene/cornerV.html"
			];


			for (var i = 0; i < 20; i++) {
				var scene = angular.copy(sceneStub);
				scene._id = "scene-" + i;
				scene.title = (i / 2 === Math.floor(i / 2)) ? "Scene " + (i + 1) + " Title" : "";
				scene.start_time = (i * 10);
				scene.end_time = (i * 10) + 10;
				scene.templateUrl = scenetemplateurls[i % scenetemplateurls.length];
				modelSvc.cache("event", scene);
			}

			var annotationStub = {
				"_id": "",
				"_type": "Annotation",
				"annotation": "Transcript text",
				"annotation_image_id": "asset3",
				"annotator": "Speaker Name",
				"cosmetic": false,
				"episode_id": epId,
				"required": false,
				"stop": false,
				"type": "Annotation",
				"templateUrl": "templates/item/transcript-withthumbnail.html",
				"styles": []
			};

			for (i = 0; i < 30; i++) {
				var transcript = angular.copy(annotationStub);
				transcript._id = "transcript-" + i;
				transcript.annotation = "Transcript block number " + (i + 1);
				transcript.start_time = (i);
				transcript.end_time = (i + 1);
				modelSvc.cache("event", transcript);
			}

			modelSvc.cache("asset", {
				"_id": "asset1",
				"_type": "Asset::Image",
				"url": "https://s3.amazonaws.com/itt.uploads/development/Test%20Customer/SLIC/The%20Business%20Case/Sustainability%20Pays/Sustainability_Scorecard_1.jpg",
				"extension": "jpg",
				"name": "Sustainability Scorecard 1",
			});
			modelSvc.cache("asset", {
				"_id": "asset2",
				"_type": "Asset::Image",
				"url": "http://placehold.it/350x350",
				"extension": "jpg",
				"name": "350x350 placeholder",
			});
			modelSvc.cache("asset", {
				"_id": "asset3",
				"_type": "Asset::Image",
				"url": "http://placehold.it/64x64",
				"extension": "jpg",
				"name": "64x64 placeholder",
			});
			modelSvc.cache("asset", {
				"_id": "asset4",
				"_type": "Asset::Image",
				"url": "http://placehold.it/900x900",
				"extension": "jpg",
				"name": "900x900 placeholder",
			});


			var linkStub = {
				"_id": "",
				"_type": "Link",
				"link_image_id": "asset1",
				"url": "http://www.inthetelling.com",
				"title": "Link Title",
				"description": "Link Description",
				"cosmetic": false,
				"stop": false,
				"type": "Link",
				"episode_id": epId,
				"templateUrl": "templates/item/link.html",
				"layouts": ["inline"],
				"layoutCss": "inline",
				"isContent": true,
			};
			for (i = 0; i < 30; i++) {
				var link = angular.copy(linkStub);
				link._id = "link-" + i;
				link.required = (Math.random() > 0.5);
				link.start_time = i;
				link.end_time = i + 1;
				modelSvc.cache("event", link);
			}

			var uploadStub = {
				"_type": "Upload",

				"description": "Description of an upload item",
				"required": false,
				"cosmetic": false,
				"stop": false,
				"type": "Upload",
				"episode_id": epId,
				"templateUrl": "templates/item/upload-thumbnail.html",
				"layouts": [
					"inline"
				]
			};
			for (i = 0; i < 30; i++) {
				var upload = angular.copy(uploadStub);
				upload._id = "upload-" + i;
				upload.asset_id = "asset" + (i % 3 + 2);
				upload.title = "Upload number " + (i % 3 + 1);
				upload.start_time = i * 2;
				upload.end_time = i * 2 + 2;
				modelSvc.cache("event", upload);
			}

			var layouts = ["windowBg", "mainBg", "altBg", "videoOverlay", "mainFg", "altFg", "windowFg"];
			for (i = 0; i < 7; i++) {
				var filltest = angular.copy(uploadStub);
				filltest.layouts = [layouts[i]];
				filltest._id = "filltest-" + i;
				filltest.asset_id = "asset2";
				filltest.start_time = i * 5;
				filltest.end_time = i * 5 + 4;
				filltest.templateUrl = "templates/item/image-fill.html";
				modelSvc.cache("event", filltest);

			}

			modelSvc.resolveEpisodeEvents(epId);
			modelSvc.resolveEpisodeAssets(epId);
		};

		return svc;
	});
