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
.factory('dataSvc', function (config, $http, $q, _) {
	
	// Cache all the data returned from dataSvc.get(). This data will be used for all the
	// individual lookup methods like dataSvc.getAssetById(). Currently these individual
	// lookup methods are synchronous and do not use the apis or write to the cache.
	var data = {};

	var svc = {};

	// Retrieve and cache the full set of data required to display an episode. Method is async and
	// will get data either from a local .json file or from apis.
	svc.get = function(episodeId, callback, errback) {

		// key the stored data by episode id
		data[episodeId] = {};

		// Local Data
		if (config.localData) {
			console.log("dataSvc.get() [Mode: Local Data]");
			$http({method: 'GET', url: config.localDataBaseUrl + '/' + episodeId + '.json'})
			.success(function(data, status, headers, config) {
				callback(data);
			})
			.error(function(data, status, headers, config) {
				errback(data);
			});
		}
		// API Data
		else {
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

			// TODO: Only necessary until auth tokens are implemented
			$http.defaults.headers.get = {
				'Authorization': 'Token token="c7624368e407355eb587500862322413"'
			};

			// TODO: group both 'call stacks' into another $q with a single then that returns the data

			// first set of calls
			var firstSet = $http.get(config.apiDataBaseUrl + '/v1/episodes/' + episodeId)
			.then(function(response) {
				data[episodeId].episode = response.data;
				return $q.all([
					$http.get(config.apiDataBaseUrl + '/v1/containers/' + response.data.container_id + '/assets'),
					$http.get(config.apiDataBaseUrl + '/v1/containers/' + response.data.container_id)
				]);
			})
			.then(function(responses) {
				data[episodeId].assets = responses[0].data.files;
				return $q.all([
					$http.get(config.apiDataBaseUrl + '/v1/containers/' + responses[1].data[0].parent_id + '/assets'),
					$http.get(config.apiDataBaseUrl + '/v1/containers/' + responses[1].data[0].parent_id)
				]);
			})
			.then(function(responses) {
				data[episodeId].assets.concat(responses[0].data.files);
				return $http.get(config.apiDataBaseUrl + '/v1/containers/' + responses[1].data[0].parent_id + '/assets');
			})
			.then(function(response) {
				data[episodeId].assets.concat(response.data.files);
			});

			// second set of calls
			var secondSet = $q.all([
				$http.get(config.apiDataBaseUrl + '/v2/episodes/' + episodeId + '/events'),
				$http.get(config.apiDataBaseUrl + '/v1/templates'),
				$http.get(config.apiDataBaseUrl + '/v1/layouts'),
				$http.get(config.apiDataBaseUrl + '/v1/styles')
			])
			.then(function(responses) {
				data[episodeId].events = responses[0].data;
				data[episodeId].templates = responses[1].data;
				data[episodeId].layouts = responses[2].data;
				data[episodeId].styles = responses[3].data;
			});
			
			// completion
			$q.all([
				firstSet,
				secondSet
			])
			.then(function(responses) {
				console.log("Compiled API Data:", data[episodeId]);
				//callback(data[episodeId]);
			});
			
		}

	};

	// Retrieve the data for an asset based on its id. Method is synchronous and will scan the data cache,
	// returning undefined if the item is not found.
	svc.getAssetById = function(id, episodeId) {
		if (!_.isArray("data[episodeId].assets")) { return; }
		var i;
		for (i=0; i < data[episodeId].assets.length; i++) {
			if (data[episodeId].assets[i]._id === id) {
				return data[episodeId].assets[i];
			}
		}
	};

	// Retrieve the data for a template based on its id. Method is synchronous and will scan the data cache,
	// returning undefined if the item is not found.
	svc.getTemplateById = function(id, episodeId) {
		if (!_.isArray("data[episodeId].templates")) { return; }
		var i;
		for (i=0; i < data[episodeId].templates.length; i++) {
			if (data[episodeId].templates[i]._id === id) {
				return data[episodeId].templates[i];
			}
		}
	};

	// Retrieve the data for a layout based on its id. Method is synchronous and will scan the data cache,
	// returning undefined if the item is not found.
	svc.getLayoutById = function(id, episodeId) {
		if (!_.isArray("data[episodeId].layouts")) { return; }
		var i;
		for (i=0; i < data[episodeId].layouts.length; i++) {
			if (data[episodeId].layouts[i]._id === id) {
				return data[episodeId].layouts[i];
			}
		}
	};

	// Retrieve the data for a style based on its id. Method is synchronous and will scan the data cache,
	// returning undefined if the item is not found.
	svc.getStyleById = function(id, episodeId) {
		if (!_.isArray("data[episodeId].styles")) { return; }
		var i;
		for (i=0; i < data[episodeId].styles.length; i++) {
			if (data[episodeId].styles[i]._id === id) {
				return data[episodeId].styles[i];
			}
		}
	};

	return svc;
});
