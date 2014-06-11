'use strict';

/*
  Data service handles the retrieval and aggregation of all the data required to show
  a complete episode in the player. Data service can run against local data or api data,
  based on value of config.localData.
*/
/* 
TODO: Refactor this class to utilize $http and/or $resource level caching, and just
make the requests every time. This way it can be used like a real service class and nobody
has to worry about calling get() before getAssetById() for example. It will all be async,
but just implement the promise api for consumers to use the service in a familiar way.
Service will then be capable of full crud, and can flush appropriate caches in the underlying
$http/$resources when POST/PUT methods are called.
*/

angular.module('com.inthetelling.player')
	.factory('dataSvc', function(config, $route, $location, $http, $q, _, $rootScope) {

		// Cache all the data returned from dataSvc.get(). This data will be used for all the
		// individual lookup methods like dataSvc.getAssetById(). Currently these individual
		// lookup methods are synchronous and do not use the apis or write to the cache.
		var data;

		var svc = {};

		svc.roles = []; // HACK FOR NOW
		var userHasRole = function(role) {
			for (var i = 0; i < svc.roles.length; i++) {
				if (svc.roles[i] === role) {
					return true;
				}
			}
			return false;
		};

		// Retrieve and cache the full set of data required to display an episode. Method is async and
		// will get data either from a local .json file or from apis.
		svc.get = function(routeParams, callback, errback) {

			var episodeId = routeParams.epId;
			var authKey = routeParams.authKey;

			// new up an empty data object
			data = {};
			data.assets = []; // we keep getting bogus concat errors

			// Local Data
			if (config.localData || authKey === 'local') {
				// console.log("dataSvc.get() [Mode: Local Data]");
				$http({
					method: 'GET',
					url: config.localDataBaseUrl + '/' + episodeId + '.json'
				})
					.success(function(data, status, headers, config) {
						callback(data);
					})
					.error(function(data, status, headers, config) {
						errback(data);
					});
			}
			// API Data
			else {
				authenticate(routeParams).then(function() {
					console.log("Authenticate succeeded!");
					svc.batchAPIcalls(routeParams, callback, errback);
				});
			}
		};

		var authenticate = function(routeParams) {
			var defer = $q.defer();

			if (routeParams.key) {
				// explicit key in route:
				var nonce = routeParams.key;
				$location.search('key', null); // hide the param from the url.  reloadOnSearch must be turned off in $routeProvider!
				getAccessToken(nonce).then(function() {
					defer.resolve();
				});
			} else if ($http.defaults.headers.common.Authorization) {
				// already logged in!
				defer.resolve();
			} else {
				// check for token in localStorage, try it to see if it's still valid.
				if (localStorage && localStorage.storyAuth) {
					var storedData = angular.fromJson(localStorage.storyAuth);
					console.log("Getting access from stored token", storedData);
					$http.defaults.headers.common.Authorization = 'Token token="' + storedData.access_token + '"';
					defer.resolve();
				} else {
					// start from scratch
					getNonce().then(function(nonce) {
						getAccessToken(nonce).then(function() {
							defer.resolve();
						});
					});
				}
			}
			return defer.promise;
		};

		var getNonce = function() {
			var defer = $q.defer();
			$http.get(config.apiDataBaseUrl + "/v1/get_nonce")
				.success(function(data, status) {
					console.log("get_nonce succeeded: ", data.nonce, status);
					defer.resolve(data.nonce);
				})
				.error(function(data, status) {
					console.error("get_nonce failed:", data, status);
					$rootScope.$emit("error", {
						"message": "Authentication failed (get_nonce: " + (data.error || data) + ")"
					});
					defer.reject();
				});
			return defer.promise;
		};

		var getAccessToken = function(nonce) {
			console.log("trying getAccessToken with nonce ", nonce);
			var defer = $q.defer();
			$http.get(config.apiDataBaseUrl + "/v1/get_access_token/" + nonce)
				.success(function(data, status) {
					var authToken = data.access_token;
					svc.roles = data.roles; // TODO: do something useful with roles
					console.log("Roles received:", svc.roles);
					// Set auth header.  TODO: same for put? delete?
					$http.defaults.headers.common.Authorization = 'Token token="' + authToken + '"';
					defer.resolve(data);
				})
				.error(function(data, status) {
					console.error("get_access_token failed:", data, status);
					$rootScope.$emit("error", {
						"message": "Authentication failed (get_access_token: " + data.error || data + ")"
					});
					defer.reject();
				});
			return defer.promise;
		};

		// retrieves the episode data from the API. Call only through svc.get
		svc.batchAPIcalls = function(routeParams, callback, errback) {
			var episodeId = routeParams.epId;
			var authKey = routeParams.authKey;

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

			// first set of calls
			var firstSet = $http.get(config.apiDataBaseUrl + '/v1/episodes/' + episodeId)
				.then(function(response) {
					data.episode = response.data;
					console.log(response.config.url + ":", response.data);
					if (response.data.status !== "Published" && !userHasRole("admin")) {
						$rootScope.$emit("error", {
							"message": "This episode has not yet been published.",
							"details": ""
						});
						return false;
					}
					return $q.all([
						$http.get(config.apiDataBaseUrl + '/v1/containers/' + response.data.container_id + '/assets'),
						$http.get(config.apiDataBaseUrl + '/v1/containers/' + response.data.container_id)
					]);
				})
				.then(function(responses) {
					console.log(responses[0].config.url + ":", responses[0].data);
					console.log(responses[1].config.url + ":", responses[1].data);
					if (responses[0].data && responses[0].data.files) {
						data.assets = responses[0].data.files;
					}
					return $q.all([
						$http.get(config.apiDataBaseUrl + '/v1/containers/' + responses[1].data[0].parent_id + '/assets'),
						$http.get(config.apiDataBaseUrl + '/v1/containers/' + responses[1].data[0].parent_id)
					]);
				})
				.then(function(responses) {
					console.log(responses[0].config.url + ":", responses[0].data);
					console.log(responses[1].config.url + ":", responses[1].data);
					if (responses[0].data && responses[0].data.files) {
						data.assets = data.assets.concat(responses[0].data.files);
					}
					return $http.get(config.apiDataBaseUrl + '/v1/containers/' + responses[1].data[0].parent_id + '/assets');
				})
				.then(function(response) {
					console.log(response.config.url + ":", response.data);
					if (response.data && response.data.files) {
						data.assets = data.assets.concat(response.data.files);
					}
				});

			// second set of calls
			var secondSet = $q.all([
				$http.get(config.apiDataBaseUrl + '/v2/episodes/' + episodeId + '/events'),
				$http.get(config.apiDataBaseUrl + '/v1/templates'),
				$http.get(config.apiDataBaseUrl + '/v1/layouts'),
				$http.get(config.apiDataBaseUrl + '/v1/styles')
			])
				.then(function(responses) {
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
				.then(function(responses) {
					// success
					// console.log("Compiled API Data:", data);

					//// DIRTY PREPROCESSING HACK ////
					// TODO: Remove it when api updates the type field to be lowercase
					for (var i = 0; i < data.events.length; i++) {
						data.events[i].type = data.events[i].type.toLowerCase();
						data.events[i]._type = data.events[i]._type.toLowerCase();
					}
					///////////////////
					callback(data);
				}, function(responses) {
					// error
					errback(responses);
				});
		};

		// Retrieve the data for an asset based on its id. Method is synchronous and will scan the data cache,
		// returning undefined if the item is not found.
		svc.getAssetById = function(id) {
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
		svc.getTemplateById = function(id) {
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
		svc.getLayoutById = function(id) {
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
		svc.getStyleById = function(id) {
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
		console.log("datasvc", svc);
		return svc;
	});
