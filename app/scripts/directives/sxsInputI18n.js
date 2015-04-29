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
				if (!scope.field) {
					// need to init the object if it's empty
					scope.field = {
						en: ""
					};
				}
				scope.appState = appState;
			}
		};
	});
