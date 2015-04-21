'use strict';

//Explicit, composable, and side-effect free data retrieval. Data is returned, via a promise, when done. No dependency on modelSvc.
// dataMgr will contain some logic that is related to data... but for now very thin. 
// Eventually this would be a good place to do the data adapting stuff like "resolve".
//  and strive to make modelSvc more dumb... unless modelSvc becomes a facade for this. 
//TODO: consider separation of domains if this gets thick
angular.module('com.inthetelling.story')
	.factory('dataMgr', function ($q, $routeParams, $timeout, $rootScope, config, authSvc, errorSvc, EpisodeSegmentExpanded, Event, Container, Asset) {
		var svc = {};

		var isContainers = function (items) {
			if (typeof items[0] !== 'undefined' && items[0] !== null) {
				if (items[0].parent_id !== undefined && items[0].customer_id !== undefined) {
					return true;
				} else {
					return false;
				}
			}
			return false;
		};
// this duplicates dataSvc.getEpisode except it returns a promose of data instead of setting in modelSvc. 
		// the intent is that this is reusable/composable with no side-effects.  setting modelSvc should happen elsewhere.
	svc.getEpisodeExpandedByEpisodeId = function (episodeId) {
			var defer = $q.defer();
			var expandedData = [];
			svc.getEpisodeById(episodeId)
				.then(function (data) {
					expandedData.push(data);
					data.expanded = {};
					//get the rest of the data... i.e. containers, and... more
					//and set in modelSvc
					var allDone = $q.all([svc.getEventsByEpisodeId(episodeId), svc.getContainerAndAncestors(data.container_id, data._id)]);
					allDone.then(function (allData) {
						expandedData.concat(allData);
						var assetPromises = [];
						for (var i = 0, len = allData.length; i < len; i++) {
							if (isContainers(allData[i])) {
								var containers = allData[i];
								data.expanded.containers = containers;
								for (var y = 0, length = containers.length; y < length; y++) {
									assetPromises.push(svc.getAssetsByContainerId(containers[y]._id));
								}
								break;
							} else {
								//events
								data.expanded.events = allData[i];
							}
						}
						if (assetPromises.length > 0) {
							$q.all(assetPromises)
								.then(function (assetsData) {
									//flatten
									var assets = assetsData.reduce(function (a, b) {
										return a.concat(b);
									});
									data.expanded.assets = assets;
									defer.resolve(data);
								});
						} else {
							defer.resolve(data);
						}
					});
				});
			return defer.promise;
		};


		svc.getEpisodeSegmentExpandedBySegmentId = function (segmentId) {
			var defer = $q.defer();
			var expandedData = [];
			svc.getEpisodeBySegmentId(segmentId)
				.then(function (data) {
					expandedData.push(data);
					data.expanded = {};
					//get the rest of the data... i.e. containers, and... more
					//and set in modelSvc
					var allDone = $q.all([svc.getEventsBySegmentId(segmentId), svc.getContainerAndAncestors(data.episode.container_id, data.episode._id)]);
					allDone.then(function (allData) {
						expandedData.concat(allData);
						var assetPromises = [];
						for (var i = 0, len = allData.length; i < len; i++) {
							if (isContainers(allData[i])) {
								var containers = allData[i];
								data.expanded.containers = containers;
								for (var y = 0, length = containers.length; y < length; y++) {
									assetPromises.push(svc.getAssetsByContainerId(containers[y]._id));
								}
								break;
							} else {
								//events
								data.expanded.events = allData[i];
							}
						}
						if (assetPromises.length > 0) {
							$q.all(assetPromises)
								.then(function (assetsData) {
									//flatten
									var assets = assetsData.reduce(function (a, b) {
										return a.concat(b);
									});
									data.expanded.assets = assets;
									defer.resolve(data);
								});
						} else {
							defer.resolve(data);
						}
					});
				});
			return defer.promise;
		};


		svc.getEpisodeByEpisodeId = function (episodeId) {
			var defer = $q.defer();
			authSvc.authenticate()
				.then(function () {
					EpisodeExpanded.get({
							episodeId: episodeId
						})
						.$promise.then(function (data) {
							defer.resolve(data);
						});
				});
			return defer.promise;
		};

		svc.getEpisodeBySegmentId = function (episodeSegmentId) {
			var defer = $q.defer();
			authSvc.authenticate()
				.then(function () {
					EpisodeSegmentExpanded.get({
							segmentId: episodeSegmentId
						})
						.$promise.then(function (data) {
							defer.resolve(data);
						});
				});
			return defer.promise;
		};
		svc.getEventsBySegmentId = function (episodeSegmentId) {
			var defer = $q.defer();
			authSvc.authenticate()
				.then(function () {
					Event.getSegmentEvents({
							segmentId: episodeSegmentId
						})
						.$promise.then(function (data) {
							defer.resolve(data);
						});
				});
			return defer.promise;
		};
		svc.getEventsByEpisodeId = function (episodeId) {
			var defer = $q.defer();
			authSvc.authenticate()
				.then(function () {
					Event.getEpisodeEvents({
							episodeId: episodeId
						})
						.$promise.then(function (data) {
							defer.resolve(data);
						});
				});
			return defer.promise;
		};
		svc.getContainer = function (containerId) {
			var defer = $q.defer();
			authSvc.authenticate()
				.then(function () {
					Container.get({
							containerId: containerId
						})
						.$promise.then(function (data) {
							if (data && data.length > 0) {
								defer.resolve(data[0]);
							} else {
								defer.reject(data);
							}
						});
				});
			return defer.promise;
		};

		svc.getContainerAndAncestors = function (containerId, episodeId, containers, promise) {
			var defer = promise || $q.defer();
			var results = containers || [];
			authSvc.authenticate()
				.then(function () {
					svc.getContainer(containerId, episodeId)
						.then(function (containerData) {
							results.push(containerData);
							if (containerData.parent_id) {
								svc.getContainerAndAncestors(containerData.parent_id, episodeId, results, defer);
							} else {
								defer.resolve(results);
							}
						});
				});
			return defer.promise;
		};
		svc.getAssetsByContainerId = function (containerId) {
			var defer = $q.defer();
			authSvc.authenticate()
				.then(function () {
					Asset.getAll({
							containerId: containerId
						})
						.$promise.then(function (data) {
							defer.resolve(data.files);
						});
				});
			return defer.promise;
		};
		return svc;
	});
