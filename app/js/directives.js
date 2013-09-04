'use strict';

// Declare the player.directives module
angular.module('player.directives', [])

// Scene Directive
.directive('plScene', function() {
	return {
		restrict: 'A',
		replace: false,
		template: '<div ng-include="scene.templateUrl">Loading Scene...</div>',
		link: function(scope) {
			console.log("SCOPE:", scope);
		},
		scope: {
			scene: '='
		}
	};
})

// Transmedia Directive
.directive('plTransmedia', function() {
	return {

	};
})

// Video.js Wrapper Directive
.directive('plVideoJSWrapper', function() {
	return {

	};
});