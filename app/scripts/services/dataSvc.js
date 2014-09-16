'use strict';

// TODO: load and resolve categories

// Cache here is for things we never need to expose to the rest of the app (style, layout, template IDs)
// the rest gets passed to modelSvc

//  use PUT to update, POST to create new   
// for assets, DELETE then POST
// to store -- must wrap events in 'event: {}'  same for other things?  template didn't seem to need it

angular.module('com.inthetelling.story')
	.factory('dataSvc', function ($q, $http, $routeParams, $timeout, config, authSvc, modelSvc, errorSvc) {
		var svc = {};

		/* ------------------------------------------------------------------------------ */

		// getEpisode just needs to retrieve all episode data from the API, and pass it on
		// to modelSvc.  No promises needed, let the $digest do the work
		svc.getEpisode = function (epId) {
			if (!epId) {
				throw ("no episode ID supplied to dataSvc.getEpisode");
			}
			if (modelSvc.episodes[epId]) {
				return; // already requested
			}
			modelSvc.cache("episode", {
				_id: epId
			}); // init with empty object to be filled by asynch process

			if ($routeParams.local) {
				// console.log("LOCAL DATA");
				mockEpisode(epId);
			} else {
				authSvc.authenticate()
					.then(function () {
						return getCommon();
					})
					.then(function () {
						return getEpisode(epId);
					});
			}
		};

		var dataCache = {
			template: {},
			layout: {},
			style: {}
		};

		// Gets all layouts, styles, and templates
		var gettingCommon = false;
		var getCommonDefer = $q.defer();
		var getCommon = function () {
			console.log("dataSvc.getCommon");
			if (gettingCommon) {
				return getCommonDefer.promise;

			} else {
				gettingCommon = true;
				$q.all([
					$http.get(config.apiDataBaseUrl + '/v1/templates'),
					$http.get(config.apiDataBaseUrl + '/v1/layouts'),
					$http.get(config.apiDataBaseUrl + '/v1/styles')
				]).then(function (responses) {
					svc.cache("templates", responses[0].data);
					svc.cache("layouts", responses[1].data);
					svc.cache("styles", responses[2].data);

					gettingCommon = true;
					getCommonDefer.resolve();
				}, function () {
					// console.error("getCommon failed", failure);
					gettingCommon = false;
					getCommonDefer.reject();
				});
			}
			return getCommonDefer.promise;
		};

		svc.cache = function (cacheType, dataList) {
			// console.log("dataSvc.cache", cacheType, dataList);
			angular.forEach(dataList, function (item) {
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
						css_name: item.css_name,
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
						css_name: item.css_name,
						displayName: item.display_name
					};
				}
			});
		};

		// transform API common IDs into real values
		var resolveIDs = function (obj) {
			// console.log("resolving IDs", obj);
			if (obj.template_id) {
				if (dataCache.template[obj.template_id]) {
					obj.templateUrl = dataCache.template[obj.template_id].url;
					delete obj.template_id;
				} else {
					errorSvc.error({
						data: "Couldn't get templateUrl for id " + obj.template_id
					});
				}
			}
			if (obj.layout_id) {
				var layouts = [];
				angular.forEach(obj.layout_id, function (id) {
					if (dataCache.layout[id]) {
						layouts.push(dataCache.layout[id].css_name);
					} else {
						errorSvc.error({
							data: "Couldn't get layout for id " + id
						});
					}
				});
				if (layouts.length > 0) {
					obj.layouts = layouts;
				}
				//delete obj.layout_id;
			}
			if (obj.style_id) {
				var styles = [];
				angular.forEach(obj.style_id, function (id) {
					if (dataCache.style[id]) {
						styles.push(dataCache.style[id].css_name);
					} else {
						errorSvc.error({
							data: "Couldn't get style for id " + id
						});
					}
				});
				if (styles.length > 0) {
					obj.styles = styles;
				}
				//delete obj.style_id;
			}
			return obj;
		};

		// auth and common are already done before this is called.  Batches all necessary API calls to construct an episode
		var getEpisode = function (epId) {
			$http.get(config.apiDataBaseUrl + "/v1/episodes/" + epId)
				.success(function (episodeData) {

					// console.log("episode: ", episodeData);
					if (episodeData.status === "Published" || authSvc.userHasRole("admin")) {

						modelSvc.cache("episode", resolveIDs(episodeData));
						// Get episode events
						getEpisodeEvents(epId);

						// this will get the episode container and its assets, then iterate up the chain to all parent containers
						// (In retrospect, would have been easier to just get all containers at once, but maybe someday we will have soooo many containers
						// that this will be worthwhile)
						getContainer(episodeData.container_id, epId);
					} else {
						errorSvc.error({
							data: "This episode has not yet been published."
						});
					}
				})
				.error(function () {
					errorSvc.error({
						data: "API call to /v1/episodes/" + epId + " failed (bad episode ID?)"
					});
				});
		};

		var getEpisodeEvents = function (epId) {
			$http.get(config.apiDataBaseUrl + "/v2/episodes/" + epId + "/events")
				.success(function (events) {
					angular.forEach(events, function (eventData) {
						modelSvc.cache("event", resolveIDs(eventData));
					});
					// Tell modelSvc it can build episode->scene->item child arrays
					modelSvc.resolveEpisodeEvents(epId);
				});
		};

		// gets container and container assets, then iterates to parent container
		var getContainer = function (containerId, episodeId) {
			// console.log("getContainer", containerId, episodeId);
			$http.get(config.apiDataBaseUrl + "/v1/containers/" + containerId)
				.success(function (container) {
					modelSvc.cache("container", container[0]);
					// iterate to parent container
					if (container[0].parent_id) {
						getContainer(container[0].parent_id, episodeId);
					}
				});

			$http.get(config.apiDataBaseUrl + "/v1/containers/" + containerId + "/assets")
				.success(function (containerAssets) {
					// console.log("container assets", containerAssets);
					angular.forEach(containerAssets.files, function (asset) {
						modelSvc.cache("asset", asset);
					});
					modelSvc.resolveEpisodeAssets(episodeId);
				});
		};

		/* ------------------------------------------------------------------------------ */

		// PRODUCER   WIP
		// a different idiom here, let's see if this is easier to conceptualize.
		// TODO These may belong in modelSvc rather than dataSvc...

		// to use GET(), pass in the API endpoint, and an optional callback for post-processing of the results
		var GETcache = {}; // WARNING this is almost certainly not safe.  If server data changes, this will never find out about it because it will always read from cache instead. 
		var GET = function (path, postprocessCallback) {
			var defer = $q.defer();
			if (GETcache[path]) {
				defer.resolve(GETcache[path]);
			}
			authSvc.authenticate()
				.then(function () {
					return $http.get(config.apiDataBaseUrl + path);
				})
				.then(function (response) {
					var ret = response.data;
					if (postprocessCallback) {
						ret = postprocessCallback(ret);
					}
					GETcache[path] = ret;
					return defer.resolve(ret);
				});
			return defer.promise;
		};

		var PUT = function (path, putData) {
			var defer = $q.defer();

			$http({
				method: 'PUT',
				url: config.apiDataBaseUrl + path,
				data: putData
			}).success(function (data) {
				console.log("Updated event:", data);
				return defer.resolve(data);
			}).error(function (data, status, headers) {
				console.log("Failed:", data, status, headers);
				return defer.reject();
			});
			return defer.promise;
		};

		svc.getEpisodeList = function () {
			return GET("/v1/episodes");
		};

		svc.getAllContainers = function () {
			return GET("/v1/containers", function (containers) {
				// TODO climb through the tree customer->course->session->episode and cache each separately

				return containers;
			});
		};

		// TODO need safety checking here
		svc.storeItem = function (evt) {
			evt = svc.prepItemForStorage(evt);
			console.log(evt);
			if (evt._id) {
				// update
				return PUT("/v2/events/" + evt._id, {
					event: evt
				});
			} else {
				// create TODO
				// return POST("/v2/episodes/" + evt.episode_id + "/event", {
				// 	event: evt
				// });
			}
		};
		svc.prepItemForStorage = function (evt) {
			// console.log("prepItemForStorage", evt);
			// throw away the obvious stuff
			delete evt.asjson;

			// delete derived and temporary fields
			// TODO instead of this should store only those fields we explicitly want to keep; extraneous data gets stored in the DB
			delete evt.styleCss;
			delete evt.layoutCss;
			delete evt.isContent;
			delete evt.isTranscript;
			delete evt.isFuture;
			delete evt.isPast;
			delete evt.isCurrent;
			delete evt.edit;
			delete evt.$$hashKey;
			delete evt.noEmbed;
			delete evt.noExternalLink;
			delete evt.targetTop;
			delete evt.asset;

			// convert style/layout selections back into their IDs.
			// trust evt.styles[] and evt.layouts[], DO NOT use styleCss (it contains the scene and episode data too!)
			evt.style_id = [];
			angular.forEach(evt.styles, function (styleName) {
				var style = svc.readCache("style", "css_name", styleName);
				if (style) {
					evt.style_id.push(style.id);
				} else {
					errorSvc.error({
						data: "Tried to store a style with no ID: " + styleName
					});
				}
			});
			delete evt.styles;
			evt.layout_id = [];
			angular.forEach(evt.layouts, function (layoutName) {
				var layout = svc.readCache("layout", "css_name", layoutName);
				if (layout) {
					evt.layout_id.push(layout.id);
				} else {
					errorSvc.error({
						data: "Tried to store a layout with no ID: " + layoutName
					});
				}
			});
			delete evt.layouts;

			// TODO: what else needs to be done before we can safely store this event?

			return evt;
		};

		// careful to only use this for guaranteed unique fields (style and layout names, basically)
		svc.readCache = function (cache, field, val) {
			var found = false;
			angular.forEach(dataCache[cache], function (item) {
				if (item[field] === val) {
					found = item;
				}
			});
			if (found) {
				return found;
			}
			return false;
		};

		/* ------------------------------------------------------------------------------ */
		/* BEGIN DEV TESTING CODE  */

		var mockEpisode = function (epId) {
			// FOR DEV TESTING
			modelSvc.cache("episode", {
				"_id": epId,
				"created_at": "2014-04-10T02:02:15Z",
				"description": "The Business Case for Sustainability",
				"master_asset_id": "masterasset",
				"title": "Test Episode",
				"status": "Published",
				"templateUrl": "templates/episode/episode.html",
				"styles": [
					"typographySwiss", "", ""
				]
			});
			modelSvc.cache("asset", {
				"_id": "masterasset",
				"_type": "Asset::Video",
				"alternate_urls": [
					"https://www.youtube.com/watch?v=dTAAsCNK7RA&list=RDHCffYp01sXKH8",
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
				"description": "Scene <b>description</b> Description",
				"keywords": [],
				"start_time": 0,
				"end_time": 200,
				"type": "Scene",
				"episode_id": epId,
				//"templateUrl": "templates/scene/centered.html",
				"layouts": ["", ""],
				"styles": ["transitionSlideL"]
			};

			var scenetemplateurls = [
				"templates/scene/1col.html",
				"templates/scene/1col.html",
				"templates/scene/2colL.html",
				"templates/scene/2colR.html",
				"templates/scene/centered.html",
				"templates/scene/cornerH.html"
			];

			for (var i = 0; i < 10; i++) {
				var scene = angular.copy(sceneStub);
				scene._id = "scene-" + i;
				scene.title = (i / 2 === Math.floor(i / 2)) ? "Scene " + (i + 1) + " Title" : "";
				scene.title = "Scene " + (i + 1) + " Title <b>html<sup>included</sup></b>";
				scene.start_time = (i * 20);
				scene.end_time = (i * 20 + 20);
				scene.templateUrl = scenetemplateurls[i % scenetemplateurls.length];
				modelSvc.cache("event", scene);
			}

			var annotationStub = {
				"_id": "",
				"_type": "Annotation",
				"annotation": "Transcript text: <b>html</b> included!",
				"annotation_image_id": "asset3",
				"annotator": "Speaker Name",
				"cosmetic": false,
				"episode_id": epId,
				"required": false,
				"stop": false,
				"type": "Annotation",
				"templateUrl": "templates/item/transcript-withthumbnail.html",
				"styles": ["colorInvert"]
			};

			var testLayouts = [
				"sidebarR",
				"burstR", "burstR",
				"inline",
				"burstR", "sidebarR",
				"inline", "sidebarR",
				"inline", "inline"
			];

			var annotationTemplates = [
				"templates/item/text-h1.html",
				"templates/item/pullquote.html",
				"templates/item/text-h2.html"
			];

			for (i = 0; i < 30; i++) {
				var transcript = angular.copy(annotationStub);
				transcript._id = "transcript-" + i;
				transcript.annotation = "Transcript block number " + (i + 1);
				transcript.start_time = (i * 5);
				transcript.end_time = (i * 5 + 5);
				transcript.layouts = [testLayouts[i % testLayouts.length]];
				modelSvc.cache("event", transcript);
			}
			for (i = 0; i < 10; i++) {
				var annotation = angular.copy(annotationStub);
				annotation._id = "annotation-" + i;
				annotation.start_time = i * 6;
				annotation.end_time = i * 6 + 3;
				annotation.templateUrl = annotationTemplates[i % annotationTemplates.length];
				modelSvc.cache("event", annotation);
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
				"url": "https://luminarydigitalmedia.com",
				"title": "Link Title",
				"description": "Link Description <i>lorem</i> ipsum dolor frog a frog oh lord it's amet lorem ipsum buddy lorem ipsum dolor frog a frog oh lord it's amet lorem ipsum buddy lorem ipsum dolor frog a frog oh lord it's amet lorem ipsum buddy",
				"cosmetic": false,
				"stop": false,
				"type": "Link",
				"episode_id": epId,
				"templateUrl": "templates/item/link.html",
				"layouts": ["inline"],
				"styles": [""],
				"isContent": true,
			};

			for (i = 0; i < 30; i++) {
				var link = angular.copy(linkStub);
				link._id = "link-" + i;
				link.required = (Math.random() > 0.5);
				link.start_time = i * 3;
				link.end_time = i * 3 + 3;

				link.layouts = [testLayouts[i % testLayouts.length]];

				// if (Math.random() > 0.1) {
				// 	link.title = "NO EMBED link";
				// 	link.templateUrl = "templates/transmedia-link-noembed.html";
				// } else if (Math.random() < 0.1) {
				// 	link.title = "FRAMEICIDE link";
				// 	link.templateUrl = "templates/transmedia-link-frameicide.html";
				// }
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
				"templateUrl": "templates/item/image-thumbnail.html",
				"styles": [
					"transitionFade", "tl"
				],
				"layouts": [
					"inline"
				]
			};
			for (i = 0; i < 30; i++) {
				var upload = angular.copy(uploadStub);
				upload._id = "upload-" + i;
				upload.asset_id = "asset" + (i % 3 + 2);
				upload.title = "Upload number " + (i % 3 + 1);
				upload.start_time = i * 4;
				upload.end_time = i * 4 + 4;
				modelSvc.cache("event", upload);
			}

			var layouts = ["windowFg", "mainFg", "altFg", "videoOverlay"];
			for (i = 0; i < 8; i++) {
				var filltest = angular.copy(uploadStub);
				filltest.layouts = [layouts[i % layouts.length]];
				filltest._id = "filltest-" + i;
				filltest.asset_id = "asset2";
				filltest.start_time = i * 2;
				filltest.end_time = i * 2 + 2;
				filltest.templateUrl = "templates/item/image-fill.html";
				filltest.styles.push("cover");
				modelSvc.cache("event", filltest);

			}

			modelSvc.resolveEpisodeEvents(epId);
			modelSvc.resolveEpisodeAssets(epId);
		};

		/* END DEV TESTING CODE */

		return svc;
	});
