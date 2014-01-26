'use strict';

/*
	Data service handles the retrieval and aggregation of all the data required to show
	a complete episode in the player. Data service can run against local data or api data,
	based on value of config.localData.
*/
// TODO: Refactor this class to utilize $http and/or $resource level caching, and just
// make the requests every time. This way it can be used like a real service class and nobody
// has to worry about calling get() before getAssetById() for example. It will all be async,
// but just implement the promise api for consumers to use the service in a familiar way.
// Service will then be capable of full crud, and can flush appropriate caches in the underlying
// $http/$resources when POST/PUT methods are called.
angular.module('com.inthetelling.player')
	.factory('dataSvc', function (config, $route, $location, $http, $q, _) {

		// Cache all the data returned from dataSvc.get(). This data will be used for all the
		// individual lookup methods like dataSvc.getAssetById(). Currently these individual
		// lookup methods are synchronous and do not use the apis or write to the cache.
		var data = {};

		var svc = {};

		// Retrieve and cache the full set of data required to display an episode. Method is async and
		// will get data either from a local .json file or from apis.
		svc.get = function (routeParams, callback, errback) {

			// the only two currently valid route parameters are episodeId (required) and authKey (optional)
			var params = {episodeId: routeParams.epId,authKey: routeParams.authKey};

			// Local Data
			if (config.localData) {
				svc.getLocalData(data,params,callback,errback);
			} else {
				svc.getRemoteData(data,params,callback,errback);
			}
		};
		
		
		// Retrieve episode data from local JSON file:
		svc.getLocalData = function(data,params,callback,errback) {
			console.log("dataSvc.get() [Mode: local data]");
				$http({
					method: 'GET',
					url: config.localDataBaseUrl + '/' + params.episodeId + '.json'
				})
					.success(function (data, status, headers, config) {
						callback(data);
					})
					.error(function (data, status, headers, config) {
						errback(data);
					});
		};
		
		// Retrieve episode data from API:
		svc.getRemoteData = function(data,params,callback,errback) {
			console.log("dataSvc.get() [Mode: API Data]");
				// TODO: Retry on api errors before rejecting a promise.

				/*
				API Flow:
				/v1/episodes/<episode_id>
					/v1/containers/<resp.container_id>/assets
					/v1/containers/<resp.container_id>
						/v1/containers/<resp.parent_id>/assets
						/v1/containers/<resp.parent_id>
							/v1/containers/<resp.parent_id>/assets
				/v2/episodes/<episode_id>/events
				/v1/templates
				/v1/layouts
				/v1/styles
				TODO: GEt event categories also, they will eventually be used in the player
			*/

				// if there's an API token in the config, use it in a header; otherwise pass access_token as a url param.
				var authParam = "";
				if (config.apiAuthToken) {
					$http.defaults.headers.get = {
						'Authorization': config.apiAuthToken
					};
				} else {
					authParam = (params.authKey) ? "?access_token=" + params.authKey : "";
				}

				// TODO: group both 'call stacks' into another $q with a single then that returns the data

				// first set of calls
				var firstSet = $http.get(config.apiDataBaseUrl + '/v1/episodes/' + params.episodeId + authParam)
					.success(function() {
						console.log("success");
					})
					.error(function(data,status,headers,config) {
						// Ajax call failed.
						// Instead of dying right away, try falling back to local data:
						console.log("First ajax call failed; going to try falling back to local data before dying.",config);
						config.localData=true;
						svc.getLocalData(data,params,callback,errback);
					})
					.then(function (response) {
						data.episode = response.data;
						//console.log(response.config.url + ":", response.data);
						return $q.all([
							$http.get(config.apiDataBaseUrl + '/v1/containers/' + response.data.container_id + '/assets' + authParam),
							$http.get(config.apiDataBaseUrl + '/v1/containers/' + response.data.container_id + authParam)
						]);
					})
					.then(function (responses) {
						data.assets = responses[0].data.files;
						//console.log(responses[0].config.url + ":", responses[0].data);
						//console.log(responses[1].config.url + ":", responses[1].data);
						return $q.all([
							$http.get(config.apiDataBaseUrl + '/v1/containers/' + responses[1].data[0].parent_id + '/assets' + authParam),
							$http.get(config.apiDataBaseUrl + '/v1/containers/' + responses[1].data[0].parent_id + authParam)
						]);
					})
					.then(function (responses) {
						data.assets = data.assets.concat(responses[0].data.files);
						//console.log(responses[0].config.url + ":", responses[0].data);
						//console.log(responses[1].config.url + ":", responses[1].data);
						return $http.get(config.apiDataBaseUrl + '/v1/containers/' + responses[1].data[0].parent_id + '/assets' + authParam);
					})
					.then(function (response) {
						data.assets = data.assets.concat(response.data.files);
						//console.log(response.config.url + ":", response.data);
					});

				// second set of calls
				var secondSet = $q.all([
					$http.get(config.apiDataBaseUrl + '/v2/episodes/' + params.episodeId + '/events' + authParam),
					$http.get(config.apiDataBaseUrl + '/v1/templates' + authParam),
					$http.get(config.apiDataBaseUrl + '/v1/layouts' + authParam),
					$http.get(config.apiDataBaseUrl + '/v1/styles' + authParam)
				])
					.then(function (responses) {
						data.events = responses[0].data;
						data.templates = responses[1].data;
						data.layouts = responses[2].data;
						data.styles = responses[3].data;
					});

				// completion
				$q.all([
					firstSet,
					secondSet
				])
					.then(function (responses) {
						//				console.log("Compiled API Data:", data);

						//// DIRTY PREPROCESSING HACK ////
						// TODO: Remove it when api updates the type field to be lowercase
						for (var i = 0; i < data.events.length; i++) {
							data.events[i].type = data.events[i].type.toLowerCase();
							data.events[i]._type = data.events[i]._type.toLowerCase();
						}
						///////////////////

						callback(data);


/* IE8 doesn't do "catch"... jeez louise 
					}).catch(function (response) {
					// AJAX failed.
					// Try falling back to localData:
					if (!config.localData) {
						console.warn("Couldn't load episode, falling back to local data");
						config.localData = true;
						$route.reload();
					} else {
						$location.path('/error');
					}
*/
				});


		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		};
		

		// Retrieve the data for an asset based on its id. Method is synchronous and will scan the data cache,
		// returning undefined if the item is not found.
		svc.getAssetById = function (id) {
			if (!_.isArray(data.assets)) {
				return;
			}
			var i;
			for (i = 0; i < data.assets.length; i++) {
				if (data.assets[i]._id === id) {
					return data.assets[i];
				}
			}
		};

		// Retrieve the data for a template based on its id. Method is synchronous and will scan the data cache,
		// returning undefined if the item is not found.
		svc.getTemplateById = function (id) {
			if (!_.isArray(data.templates)) {
				return;
			}
			var i;
			for (i = 0; i < data.templates.length; i++) {
				if (data.templates[i]._id === id) {
					return data.templates[i];
				}
			}
		};

		// Retrieve the data for a layout based on its id. Method is synchronous and will scan the data cache,
		// returning undefined if the item is not found.
		svc.getLayoutById = function (id) {
			if (!_.isArray(data.layouts)) {
				return;
			}
			var i;
			for (i = 0; i < data.layouts.length; i++) {
				if (data.layouts[i]._id === id) {
					return data.layouts[i];
				}
			}
		};

		// Retrieve the data for a style based on its id. Method is synchronous and will scan the data cache,
		// returning undefined if the item is not found.
		svc.getStyleById = function (id) {
			if (!_.isArray(data.styles)) {
				return;
			}
			var i;
			for (i = 0; i < data.styles.length; i++) {
				if (data.styles[i]._id === id) {
					return data.styles[i];
				}
			}
		};

		return svc;
	});
