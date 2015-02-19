'use strict';

angular.module('com.inthetelling.story')
	.directive('ittEpisodeList', function ($location, $timeout, appState, authSvc, dataSvc, modelSvc) {
		return {
			restrict: 'A',
			replace: true,

			link: function (scope) {
				scope.logout = function () {
					authSvc.logout();
				};
				scope.appState = appState;
				scope.loading = true;
				scope.containers = modelSvc.containers;
				scope.userHasRole = authSvc.userHasRole;
				dataSvc.getCustomerList();
				dataSvc.getContainerRoot().then(function (rootIDs) {
					scope.root = {
						children: []
					};
					angular.forEach(rootIDs, function (id) {
						modelSvc.containers[id].showChildren = true;
						scope.root.children.push(modelSvc.containers[id]);
					});
					scope.loading = false;
				}, function () {
					scope.failedLogin = true;
					scope.loading = false;

				});

			}
		};
	});
