'use strict';

// Transmedia Directive
angular.module('com.inthetelling.player')
.directive('ittItem', function () {
	return {
		restrict: 'A',
		replace: false,
		template: '<div ng-include="item.templateUrl">Loading Item...</div>',
		scope: {
			item: '=ittItem'
		}
	};
});
