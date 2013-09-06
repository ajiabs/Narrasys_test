'use strict';

// Declare the player.directives module
angular.module('player.directives', [])

// Scene Directive
.directive('scene', function() {
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
})

// Transmedia Directive
.directive('transmedia', function() {
	return {
		restrict: 'A',
		replace: false,
		template: '<div ng-include="transmedia.templateUrl">Loading Transmedia...</div>',
		link: function(scope, iElement, iAttrs, controller) {
			console.log("TRANSMEDIA SCOPE:", scope);
			var somePrivateMethod = function(arg) {
				return true;
			};
			var showAlert = function(msg) {
				if (somePrivateMethod(msg)) {
					alert(msg);
				}
			};
			var showDecoratedAlert = function(msg) {
				showAlert(msg + "~extra stuff~");
			};
			scope.popup = showAlert;
			scope.popupPlus = showDecoratedAlert;
		},
		scope: {
			transmedia: '='
		}
	};
})

// Video.js Wrapper Directive
.directive('videoJSWrapper', function() {
	return {

	};
});