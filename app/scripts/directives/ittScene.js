'use strict';

// Scene Directive
angular.module('com.inthetelling.player')
.directive('ittScene', function () {
	return {
		restrict: 'A',
		replace: false,
		template: '<div ng-include="scene.templateUrl">Loading Scene...</div>',
		link: function(scope, iElement, iAttrs, controller) {
			console.log("ITT-SCENE LINKING FUNCTION: [scope:", scope, "]");
		},
		scope: {
			scene: '=ittScene'
		}
	};
});
