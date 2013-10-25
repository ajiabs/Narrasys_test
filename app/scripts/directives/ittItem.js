'use strict';

// Transmedia Directive
angular.module('com.inthetelling.player')
.directive('ittItem', function () {
	return {
		restrict: 'A',
		replace: false,
		template: '<div ng-include="item.templateUrl">Loading Item...</div>',
		link: function(scope, iElement, iAttrs, controller) {
			console.log("ITT-ITEM LINKING FUNCTION: [scope:", scope, "]");
		},
		scope: {
			item: '=ittItem'
		}
	};
});
