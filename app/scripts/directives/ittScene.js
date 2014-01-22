'use strict';

// Scene Directive
angular.module('com.inthetelling.player')
	.directive('ittScene', function ($rootScope, $timeout) {
		return {
			restrict: 'A',
			replace: false,
			template: '<div ng-include="scene.templateUrl">Loading Scene...</div>',
			scope: {
				scene: '=ittScene'
			},
			link: function (scope, element, attrs) {
				// console.log("scene: ", scope);

				// Make cosmetic adjustments within the scene based on viewport or video size.
				// TODO: don't use jQuery here if possible?
				// TODO: (probably overoptimizing): have this function return immediately if the scene is not visible. (How do we check that without using jQuery?)
				//       (can't use isActive, as sometimes inactive scenes are still visible)
				var twiddleSceneLayout = function () {
					$timeout(function () { // wait for any DOM updates first
						// console.log("twiddleSceneLayout");
						
						// special case for fsvideo view: make sure there's room for captions:
						if (scope.scene.templateUrl === "templates/scene-video.html" && scope.scene.isActive) { //TODO WARN FRAGILE BAD YUCKO dependency on template url
							element.find('.videoContainer').height($(window).height() - 160); // ensure there's room for captions
						}

						
						element.find('.matchVideoHeight:visible').height(element.find('.videoContainer').height()); // TODO check if this works with multiple .matchVideoHeight elements in the scene
						element.find('.stretchToViewportBottom:visible').each(function () {
							$(this).css("min-height", ($(window).height() - this.offsetTop - 60));
						});
						// TODO: add support for .stretchToSceneBottom as well (would be useful in explore template for example)
					}, 0);
				};

				scope.$watch(function () {
					return element.width();
				}, twiddleSceneLayout);
				$rootScope.$on('toolbar.changedSceneTemplate', twiddleSceneLayout);
				scope.$watch('scene.isActive', twiddleSceneLayout);

				/*
				// In case we need scene enter / exit events someday...
				scope.$watch('scene.isActive', function (newVal, oldVal) {
					if (newVal) {
						console.log("SCENE ENTERING", scope.scene);
					} else {
						//console.log("SCENE EXIT", scope);
					}
				});
				*/

			}
		};
	});
