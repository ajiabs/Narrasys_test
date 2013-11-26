'use strict';

/*
	Data service handles the retrieval and aggregation of all the data required to show
	a complete episode in the player. Data service can run against local data or api data,
	based on value of config.localData.
*/
angular.module('com.inthetelling.player')
.factory('dataSvc', function (config, $http, $q) {
	
	// Cache all the data returned from dataSvc.get(). This data will be used for all the
	// individual lookup methods like dataSvc.getAssetById(). Currently these individual
	// lookup methods are synchronous and do not use the apis or write to the cache.
	var data = {};

	var svc = {};

	// Retrieve and cache the full set of data required to display an episode. Method is async and
	// will get data either from a local .json file or from apis.
	svc.get = function(episodeId, callback, errback) {

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
			*/
			var firstStackComplete = false,
				secondStackComplete = false,
				returnData = function() {
					if (firstStackComplete && secondStackComplete) {
						console.log("Compiled API Data:", data[episodeId]);
						//callback(data[episodeId]);
					}
				};

			// common headers
			var hdrs = {
				'Content-Type': 'application/json',
				'Authorization': 'Token token="c7624368e407355eb587500862322413"'
			};

			// TODO: group both 'call stacks' into another $q with a single then that returns the data

			// first call stack
			$http({method:'GET', headers:hdrs, data:'', url:config.apiDataBaseUrl + '/v1/episodes/' + episodeId})
			.then(function(response) {
				data[episodeId].episode = response.data;
				return $q.all([
					$http({method:'GET', headers:hdrs, data:'', url:config.apiDataBaseUrl + '/v1/containers/' + response.data.container_id + '/assets'}),
					$http({method:'GET', headers:hdrs, data:'', url:config.apiDataBaseUrl + '/v1/containers/' + response.data.container_id})
				]);
			})
			.then(function(responses) {
				data[episodeId].assets = responses[0].data.files;
				return $q.all([
					$http({method:'GET', headers:hdrs, data:'', url:config.apiDataBaseUrl + '/v1/containers/' + responses[1].data[0].parent_id + '/assets'}),
					$http({method:'GET', headers:hdrs, data:'', url:config.apiDataBaseUrl + '/v1/containers/' + responses[1].data[0].parent_id})
				]);
			})
			.then(function(responses) {
				data[episodeId].assets.push(responses[0].data.files);
				return $http({method:'GET', headers:hdrs, data:'', url:config.apiDataBaseUrl + '/v1/containers/' + responses[1].data[0].parent_id + '/assets'});
			})
			.then(function(response) {
				data[episodeId].assets.push(response.data.files);

				firstStackComplete = true;
				returnData();

			});

			// second call stack
			$q.all([
				$http({method:'GET', headers:hdrs, data:'', url:config.apiDataBaseUrl + '/v2/episodes/' + episodeId + '/events'}),
				$http({method:'GET', headers:hdrs, data:'', url:config.apiDataBaseUrl + '/v1/templates'}),
				$http({method:'GET', headers:hdrs, data:'', url:config.apiDataBaseUrl + '/v1/layouts'}),
				$http({method:'GET', headers:hdrs, data:'', url:config.apiDataBaseUrl + '/v1/styles'})
			])
			.then(function(responses) {

				data[episodeId].events = responses[0].data;
				data[episodeId].templates = responses[1].data;
				data[episodeId].layouts = responses[2].data;
				data[episodeId].styles = responses[3].data;

				secondStackComplete = true;
				returnData();

			});

		}

	};

	// Retrieve the data for an asset based on its id. Method is synchronous and will scan all containers
	// in the data cache, returning undefined if the asset is not already cached.
	svc.getAssetById = function(id) {

	};

	return svc;
});
