'use strict';

angular.module('com.inthetelling.story')
	.directive('ittEpisodeList', function () {
		return {
			restrict: 'A',
			replace: true,
			controller: ['$scope', '$location', '$timeout', 'appState', 'authSvc', 'dataSvc', 'modelSvc',
				function ($scope, $location, $timeout, appState, authSvc, dataSvc, modelSvc) {
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

						if ($scope.lastClickedContainer != null && $scope.lastClickedContainer.depth === 3) {
							$scope.lastClickedContainer.container.showChildren = false;
						}
						$scope.lastClickedContainer = $container;
					}

			}]
		};
	});
