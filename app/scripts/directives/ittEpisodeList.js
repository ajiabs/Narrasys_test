'use strict';

angular.module('com.inthetelling.story')
	.directive('ittEpisodeList', function (dataSvc, modelSvc) {
		return {
			restrict: 'A',
			replace: true,
			controller: 'EpisodeListController',

			link: function (scope) {

				console.log("ittEpisodeList");
				scope.loading = true;
				scope.containers = modelSvc.containers;

				dataSvc.getContainerRoot().then(function (rootIDs) {
					scope.root = {
						children: []
					};
					angular.forEach(rootIDs, function (id) {
						modelSvc.containers[id].showChildren = true;
						scope.root.children.push(modelSvc.containers[id]);
					});
					scope.loading = false;
				});

			}
		};
	});

/*
				scope.getContainerData = function (container) {
					console.log("GET CONTAINER: ", container);
					if (container.children) {
						container.visible = !container.visible;
					} else {
						dataSvc.getSingleContainer(container._id).then(function (id) {
							container = modelSvc.containers[id];
							container.visible = true;
							console.log("...", container);
						});
					}
				};
			}
		};
	});
*/
