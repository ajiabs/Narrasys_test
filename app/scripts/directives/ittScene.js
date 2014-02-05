'use strict';

// Scene Directive
angular.module('com.inthetelling.player')
	.directive('ittScene', function ($rootScope, $timeout, $window) {
		return {
			restrict: 'A',
			replace: false,
			template: '<div ng-include="scene.templateUrl">Loading Scene...</div>',
			scope: {
				scene: '=ittScene'
			},
			link: function (scope, element, attrs) {
				// Make cosmetic adjustments within the scene based on viewport or video size.
				// TODO: don't use jQuery here if possible?
				// TODO: (probably overoptimizing): have this function return immediately if the scene is not visible. (How do we check that without using jQuery?)
				//       (can't use isActive, as sometimes inactive scenes are still visible)
				// TODO: some of this is a great case for having code specific to individual scene templates instead of one big scene directive....
				scope.twiddleSceneLayout = function () {
					$timeout(function () { // wait for any DOM updates first
						// special case for fullscreen-video and scene-centered views: make sure there's room for captions:
						if (scope.scene.isActive) {
							var videoContainer = element.find('.videoContainer');
							if (scope.scene.templateUrl.indexOf("scene-video.html") > -1) { //TODO WARN FRAGILE BAD YUCKO dependency on template url
								// ensure there's room for captions:
								if (videoContainer.height() > angular.element($window).height() - 200) {
									videoContainer.height(angular.element($window).height() - 200);
								}
							} else if (scope.scene.templateUrl.indexOf("scene-centered.html") > -1) {
								// We effectively want to center a square in the viewport (16:9 video plus allow 16:7 for the transmedia below it)
								// For sanity's sake, leave the column width up to the CSS, only adjust the top padding here.
								// So put the top of the video at (window height - video width)/2
								var pad = (angular.element($window).height() - videoContainer.width()) / 2;
								if (pad < 0) {
									pad = 0;
								}
								element.find('.scene-centered').css("paddingTop", pad);
							}
						}
						element.find('.matchVideoHeight:visible').height(element.find('.videoContainer').height()); // TODO check if this works with multiple .matchVideoHeight elements in the scene
						element.find('.stretchToViewportBottom:visible').each(function () {
							$(this).css("min-height", (angular.element($window).height() - this.offsetTop - 60));
						});
						// TODO: add support for .stretchToSceneBottom as well (would be useful in explore template for example)
					});
					angular.element($window).trigger('resize'); // force magnet to activate now that we've twiddled the layout
				};
				scope.$watch(function () {
					return element.width();
				}, scope.twiddleSceneLayout);

				$rootScope.$on('toolbar.changedSceneTemplate', function() {
					scope.twiddleSceneLayout();
					$timeout(scope.twiddleSceneLayout, 100); // Brute-force solution to tiny-video problem
				});
				scope.$watch('scene.isActive', scope.twiddleSceneLayout);

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
