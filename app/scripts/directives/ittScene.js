'use strict';

// Scene Directive
angular.module('com.inthetelling.player')
.directive('ittScene', function () {
	return {
		restrict: 'A',
		replace: true,
		template: '<div ng-include="scene.templateUrl">Loading Scene...</div>',
		scope: {
			scene: '=ittScene'
		}
	};
});
