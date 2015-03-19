'use strict';

angular.module('com.inthetelling.story')
	.controller("ContainerAssetsTestController", function ($scope, $routeParams) {
		$scope.containerId = $routeParams.containerId;
	})
	.directive('sxsContainerAssets', function ($routeParams, $rootScope, recursionHelper, dataSvc, modelSvc, awsSvc, appState) {
		return {
			restrict: 'A',
			replace: false,
			scope: {
				containerId: "=sxsContainerAssets"
			},
			templateUrl: 'templates/producer/container-assets.html',

			compile: function (element) {
				// Use the compile function from the recursionHelper,
				// And return the linking function(s) which it returns
				return recursionHelper.compile(element, function (scope) {
					scope.appState = appState;
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

					if (modelSvc.containers[scope.containerId]) {
						scope.container = modelSvc.containers[scope.containerId];
					} else {
						dataSvc.getContainer(scope.containerId).then(function (id) {
							scope.container = modelSvc.containers[scope.containerId];
						});
					}

					scope.assets = modelSvc.assets; // this is going to be a horrible performance hit isn't it.  TODO: build asset array inside each container in modelSvc
					scope.up = function () {
						scope.showParent = true;
					};

					scope.toggleImages = function () {
						scope.onlyImages = !scope.onlyImages;
					};
					scope.toggleGrid = function () {
						scope.gridView = !scope.gridView;
					};

					scope.assetClick = function (assetId) {
						console.log("User clicked on asset ", assetId);
						$rootScope.$emit("UserSelectedAsset", assetId);
					};

					scope.uploadAsset = function (fileInput) {
						var files = fileInput.files;
						scope.uploads = awsSvc.uploadFiles(scope.containerId, files);
						scope.uploads[0].then(function (data) {
							modelSvc.cache("asset", data.file);
							fileInput.value = '';
							delete scope.uploads;
						});

					};
				});
			}
		};
	});
