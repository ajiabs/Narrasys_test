'use strict';

// TODO: load and resolve categories

// Cache here is for things we never need to expose to the rest of the app (style, layout, template IDs)
// the rest gets passed to modelSvc

//  use PUT to update, POST to create new   
// for assets, DELETE then POST
// to store -- must wrap events in 'event: {}'  same for other things?  template didn't seem to need it

angular.module('com.inthetelling.story')
	.factory('dataSvc', function ($q, $http, $routeParams, $timeout, config, authSvc, modelSvc, errorSvc, mockSvc) {
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
				mockSvc.mockEpisode(epId);
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
		svc.resolveIDs = function (obj) {
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
			$http.get(config.apiDataBaseUrl + "/v3/episodes/" + epId)
				.success(function (episodeData) {

					// console.log("episode: ", episodeData);
					if (episodeData.status === "Published" || authSvc.userHasRole("admin")) {

						modelSvc.cache("episode", svc.resolveIDs(episodeData));
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
						data: "API call to /v3/episodes/" + epId + " failed (bad episode ID?)"
					});
				});
		};

		var getEpisodeEvents = function (epId) {
			$http.get(config.apiDataBaseUrl + "/v3/episodes/" + epId + "/events")
				.success(function (events) {
					angular.forEach(events, function (eventData) {
						modelSvc.cache("event", svc.resolveIDs(eventData));
					});
					// Tell modelSvc it can build episode->scene->item child arrays
					modelSvc.resolveEpisodeEvents(epId);
				});
		};

		// gets container and container assets, then iterates to parent container
		var getContainer = function (containerId, episodeId) {

			// TODO check cache first to see if we already have this container!
			// console.log("getContainer", containerId, episodeId);
			$http.get(config.apiDataBaseUrl + "/v3/containers/" + containerId)
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

		// PRODUCER
		// a different idiom here, let's see if this is easier to conceptualize.

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
			}).error(function (errData, status) {
				// console.log("Failed:", errData, status, headers);
				errorSvc.error({
					data: errData,
					status: status
				});

				return defer.reject();
			});
			return defer.promise;
		};

		var POST = function (path, postData) {
			var defer = $q.defer();
			$http({
				method: 'POST',
				url: config.apiDataBaseUrl + path,
				data: postData
			}).success(function (data) {
				console.log("Updated event:", data);
				return defer.resolve(data);
			}).error(function (data, status, headers) {
				console.log("Failed:", data, status, headers);
				return defer.reject();
			});
			return defer.promise;
		};

		var DELETE = function (path) {
			var defer = $q.defer();
			$http({
				method: 'DELETE',
				url: config.apiDataBaseUrl + path,
			}).success(function (data) {
				console.log("Deleted:", data);
				return defer.resolve(data);
			}).error(function (data, status, headers) {
				console.log("Failed to delete:", data, status, headers);
				return defer.reject();
			});
			return defer.promise;
		};

		svc.getAllContainers = function () {
			// This is only used by episodelist; single episodes load containers as needed
			return GET("/v3/containers", function (containers) {

				/* 
				This properly extracts that container data into the cache.  
				We're not really doing much with that cache data yet, though, so disabling it for now.
				TODO episodelist currently works from the raw data instead of the cache; changing that to use the cache
				would let us get proper sorting and i18n

				// step through the tree customer->course->session->episode and cache each separately
				angular.forEach(containers, function (customer) {
					// console.log("Customer", customer.name.en, customer);
					modelSvc.cache("container", {
						_id: customer._id,
						type: "Customer",
						name: angular.copy(customer.name)
					});
					angular.forEach(customer.children, function (course) {
						// console.log("Course", course.name.en, course);
						modelSvc.cache("container", {
							_id: course._id,
							parent_id: course.parent_id,
							type: "Course",
							name: angular.copy(course.name)
						});
						angular.forEach(course.children, function (session) {
							// console.log("Session", session, session.name.en);
							modelSvc.cache("container", {
								_id: session._id,
								parent_id: session.parent_id,
								type: "Session",
								name: angular.copy(session.name)
							});
							angular.forEach(session.children, function (episode) {
								// console.log("Episode", episode, episode.name.en);
								modelSvc.cache("container", {
									_id: episode._id,
									parent_id: episode.parent_id,
									type: "Episode",
									name: angular.copy(episode.name)
								});
							});
						});
					});
				});
				// TODO having elaborately cached each individual container, do something useful with it (convert the IDs into cross-cache references for starters)
				//episodeList interface just uses the raw returned json for now. 

				*/
				return containers;
			});
		};

		svc.deleteItem = function (evtId) {
			return DELETE("/v3/events/" + evtId);
		};

		svc.deleteAsset = function (assetId) {
			return DELETE("/v1/assets/" + assetId);
		};

		// TODO need safety checking here
		svc.storeItem = function (evt) {
			evt = prepItemForStorage(evt);
			if (evt && evt._id && !evt._id.match(/internal/)) {
				// update
				return PUT("/v3/events/" + evt._id, {
					event: evt
				});
			} else {
				// create
				return POST("/v3/episodes/" + evt.episode_id + "/events", {
					event: evt
				});
			}
		};
		var prepItemForStorage = function (evt) {

			var prepped = {};

			if (evt._id && evt._id.match(/internal/)) {
				delete evt._id;
			}

			// this is a conservative list for SXS only, so far. More fields will need to be added here
			var fields = [
				"_id",
				// "_type",
				"start_time",
				"end_time",
				"episode_id",
				"template_id",
				// "templateUrl",
				"stop",
				// "type",
				"isCurrent",
				"sxs",
				"title",
				"url",
				"annotator",
				"annotation",
				"data",
				"asset_id",
				"link_image_id",
				"annotation_image_id"
			];

			prepped.type = evt._type;

			for (var i = 0; i < fields.length; i++) {
				if (evt[fields[i]] || evt[fields[i]] === 0) {
					prepped[fields[i]] = angular.copy(evt[fields[i]]);
				}
			}

			prepped.style_id = [];
			prepped.layout_id = [];

			// convert style/layout selections back into their IDs.
			// trust evt.styles[] and evt.layouts[], DO NOT use styleCss (it contains the scene and episode data too!)
			prepped.style_id = get_id_values("style", evt.styles);
			prepped.layout_id = get_id_values("layout", evt.layouts);

			var template = svc.readCache("template", "url", evt.templateUrl);
			if (template) {
				prepped.template_id = template.id;
			} else {

				// TODO: create the template on the fly, cache it, get its ID, then continue?
				// Or can I just talk bill into letting me store templateUrls directly and skip the whole ID business?

				//For now, reverse the template update done in modelSvc:
				var reverseTemplateUpdate = {
					"templates/item/transcript.html": "templates/transcript-default.html",
					"templates/item/transcript-withthumbnail.html": "templates/transcript-withthumbnail.html",
					"templates/item/transcript-withthumbnail-alt.html": "templates/transcript-withthumbnail-alt.html",
					"templates/item/text-h1.html": "templates/text-h1.html",
					"templates/item/text-h2.html": "templates/text-h2.html",
					"templates/item/pullquote-noattrib.html": "templates/text-pullquote-noattrib.html",
					"templates/item/pullquote.html": "templates/text-pullquote.html",

					// upload
					"templates/item/image.html": "templates/transmedia-image-default.html",
					"templates/item/image-caption.html": "templates/transmedia-caption.html",
					"templates/item/image-caption-sliding.html": "templates/transmedia-slidingcaption.html",
					"templates/item/image-fill.html": "templates/transmedia-image-fill.html",
					"templates/item/image-plain.html": "templates/transmedia-image-plain.html",
					"templates/item/image-linkonly.html": "templates/transmedia-linkonly.html",
					"templates/item/image-thumbnail.html": "templates/transmedia-thumbnail.html",

					//link
					"templates/item/link.html": "templates/transmedia-link-default.html",
					"templates/item/link-embed.html": "templates/transmedia-link-embed.html",

					//scene
					"templates/scene/1col.html": "templates/scene-1col.html",
					"templates/scene/2colL.html": "templates/scene-2colL.html",
					"templates/scene/2colR.html": "templates/scene-2colR.html",
					"templates/scene/centered.html": "templates/scene-centered.html",
					"templates/scene/cornerH.html": "templates/scene-cornerH.html",
					"templates/scene/cornerV.html": "templates/scene-cornerV.html",

				};
				if (reverseTemplateUpdate[evt.templateUrl]) {
					template = svc.readCache("template", "url", reverseTemplateUpdate[evt.templateUrl]);
					prepped.template_id = template.id;
				} else {
					errorSvc.error({
						data: "Tried to store a template with no ID: " + evt.templateUrl
					});
					return false;
				}
			}

			// TODO: what else needs to be done before we can safely store this event?
			console.log("Prepped item for storage: ", prepped);
			return prepped;
		};

		svc.storeEpisode = function (epData) {
			var preppedData = prepEpisodeForStorage(epData);
			console.log("If this were implemented yet, we would be storing this data:", preppedData);
			// if (epData && epData._id && !epData._id.match(/internal/)) {
			// 	// update
			// 	return PUT("/v3/episodes/" + epData.episode_id, epData);
			// } else {
			// 	// create
			// TODO need to determine (at least) the container ID before creating episodes here....
			// 	return POST("/v3/episodes", epData);
			// }
		};

		var prepEpisodeForStorage = function (epData) {
			var prepped = {};
			if (epData._id && epData._id.match(/internal/)) {
				delete epData._id;
			}

			// this is a conservative list for SXS only, so far. More fields will need to be added here
			var fields = [
				"_id",
				"title",
				"container_id",
				"master_asset_id",
				"status",
				"languages",
				"navigation_depth" // TODO (0 for no cross-episode nav, 1 for siblings only, 2 for course and session, etc)
			];

			for (var i = 0; i < fields.length; i++) {
				if (epData[fields[i]] || epData[fields[i]] === 0) {
					prepped[fields[i]] = angular.copy(epData[fields[i]]);
				}
			}

			prepped.style_id = get_id_values("style", epData.styles);
			prepped.layout_id = get_id_values("layout", epData.layouts);

			var template = svc.readCache("template", "url", epData.templateUrl);
			if (template) {
				prepped.template_id = template.id;
			} else {
				errorSvc.error({
					data: "Tried to store an episode template with no ID: " + epData.templateUrl
				});
			}
			return prepped;
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
		if (config.debugInBrowser) {
			console.log("DataSvc:", svc);
			console.log("DataSvc cache:", dataCache);
		}

		var get_id_values = function (cache, realNames) {
			// convert real styles and layouts back into id arrays. Not for templateUrls!
			var ids = [];

			angular.forEach(realNames, function (realName) {
				if (realName) {
					var cachedValue = svc.readCache(cache, "css_name", realName);
					if (cachedValue) {
						ids.push(cachedValue.id);
					} else {
						errorSvc.error({
							data: "Tried to store a " + cache + " with no ID: " + realName
						});
						return false;
					}
				}
			});
			return ids;
		};

		return svc;
	});
