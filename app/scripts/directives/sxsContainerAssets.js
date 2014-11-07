'use strict';

angular.module('com.inthetelling.story')
	.controller("ContainerAssetsTestController", function ($scope, $routeParams) {
		$scope.containerId = $routeParams.containerId;
	})
	.directive('sxsContainerAssets', function ($routeParams, recursionHelper, dataSvc, modelSvc) {
		return {
			restrict: 'A',
			replace: false,
			scope: {
				containerId: "=sxsContainerAssets"
			},
			templateUrl: '/templates/producer/container-assets.html',

			compile: function (element) {
				// Use the compile function from the recursionHelper,
				// And return the linking function(s) which it returns
				return recursionHelper.compile(element, function (scope) {
					if (!modelSvc.containers[scope.containerId]) {
						dataSvc.getContainer(scope.containerId);
					} else {
						console.log("Already have ", modelSvc.containers[scope.containerId]);
						// Need to ensure the container assets have loaded, too.
						console.log(modelSvc.containers[scope.containerId].assetsHaveLoaded);
						if (!modelSvc.containers[scope.containerId].assetsHaveLoaded) {
							dataSvc.getContainerAssets(scope.containerId);
						}
					}

					scope.container = modelSvc.containers[scope.containerId];
					scope.assets = modelSvc.assets; // this is going to be a horrible performance hit isn't it.  TODO: build asset array inside each container in modelSvc
					scope.up = function () {
						scope.showParent = true;
					};
				});

			}
		};
	});
