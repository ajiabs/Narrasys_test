'use strict';

angular.module('com.inthetelling.story')
	.controller('EpisodeListController', function ($scope, $timeout, config, dataSvc, authSvc) {

		$scope.loading = true;
		dataSvc.getAllContainers().then(function (data) {

			$scope.containers = data; // TODO this should be cached in modelSvc instead of used directly
			$scope.loading = false;

			$scope.userHasRole = function (role) {
				return authSvc.userHasRole(role);
			};

			$scope.loginTo = function (epId) {
				console.log("EPID: ", epId);
				localStorage.removeItem(config.localStorageKey);
				window.open(config.apiDataBaseUrl + "/oauth2?episode=" + epId);

			};

			$scope.addEpisode = function (session) {
				console.log("Add episode ", session);

				var newEpisodeContainer = {
					"customer_id": session.customer_id,
					"parent_id": session._id,
					"name": {
						en: session.newEpisodeTitle
					}
				};

				dataSvc.createContainer(newEpisodeContainer).then(function (container) {
					console.log("Created container:", container);
					var newEpisode = {
						"container_id": container._id,
						"title": {
							en: session.newEpisodeTitle
						}
					};
					dataSvc.createEpisode(newEpisode).then(function (episode) {
						console.log("Created episode: ", episode);
						// add both to $scope.containers
						container.episodes = [episode._id];
						session.children.push(container);
						// reset form for next
						session.newEpisodeTitle = undefined;
						session.addingEpisode = undefined;

					});

				});
			};

			var treeSearch = function (data, id, callback) {
				if (data._id === id) {
					callback(data);
				}
				angular.forEach(data.children, function (child) {
					treeSearch(child, id, callback);
				});
			};

			$scope.deleteEpisodeAndContainer = function (container) {
				// TODO confirm first!
				// delete episode, then delete container
				// TODO Eventually should block this if there are events in the episode, or child containers, etc
				// (serverside does enforce this, but so should we)

				console.log("About to delete", container);
				// Must first delete the contained episode:
				if (container.episodes.length) {
					dataSvc.deleteEpisode(container.episodes[0]) // Containers only ever have one episode for now (not sure why, but sticking to it as it seems to work)
						.then(function () {
							$timeout(function () { // I am being lazy and not bothering to figure out why .then isn't sufficient here
								dataSvc.deleteContainer(container._id);
							}, 250);
						});
				} else {
					dataSvc.deleteContainer(container._id);
				}
				// delete child episode and the container itself from the api:

				// update the UI: find the parent container in $scope and remove the deleted container from its children array:
				// TODO this would be easier if we were working from modelSvc.containers instead of a full tree
				angular.forEach($scope.containers, function (customer) {
					treeSearch(customer, container.parent_id, function (parent) {
						var keepChildren = [];
						for (var i = 0; i < parent.children.length; i++) {
							if (parent.children[i]._id !== container._id) {
								keepChildren.push(parent.children[i]);
							}
						}
						parent.children = keepChildren;
					});
				});
			};
		});
	});
