'use strict';

angular.module('com.inthetelling.player')
	.directive('ittSearchPanel', function() {
		return {
			restrict: 'A',
			replace: true,
			scope: true,
			templateUrl: 'templates/searchpanel.html',
			controller: 'SearchPanelController',
			link: function(scope, element, attrs) {

				console.log("ittSearchPanel", scope);

				scope.indexEvents();

			}

		};
	});
