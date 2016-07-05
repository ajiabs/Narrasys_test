'use strict';
/* For admin screen episode list */
ittContainer.$inject = ['$timeout', '$location', '$route', 'appState', 'modelSvc', 'recursionHelper', 'dataSvc'];

export default function ittContainer($timeout, $location, $route, appState, modelSvc, recursionHelper, dataSvc) {
	return {
		restrict: 'A',
		replace: false,
		scope: {
			container: '=ittContainer',
			depth: "=depth"
		},
		templateUrl: "templates/container.html",

		compile: function (element) {

			// Use the compile function from the recursionHelper,
			// And return the linking function(s) which it returns
			return recursionHelper.compile(element, function (scope) {
				scope.appState = appState;
				scope.containers = modelSvc.containers;
				scope.customer = modelSvc.customers[scope.container.customer_id];

				// TEMP obviously
				scope.isDemoServer = ($location.host().match(/demo|localhost|api-dev|client.dev/));

				scope.selectText = function (event) {
					event.target.select(); // convenience for selecting the episode url
				};

				scope.containerTypes = ["customer", "course", "session", "episode"];
				scope.toggleChildren = function () {
					if (scope.container.children || scope.container.episodes.length) {
						// have already loaded kids
						scope.container.showChildren = !scope.container.showChildren;
					} else {
						dataSvc.getContainer(scope.container._id).then(function (id) {
							scope.container = modelSvc.containers[id];
							scope.container.showChildren = true;
						});
					}
				};

				scope.renameContainer = function () {
					console.log("CHanging container name from ", scope.container.name.en, " to ", scope.container.newContainerName);
					console.log(scope.container);

					var newContainer = {};
					angular.forEach(["_id", "customer_id", "episodes", "keywords", "parent_id", "sort_order"], function (field) {
						newContainer[field] = angular.copy(scope.container[field]);
					});
					newContainer.name = {
						en: scope.container.newContainerName
					};
					dataSvc.updateContainer(newContainer).then(function () {
						scope.container.editingContainer = false;
					});
				};

				scope.addContainer = function () {
					var newContainer = {
						"customer_id": scope.container.customer_id,
						"parent_id": scope.container._id,
						"name": {
							en: angular.copy(scope.container.newContainerTitle)
						}
					};
					dataSvc.createContainer(newContainer).then(function (newContainer) {
						console.log("Created container:", newContainer);
						if (scope.depth === 2) {
							var newEpisode = {
								"container_id": newContainer._id,
								"title": angular.copy(newContainer.name)
							};
							dataSvc.getCommon().then(function () {
								dataSvc.createEpisode(newEpisode).then(function (episode) {
									console.log("Created episode: ", episode);
									var newScene = {
										"_type": "Scene",
										"title": {},
										"description": {},
										"templateUrl": "templates/scene/1col.html",
										"start_time": 0,
										"end_time": 0,
										"episode_id": episode._id
									};

									dataSvc.storeItem(newScene);
								});
							});
						}
					});
					scope.container.newContainerTitle = '';
					scope.container.addingContainer = false;
				};

				scope.deleteEpisodeAndContainer = function (id) {
					var containerToDelete = modelSvc.containers[id];

					// Optimistically delete the container from modelSvc.containers[containerToDelete.parent_id].children
					// TODO This really ought to be a dataSvc thing, and shouldn't assume success
					// (but the worst that happens is that something appears to be deleted when it wasn't, until next reload. Could be worse)
					// console.log("About to delete", containerToDelete);

					var parentId = (containerToDelete.parent_id) ? containerToDelete.parent_id : containerToDelete.ancestry.replace(/.*\//, '');

					var parent = modelSvc.containers[parentId];
					// console.log("parent is ", parent);
					var newChildren = [];
					angular.forEach(parent.children, function (child) {
						if (child._id !== id) {
							newChildren.push(child);
						}
					});
					parent.children = newChildren;

					if (containerToDelete.episodes.length) {
						dataSvc.deleteEpisode(containerToDelete.episodes[0]) // Containers only ever have one episode for now (not sure why, but sticking to it as it seems to work)
							.then(function () {
								$timeout(function () { // I am being lazy and not bothering to figure out why .then isn't sufficient here
									dataSvc.deleteContainer(containerToDelete._id);
								}, 250);
							});
					} else {
						dataSvc.deleteContainer(containerToDelete._id);
					}

				};

			});
		}
	};

}
