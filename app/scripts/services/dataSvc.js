'use strict';


// TESTING:
// badge event is 53a1d2162442bd24f9000004
// m/c event is 539a0d182442bd86f1000004

// badge template ID is 53a1d0672442bd95b1000002
// m/c template id is 539a07ee2442bd20bf000006


// TODO: load and resolve categories

// Cache here is for things we never need to expose to the rest of the app (style, layout, template IDs)
// the rest gets passed to modelSvc

//  use PUT to update, POST to create new   
// for assets, DELETE then POST
// Wrap events in event: {}   same for other things?  template didn't seem to need it


angular.module('com.inthetelling.story')
	.factory('dataSvc', function($q, $http, $routeParams, $timeout, config, authSvc, modelSvc, errorSvc) {
		var svc = {};

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
				// console.log("LOCAL DATA");
				// mockEpisode(epId);
			} else {
				authSvc.authenticate()
					.then(function() {
						// console.log("auth succeeded");
						getCommon().then(function() {
							// console.log("getCommon succeeded");
							getEpisode(epId);
						}, function(err) {
							// console.error("getCommon failed: ", err);
						});
					}, function(err) {
						// console.error("Authentication error: ", err);
					});
			}
		};

		var dataCache = {
			template: {},
			layout: {},
			style: {}
		};
		console.log("dataSvc cache: ", dataCache);

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
					// console.error("getCommon failed", failure);
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
					errorSvc.error({data: "Couldn't get templateUrl for id " + obj.template_id});
				}
			}
			if (obj.layout_id) {
				var layouts = [];
				angular.forEach(obj.layout_id, function(id) {
					if (dataCache.layout[id]) {
						layouts.push(dataCache.layout[id].css);
					} else {
						errorSvc.error({data: "Couldn't get layout for id " + id});
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
						errorSvc.error({data: "Couldn't get style for id " + id});
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

					// console.log("episode: ", episodeData);
					if (episodeData.status === "Published" || authSvc.userHasRole("admin")) {

						modelSvc.cache("episode", resolveIDs(episodeData));
						// Get episode events
						getEpisodeEvents(epId);

						// this will get the episode container and its assets, then iterate up the chain to all parent containers
						getContainer(episodeData.container_id, epId);
					} else {
						errorSvc.error({data: "This episode has not yet been published."});
					}
				})
				.error(function(data, status, headers, config) {
					errorSvc.error({data: "API call to /v1/episodes/" + epId + " failed (bad episode ID?)"});
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
				});

			$http.get(config.apiDataBaseUrl + "/v1/containers/" + containerId + "/assets")
				.success(function(containerAssets) {
					// console.log("container assets", containerAssets);
					angular.forEach(containerAssets.files, function(asset) {
						modelSvc.cache("asset", asset);
					});
					modelSvc.resolveEpisodeAssets(episodeId);
				});
		};



		return svc;
	});
