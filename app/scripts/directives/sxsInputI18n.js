'use strict';

/*For form fields: displays m:ss, sets model as number of seconds. accepts s or m:ss as input. */

angular.module('com.inthetelling.story')
	.directive('sxsInputI18n', function (appState) {
		return {
			templateUrl: 'templates/producer/inputi18n.html',
			scope: {
				field: "=sxsInputI18n",
				inputtype: "=inputtype"
			},
			link: function (scope, element, attrs) {
				scope.appState = appState;
				console.log("inputI18n: ", scope, element, attrs);
			}
		};
	});
