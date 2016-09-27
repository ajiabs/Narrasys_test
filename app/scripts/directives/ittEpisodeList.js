'use strict';

angular.module('com.inthetelling.story')
	.directive('ittEpisodeList', function () {
		return {
			restrict: 'A',
			replace: true,
			controller: ['$scope', '$location', '$timeout', 'appState', 'authSvc', 'dataSvc', 'modelSvc', 'ittUtils',
				function ($scope, $location, $timeout, appState, authSvc, dataSvc, modelSvc, ittUtils) {
					$scope.logout = function () {
						authSvc.logout();
					};
					$scope.appState = appState;
					$scope.loading = true;
					$scope.containers = modelSvc.containers;
					$scope.userHasRole = authSvc.userHasRole;
					dataSvc.getCustomerList();
					dataSvc.getContainerRoot().then(function (rootIDs) {
						$scope.root = {
							children: []
						};
						angular.forEach(rootIDs, function (id) {
							// modelSvc.containers[id].showChildren = true;
							$scope.root.children.push(modelSvc.containers[id]);
						});

						$scope.loading = false;
					}, function () {
						$scope.failedLogin = true;
						$scope.loading = false;

					});


					$scope.onContainerClick = onContainerClick;
					function onContainerClick ($container) {

						if ($container.container.children && (!$container.container.showChildren || $container.bool === false)) {
							// have already loaded kids
							$container.container.showChildren = !$container.container.showChildren;
						} else {
							dataSvc.getContainer($container.container._id).then(function (id) {
								$container.container = modelSvc.containers[id];
								$container.container.showChildren = true;
							});
						}

						if ($container.bool === true) {
							if (ittUtils.existy($scope.lastClickedContainer)) {


								if ($scope.lastClickedContainer.container !== $container.container) {
									$scope.lastClickedContainer.container.isActive = false;
									$scope.lastClickedContainer = $container;
									$scope.lastClickedContainer.container.isActive = true;
								} else {
									$scope.lastClickedContainer.container.isActive = !$scope.lastClickedContainer.container.isActive;
								}

							} else {
								$scope.lastClickedContainer = $container;
								$scope.lastClickedContainer.container.isActive = true;
							}
						}

					}

			}]
		};
	});
