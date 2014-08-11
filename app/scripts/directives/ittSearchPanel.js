'use strict';

angular.module('com.inthetelling.story')
	.directive('ittSearchPanel', function () {
		return {
			restrict: 'A',
			replace: true,
			scope: true,
			templateUrl: 'templates/searchpanel.html',
			controller: 'SearchPanelController',
			link: function (scope) {
				// console.log("ittSearchPanel", scope);
				scope.indexEvents();
			}
		};
	});
