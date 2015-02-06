'use strict';

angular.module('com.inthetelling.story')
	.directive('ittUser', function (authSvc, appState) {
		return {
			restrict: 'A',
			replace: true,
			scope: {

			},
			templateUrl: 'templates/user.html',

			link: function (scope) {

				scope.loading = true;

				authSvc.authenticate().then(function () {
					scope.user = appState.user;
				});

			}
		};
	});
