'use strict';

// Declare the player.directives module
angular.module('player.directives', [])

// Scene Directive
.directive('scene', [function() {
	return {
		restrict: 'A',
		replace: false,
		template: '<div ng-include="scene.templateUrl">Loading Scene...</div>',
		link: function(scope, iElement, iAttrs, controller) {
			console.log("SCENE SCOPE:", scope);
		},
		scope: {
			scene: '='
		}
	};
}])

// Transmedia Directive
.directive('item', [function() {
	return {
		restrict: 'A',
		replace: false,
		template: '<div ng-include="item.templateUrl">Loading Transmedia...</div>',
		link: function(scope, iElement, iAttrs, controller) {
			console.log("TRANSMEDIA SCOPE:", scope);
		},
		scope: {
			item: '='
		}
	};
}])

// Video.js Wrapper Directive
.directive('videoJSWrapper', function() {
	return {
		restrict: 'A',
		replace: false,
		template: '<div ng-include="transmedia.templateUrl">Loading Transmedia...</div>',
		link: function(scope, iElement, iAttrs, controller) {
			
		}
	};
});