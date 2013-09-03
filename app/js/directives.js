'use strict';

// Declare the player.directives module
angular.module('player.directives', [])

// Scene Directive
.directive('scene', function() {
	return {
		restrict: 'A',
		replace: false,
		template: '<div ng-include="scene.templateUrl || episode.currentScene.templateUrl">Loading Scene...</div>',
		link: function(scope) {
			console.log("SCOPE:", scope);
		},
		scope: true //{
			//scene: '='
		//}
	};
})

// Transmedia Directive
.directive('transmedia', function() {
	return {

	};
})

// Video.js Wrapper Directive
.directive('videoJSWrapper', function() {
	return {

	};
});