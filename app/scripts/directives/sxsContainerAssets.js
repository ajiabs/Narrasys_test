'use strict';

angular.module('com.inthetelling.story')
	.controller("ContainerAssetsTestController", function ($scope, $routeParams) {
		$scope.containerId = $routeParams.containerId;
	})
	/* WARN I badly misnamed this; it's used in  producer.  TODO eliminate the sxs prefix, it never made sense anyway */
	.directive('sxsContainerAssets', function ($routeParams, $rootScope, recursionHelper, dataSvc, modelSvc, awsSvc, appState, authSvc, MIMES, ittUtils) {
		return {
			restrict: 'A',
			replace: false,
			scope: {
				containerId: "=sxsContainerAssets",
				//for filtering by mimeType when uploading assest
				mimesUp: '@?',
			},
			templateUrl: 'templates/producer/container-assets.html',
			compile: function (element) {
				// Use the compile function from the recursionHelper,
				// And return the linking function(s) which it returns
				return recursionHelper.compile(element, function (scope) {
					scope.appState = appState;

					if (modelSvc.containers[scope.containerId]) {
						// console.log("Container already loaded");
						scope.container = modelSvc.containers[scope.containerId];
						if (!scope.container.assetsHaveLoaded) {
							// console.log("Assets had not loaded, getting them");
							dataSvc.getContainerAssets(scope.containerId);
						}
					} else {
						// console.log("Getting container");
						dataSvc.getContainer(scope.containerId).then(function () {
							// console.log("Getting assets");
							scope.container = modelSvc.containers[scope.containerId];
							dataSvc.getContainerAssets(scope.containerId);
						});
					}

					scope.canAccess = authSvc.userHasRole('admin') || authSvc.userHasRole('customer admin');
					scope.isCustAdmin = authSvc.userHasRole('customer admin');

					if (MIMES[scope.mimesUp]) {
						scope.mimes = MIMES[scope.mimesUp];
						if (authSvc.userHasRole('admin')) {
							scope.mimes += ',video/*';
						}
					} else {
						scope.mimes = MIMES.default;
					}


					scope.assets = modelSvc.assets; // this is going to be a horrible performance hit isn't it.  TODO: build asset array inside each container in modelSvc instead?
					scope.uploadStatus = [];
					scope.up = function () {
						scope.showParent = true;
					};

					scope.readMimesDown = function() {
						return scope.mimesDown;
					};

					scope.toggleImages = function () {
						scope.onlyImages = !scope.onlyImages;
					};
					scope.toggleGrid = function () {
						scope.gridView = !scope.gridView;
					};

					scope.assetClick = function (asset) {
						//only attempt to filter if supplied a list to filter against
						if (ittUtils.existy(appState.mimesDown)) {
							var mimesArr = appState.mimesDown.split(',');
							var disallow = ittUtils.filterMimeTypes([asset], mimesArr);

							if (disallow.continue) {
								$rootScope.$emit("UserSelectedAsset", asset._id);
								scope.mainAssetMimeError = null;
								appState.mimesDown = null;
							} else {
								scope.mainAssetMimeError = disallow.fType + ' cannot be used as the master asset.';
							}
						} else {
							$rootScope.$emit("UserSelectedAsset", asset._id);
						}
					};

					scope.uploadAsset = function (fileInput) {
						var files = fileInput.files;
						//Start the upload status out at 0 so that the
						//progress bar renders correctly at first
						scope.uploadStatus[0] = {
							"bytesSent": 0,
							"bytesTotal": 1
						};
						scope.uploads = awsSvc.uploadContainerFiles(scope.containerId, files);
						scope.uploads[0].then(function (data) {
							modelSvc.cache("asset", data.file);
							fileInput.value = '';
							delete scope.uploads;
						}, function (data) {
							console.log("FAIL", data);
						}, function (update) {
							scope.uploadStatus[0] = update;
						});
					};
				});
			}
		};
	});
