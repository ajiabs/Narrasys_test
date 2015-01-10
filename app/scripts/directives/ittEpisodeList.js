'use strict';

angular.module('com.inthetelling.story')
	.directive('ittEpisodeList', function ($location, $timeout, appState, authSvc, dataSvc, modelSvc) {
		return {
			restrict: 'A',
			replace: true,

			link: function (scope) {
				if (!authSvc.userHasRole('admin')) {
					console.log(appState.user, authSvc.userHasRole('admin'));
					$location.path('/');
				}

				scope.logout = function () {
					authSvc.logout();
					$location.path('/');
				};

				scope.appState = appState;

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
