'use strict';

angular.module('com.inthetelling.story')
	.directive('sxsInputI18n', function (appState) {
		return {
			templateUrl: 'templates/producer/inputi18n.html',
			scope: {
				field: "=sxsInputI18n",
				inputtype: "=inputtype"
			},
			link: function (scope) {
				scope.appState = appState;
			}
		};
	});
