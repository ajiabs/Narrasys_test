'use strict';

// TODO: load and resolve categories

// Cache here is for things we never need to expose to the rest of the app (style, layout, template IDs)
// the rest gets passed to modelSvc

//  use PUT to update, POST to create new   
// for assets, DELETE then POST
// to store -- must wrap events in 'event: {}'  same for other things?  template didn't seem to need it

angular.module('com.inthetelling.story')
	.factory('dataSvc', function ($q, $http, $routeParams, $timeout, $rootScope, config, authSvc, appState, modelSvc, errorSvc, mockSvc, questionAnswersSvc) {
		var svc = {};

		/* ------------------------------------------------------------------------------ */

		svc.getNarrative = function (narrativeId) {
			return GET("/v3/narratives/" + narrativeId + "/resolve", function (data) {
				modelSvc.cache("narrative", svc.resolveIDs(data));
				return modelSvc.narratives[data._id];
			});
		};

		svc.getNarrativeOverview = function (narrativeId) {
			return GET("/v3/narratives/" + narrativeId);
		};

		var cachedPurchases = false;
		svc.getUserNarratives = function (userId) {
			if (cachedPurchases) {
				var defer = $q.defer();
				defer.resolve(cachedPurchases);
				return defer.promise;
			} else {
				return GET("/v3/users/" + userId + "/narrative_purchases", function (data) {
					cachedPurchases = data;
					return data;
				});

			}
		};

		svc.getCustomerList = function () {
			if (!authSvc.userHasRole('admin')) {
				return false;
			}
			console.log("getCustomerList");
			return GET("/v3/customers/", function (customers) {
				angular.forEach(customers, function (customer) {
					modelSvc.cache("customer", customer);
				});
				return customers;
			});

		};

		svc.getCustomer = function (customerId) {
			if (!authSvc.userHasRole('admin')) {
				return false;
			}
			if (modelSvc.customers[customerId]) {
				// have it already, or at least already getting it
				return;
			} else {
				// cache a stub:
				modelSvc.cache("customer", {
					_id: customerId
				});
				GET("/v3/customers/" + customerId, function (customer) {
					modelSvc.cache("customer", customer); // the real thing
				});
			}
		};

		// getEpisode just needs to retrieve all episode data from the API, and pass it on
		// to modelSvc.  No promises needed, let the $digest do the work
		svc.getEpisode = function (epId, segmentId) {
			if (!epId) {
				throw ("no episode ID supplied to dataSvc.getEpisode");
			}
			if (modelSvc.episodes[epId]) {
				console.log("have episode: ", modelSvc.episodes[epId]);
				return; // already requested
			}
			modelSvc.cache("episode", {
				_id: epId
			}); // init with empty object to be filled by asynch process

			if ($routeParams.local) {
				mockSvc.mockEpisode(epId);
				$rootScope.$emit("dataSvc.getEpisodeEvents.done");
			} else {
				authSvc.authenticate()
					.then(function () {
						return getCommon();
					})
					.then(function () {
						return getEpisode(epId, segmentId);
					});
			}
		};
		svc.getEpisodeOverview = function (epId) {
			return GET("/v3/episodes/" + epId);
		};

		svc.getEpisodeOverview = function (epId) {
			return GET("/v3/episodes/" + epId);
		};
		svc.getNarrativeList = function () {
			return GET("/v3/narratives/");
		};

		svc.createUserGroup = function (groupName) {
			return POST("/v3/groups", {
				"group": {
					"name": groupName
				}
			});
		};

		svc.createNarrative = function (narrativeData) {
			delete narrativeData.templateUrl;
			return POST("/v3/narratives", narrativeData);
		};
		svc.updateNarrative = function (narrativeData) {
			delete narrativeData.templateUrl;
			return PUT("/v3/narratives/" + narrativeData._id, narrativeData);
		};

		svc.createChildEpisode = function (childData) {
			console.log("about to create child epsiode", childData);
			return POST("/v3/episodes", {
				"episode": childData
			});
		};

		svc.createEpisodeSegment = function (narrativeId, segmentData) {
			return POST("/v3/timelines/" + narrativeId + "/episode_segments", segmentData);
		};

		svc.storeTimeline = function (narrativeId, timeline) {
			console.log("About to store timeline", timeline);
			if (timeline._id) {
				return PUT("/v3/timelines/" + timeline._id, timeline, function (ret) {
					// TEMPORARY until api stops doing this
					if (typeof ret.name === 'string') {
						ret.name = {
							en: ret.name
						};
					}
					if (typeof ret.description === 'string') {
						ret.description = {
							en: ret.description
						};
					}
					return ret;
				});
			} else {
				return POST("/v3/narratives/" + narrativeId + "/timelines", timeline, function (ret) {
					// TEMPORARY until api stops doing this
					if (typeof ret.name === 'string') {
						ret.name = {
							en: ret.name
						};
					}
					if (typeof ret.description === 'string') {
						ret.description = {
							en: ret.description
						};
					}
					return ret;
				});
			}
		};

		svc.getSingleAsset = function (assetId) {
			return GET("/v1/assets/" + assetId);
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
			// console.log("dataSvc.getCommon");
			if (gettingCommon) {
				return getCommonDefer.promise;

			} else {
				gettingCommon = true;
				$q.all([
						$http.get(config.apiDataBaseUrl + '/v1/templates'),
						$http.get(config.apiDataBaseUrl + '/v1/layouts'),
						$http.get(config.apiDataBaseUrl + '/v1/styles')
					])
					.then(function (responses) {
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

			// temporary:
			if (obj.everyone_group && !obj.template_id) {
				obj.templateUrl = "templates/narrative/default.html";
			}

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
		var getEpisode = function (epId, segmentId) {

			// The url and return data differ depending on whether we're getting a (resolved) segment or a normal episode:

			var url = (segmentId) ? "/v3/episode_segments/" + segmentId + "/resolve" : "/v3/episodes/" + epId;
			$http.get(config.apiDataBaseUrl + url)
				.success(function (ret) {

					var episodeData = {};
					if (ret) {
						episodeData = (ret.episode ? ret.episode : ret); // segment has the episode data in ret.episode; that's all we care about at this point
					}
					if (episodeData.status === "Published" || authSvc.userHasRole("admin")) {
						modelSvc.cache("episode", svc.resolveIDs(episodeData));
						// Get episode events
						getEpisodeEvents(epId, segmentId);
						svc.getContainer(episodeData.container_id, epId);
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

		var getEpisodeEvents = function (epId, segmentId) {
			var endpoint = (segmentId) ? "/v3/episode_segments/" + segmentId + "/events" : "/v3/episodes/" + epId + "/events";

			$http.get(config.apiDataBaseUrl + endpoint)
				.success(function (events) {
					getEventActivityDataForUser(events, "Plugin", epId);
					angular.forEach(events, function (eventData) {
						eventData.cur_episode_id = epId; // So the player doesn't need to care whether it's a child or parent episode
						modelSvc.cache("event", svc.resolveIDs(eventData));
					});
					// Tell modelSvc it can build episode->scene->item child arrays
					modelSvc.resolveEpisodeEvents(epId);
					$rootScope.$emit("dataSvc.getEpisodeEvents.done");
				});
		};

		var getEventActivityDataForUser = function (events, activityType, epId) {
			angular.forEach(events, function (eventData) {
				if (eventData.type === "Plugin") {
					(function (evData) {
						questionAnswersSvc.getUserAnswer(evData._id, appState.user._id)
							.then(function (userAnswer) {
								evData.data._plugin.hasBeenAnswered = true;
								var i = 0;
								var angularContinue = true;
								angular.forEach(evData.data._plugin.distractors, function (distractor) {
									if (angularContinue) {
										if (distractor.text === userAnswer.data.answer) {
											distractor.selected = true;
											evData.data._plugin.selectedDistractor = i;
											angularContinue = false;
										}
										i++;
									}
								});
								modelSvc.cache("event", svc.resolveIDs(evData));
							});
					}(eventData));
				}
			});
			modelSvc.resolveEpisodeEvents(epId);
		};

		svc.getContainer = function (containerId, episodeId) {
			// used by episode load currently, probably want to phase this out in favor of getSingleContainer or else merge them

			// iterates to all parent containers
			// episode ID is included so we can trigger it to resolve when this is all complete

			// Also (wastefully) requests episode status on all children, so we can do interepisode nav

			if (!modelSvc.containers[containerId]) {
				modelSvc.cache("container", {
					"_id": containerId
				});
			}

			$http.get(config.apiDataBaseUrl + "/v3/containers/" + containerId)
				.success(function (containers) {
					modelSvc.cache("container", containers[0]);

					svc.getCustomer(containers[0].customer_id);

					// ensure container children refers to modelSvc cache:
					var container = modelSvc.containers[containers[0]._id];
					if (container.children) {
						for (var i = 0; i < container.children.length; i++) {
							container.children[i] = modelSvc.containers[container.children[i]._id];
						}

						// QUICK HACK to get episode title and status for inter-episode nav; stuffing it into the container data
						// Wasteful of API calls, discards useful data
						angular.forEach(container.children, function (child) {
							if (child.episodes[0]) {
								svc.getEpisodeOverview(child.episodes[0]).then(function (overview) {
									if (overview) {
										child.status = overview.status;
										child.title = overview.title; // name == container, title == episode
										modelSvc.cache("container", child); // trigger setLang
									} else {
										// This shouldn't ever happen, but apparently it does.
										// (Is this a permissions error? adding warning to help track it down)
										console.error("Got no episode data for ", child.episodes[0]);
									}
								});
							}
						});
					}

					// iterate to parent container
					if (container.parent_id) {
						svc.getContainer(container.parent_id, episodeId);
					} else {
						// all parent containers now loaded:
						if (episodeId) {
							modelSvc.resolveEpisodeContainers(episodeId);
						}
					}
				});
			svc.getContainerAssets(containerId, episodeId);
		};

		svc.getContainerAssets = function (containerId, episodeId) {
			$http.get(config.apiDataBaseUrl + "/v1/containers/" + containerId + "/assets")
				.success(function (containerAssets) {
					// console.log("container assets", containerAssets);
					modelSvc.containers[containerId].assetsHaveLoaded = true;
					angular.forEach(containerAssets.files, function (asset) {
						modelSvc.cache("asset", asset);
					});
					// this might be better as an $emit:
					if (episodeId) {
						modelSvc.resolveEpisodeAssets(episodeId);
					}
				});
		};

		/* ------------------------------------------------------------------------------ */

		// PRODUCER
		// a different idiom here, let's see if this is easier to conceptualize.

		// to use GET(), pass in the API endpoint, and an optional callback for post-processing of the results
		var GET = function (path, postprocessCallback) {
			// console.log("GET", path);
			var defer = $q.defer();
			authSvc.authenticate().then(function () {
				$http.get(config.apiDataBaseUrl + path).then(function (response) {
					var ret = response.data;
					if (postprocessCallback) {
						ret = postprocessCallback(ret);
					}
					return defer.resolve(ret);
				});
			});
			return defer.promise;
		};

		var PUT = function (path, putData, postprocessCallback) {
			var defer = $q.defer();
			$http({
					method: 'PUT',
					url: config.apiDataBaseUrl + path,
					data: putData
				})
				.success(function (response) {
					var ret = response;
					if (postprocessCallback) {
						ret = postprocessCallback(ret);
					}
					defer.resolve(ret);
				});
			return defer.promise;
		};

		var POST = function (path, postData, postprocessCallback) {
			var defer = $q.defer();
			$http({
					method: 'POST',
					url: config.apiDataBaseUrl + path,
					data: postData
				})
				.success(function (response) {
					var ret = response;
					if (postprocessCallback) {
						ret = postprocessCallback(ret);
					}
					defer.resolve(ret);
				});
			return defer.promise;
		};

		var DELETE = function (path) {
			var defer = $q.defer();
			$http({
					method: 'DELETE',
					url: config.apiDataBaseUrl + path,
				})
				.success(function (data) {
					// console.log("Deleted:", data);
					return defer.resolve(data);
				});
			return defer.promise;
		};

		/*
		Circumstances in which we need containers:
		- start at root, climb down on demand
		- start at episode, need all ancestors

		loading any container should
		- cache its own (complete) data
		- cache its (incomplete) children
		load all of its ancestors if not already present (datasvc will need to keep a list of container_ids it's already requested, to avoid circular refs to modelSvc)

		*/

		svc.getContainerRoot = function () {
			// This is only used by episodelist.  Loads root container, returns a list of root-level container IDs
			return GET("/v3/containers", function (containers) {
				var customerIDs = [];
				angular.forEach(containers, function (customer) {
					// cache the customer data:
					modelSvc.cache("container", customer);
					customerIDs.push(customer._id);
				});
				return customerIDs;
			});
		};
		svc.getSingleContainer = function (id) {
			console.log("getSingleContainer", id);
			return GET("/v3/containers/" + id, function (containers) {
				modelSvc.cache("container", containers[0]);
				var container = modelSvc.containers[containers[0]._id];

				// Ensure container.children refers to items in modelSvc cache:
				if (container.children) {
					for (var i = 0; i < container.children.length; i++) {
						container.children[i] = modelSvc.containers[container.children[i]._id];
					}

					// QUICK HACK to get episode status for inter-episode nav; stuffing it into the container data
					// Wasteful of API calls, discards useful data
					angular.forEach(container.children, function (child) {
						if (child.episodes[0]) {
							svc.getEpisodeOverview(child.episodes[0]).then(function (overview) {
								if (overview) {
									child.status = overview.status;
									child.title = overview.title; // name == container, title == episode
									modelSvc.cache("container", child); // trigger setLang
								} else {
									// This shouldn't ever happen, but apparently it does.
									// (Is this a permissions error? adding warning to help track it down)
									console.error("Got no episode data for ", child.episodes[0]);
								}
							});
						}
					});
				}
				return containers[0]._id;
			});

		};

		svc.createContainer = function (container) {
			var createContainerDefer = $q.defer();

			// TODO sanitize
			var newContainer = {
				container: {
					customer_id: container.customer_id,
					name: container.name,
					parent_id: container.parent_id
						// keywords: [] // for now
				}
			};
			// store in API and resolve with results instead of container

			POST("/v3/containers", newContainer)
				.then(function (data) {
					// console.log("CREATED CONTAINER", data);
					modelSvc.cache("container", data);

					var parentId;
					if (data.parent_id) {
						parentId = data.parent_id;
					} else {
						parentId = data.ancestry.replace(/.*\//, '');
					}

					// add it to the parent's child list (WARN I'm mucking around in modelSvc inappropriately here I think)
					modelSvc.containers[parentId].children.push(modelSvc.containers[data._id]);

					createContainerDefer.resolve(data);
				});
			return createContainerDefer.promise;
		};

		svc.deleteContainer = function (containerId) {
			// DANGER WILL ROBINSON incomplete and unsafe.  only for deleting test data for now, don't expose this to the production team.

			// TODO  this will error out if there are assets or child containers attached to the container...
			// definitely it will if there's a child episode. 

			delete modelSvc.containers[containerId]; // WARN this assumes success......

			return DELETE("/v3/containers/" + containerId);
		};

		svc.createEpisode = function (episode) {
			var createEpisodeDefer = $q.defer();
			// TODO store in API and resolve with results instead of episode

			console.log("Attempting to create ", episode);
			POST("/v3/episodes", episode)
				.then(function (data) {
					console.log("Created episode: ", data);

					// muck around in modelSvc.containers again:
					modelSvc.containers[data.container_id].episodes = [data._id];
					createEpisodeDefer.resolve(data);
				});
			return createEpisodeDefer.promise;
		};

		svc.deleteEpisode = function (episodeId) {
			// DANGER WILL ROBINSON this is both incomplete and unsafe; I've built just enough to remove some of my own test data. Do not include this in any UI that is available to the production team 
			// First remove episode_user_metrics

			// probably first need to remove events etc if there are any
			var deleteEpisodeDefer = $q.defer();
			// delete episode_user_metrics
			GET("/v2/episodes/" + episodeId + "/episode_user_metrics")
				.then(function (metrics) {
					console.log("GOT METRICS: ", metrics);
					if (metrics.length) {
						var deleteMetricsActions = [];

						for (var i = 0; i < metrics.length; i++) {
							deleteMetricsActions.push(DELETE("/v2/episode_user_metrics/" + metrics[i]._id));
						}
						$q.all(deleteMetricsActions)
							.then(function () {
								DELETE("/v3/episodes/" + episodeId);
								deleteEpisodeDefer.resolve();
							});
					} else {
						DELETE("/v3/episodes/" + episodeId);
						deleteEpisodeDefer.resolve();
					}
				});
			return deleteEpisodeDefer.promise;
		};

		svc.deleteItem = function (evtId) {
			return DELETE("/v3/events/" + evtId);
		};
		svc.createAsset = function (containerId, asset) {
			var createAssetDefer = $q.defer();
			console.log("Attempting to create asset ", asset);
			asset.container_id = containerId;
			if (asset._id && asset._id.match(/internal/)) {
				delete asset._id;
			}
			POST("/v1/containers/" + containerId + "/assets", asset)
				.then(function (data) {
					console.log("Created asset: ", data);
					var dataActual = data.file;
					modelSvc.containers[dataActual.container_id].episodes = [dataActual._id];
					createAssetDefer.resolve(data);
					modelSvc.cache("asset", dataActual);
					//modelSvc.resolveEpisodeAssets(episodeId);
				});
			return createAssetDefer.promise;
		};

		svc.deleteAsset = function (assetId) {
			return DELETE("/v1/assets/" + assetId);
		};

		// TODO need safety checking here
		svc.storeItem = function (evt) {
			evt = prepItemForStorage(evt);
			if (!evt) {
				return false;
			}
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
			// Events, that is
			var prepped = {};
			if (evt._id && evt._id.match(/internal/)) {
				delete evt._id;
			}

			//  The data we want to store:
			var fields = [
				"_id",
				"producerItemType",
				"start_time",
				"end_time",
				"episode_id",
				"template_id",
				"templateUrl",
				"stop",
				"sxs",
				"title",
				"url",
				"annotator",
				"annotation",
				"description",
				"data",
				"asset_id",
				"link_image_id",
				"annotation_image_id",
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
				prepped.template_id = reverseTemplateUpdate(evt.templateUrl);
			}
			if (prepped.template_id) {
				return prepped;
			} else {
				errorSvc.error({
					data: "Tried to store a template with no ID: " + evt.templateUrl
				});
				return false;
			}
		};
		svc.prepItemForStorage = prepItemForStorage;
		svc.detachMasterAsset = function (epData) {
			var preppedData = prepEpisodeForStorage(epData);
			preppedData.master_asset_id = null;
			console.log("prepped sans master_asset_id for storage:", preppedData);
			if (preppedData) {
				return PUT("/v3/episodes/" + preppedData._id, preppedData);
			} else {
				return false;
			}
		};
		svc.storeEpisode = function (epData) {
			// For now only update, no create... create needs a customer_id and probably other data as well
			var preppedData = prepEpisodeForStorage(epData);
			console.log("prepped for storage:", preppedData);
			if (preppedData) {
				return PUT("/v3/episodes/" + preppedData._id, preppedData);
			} else {
				return false;
			}
			// 	// update
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

			var fields = [
				"_id",
				"title",
				"description",
				"container_id",
				"customer_id",
				"master_asset_id",
				"status",
				"languages",
				"navigation_depth" // (0 for no cross-episode nav, 1 for siblings only, 2 for course and session, 3 for customer/course/session)
			];

			for (var i = 0; i < fields.length; i++) {
				if (epData[fields[i]] || epData[fields[i]] === 0) {
					prepped[fields[i]] = angular.copy(epData[fields[i]]);
				}
			}

			prepped.style_id = get_id_values("style", epData.styles);

			var template = svc.readCache("template", "url", epData.templateUrl);
			if (template) {
				prepped.template_id = template.id;
			} else {
				prepped.template_id = reverseTemplateUpdate(epData.templateUrl);
			}
			if (prepped.template_id) {
				return prepped;
			} else {
				errorSvc.error({
					data: "Tried to store a template with no ID: " + epData.templateUrl
				});
				return false;
			}
		};

		var reverseTemplateUpdate = function (templateUrl) {
			// HACK: this reverses the template versioning done in modelSvc
			// TODO: can I just talk bill into letting me store templateUrls directly and skip the whole ID business?
			var reverseTemplates = {
				// episodes
				"templates/episode/episode.html": "templates/episode-default.html",
				"templates/episode/eliterate.html": "templates/episode-eliterate.html",
				"templates/episode/ewb.html": "templates/episode-ewb.html",
				"templates/episode/gw.html": "templates/episode-gw.html",
				"templates/episode/purdue.html": "templates/episode-purdue.html",
				"templates/episode/story.html": "templates/episode-tellingstory.html",

				// annotation
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

				//question
				"templates/item/question-mc-formative.html": "templates/question-mc-formative.html",
				"templates/item/question-mc-poll.html": "templates/question-mc-poll.html",

				"templates/item/question-mc.html": "templates/question-mc.html",
				"templates/item/question-mc-image-left.html": "templates/question-mc-image-left.html",
				"templates/item/question-mc-image-right.html": "templates/question-mc-image-right.html",

				"templates/item/sxs-question.html": "templates/sxs-question.html"
			};
			if (reverseTemplates[templateUrl]) {
				var template = svc.readCache("template", "url", reverseTemplates[templateUrl]);
				return template.id;
			} else {
				return false;
			}
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
			// console.log("DataSvc:", svc);
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
