'use strict';

angular.module('com.inthetelling.story')
	.directive('ittSearchPanel', function ($timeout, appState) {
		return {
			restrict: 'A',
			replace: true,
			scope: true,
			templateUrl: 'templates/searchpanel.html',
			controller: 'SearchPanelController',
			link: function (scope) {

				// scope.appState = appState;

				// $timeout(function () {
				// console.log("ittSearchPanel", scope);
				scope.indexEvents();
				// });
			}
		};
	});
