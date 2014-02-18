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
// 				console.log("Scope directive link",scope);

				// Make cosmetic adjustments within the scene based on viewport or video size.
				// TODO: don't use jQuery here if possible?
				// TODO: The special-cases for video and scene-centered templates ought to be tied to those templates specifically
				//       instead of being in the main scene directive
				// HACK: some fragile dependence on template url here, that's pretty lame.  At the very least should use magic classnames instead?
				
				var twiddleSceneLayout = function () {
//				console.log("TwiddleSceneLayout called for ",scope.scene);
					$timeout(function () { // wait for any DOM updates first
						// only trigger on active scenes or on first explore-mode scene (HACK)
						if (scope.scene.isActive || (scope.scene.startTime === 0 && scope.scene.templateUrl.indexOf('scene-explore.html') > -1)) {
// 							console.log("twiddling scene ",scope.scene);
							var videoContainer = element.find('.videoContainer');
//BUG: safari gets height very wrong sometimes, so we're hardcoding the aspect ratio for now;
//								var aspectRatio = videoContainer.width()/videoContainer.height();
								var aspectRatio = 16/9;

							// special case: video mode
							if (scope.scene.templateUrl.indexOf("scene-video.html") > -1) {
								// we want the video to be as wide as possible without overlapping the bottom control bar (so max height is viewport - 45 - 65)  TOOLBAR HEIGHT
								// we dont' want to set the height directly, just the width. So math:
								var maxAllowableHeight = angular.element(window).height()-110;
								if (angular.element(window).width()/maxAllowableHeight > aspectRatio) {
									videoContainer.width(aspectRatio * maxAllowableHeight);
								} else {
									videoContainer.width(angular.element(window).width());
								}
							}
							
							// special case: scene-centered
							if (scope.scene.templateUrl.indexOf("scene-centered.html") > -1) {
								// We effectively want to center a square in the viewport (16:9 video plus allow 16:7 for the transmedia below it)
								// For sanity's sake, leave the column width up to the CSS, only adjust the top padding here.
								// So put the top of the video at (window height - video width)/2
								var pad = (angular.element($window).height() - videoContainer.width()) / 2;
								if (pad < 0) {
									pad = 0;
								}
								element.find('.scene-centered').css("paddingTop", pad);
							}
							
							// Set this explicitly, for safari
							videoContainer.height(videoContainer.width() / aspectRatio);
							
							element.find('.matchVideoHeight:visible').height(videoContainer.height()); // TODO check if this works with multiple .matchVideoHeight elements in the scene
							element.find('.stretchToViewportBottom:visible').each(function () {
								$(this).css("min-height", (angular.element($window).height() - this.offsetTop - 45)); // HACK: 45 is /* TOOLBAR HEIGHT */ 
							});
						}
						
						if ($('.currentScene .scene').length) {
							var sceneTop = $('.currentScene .scene').position().top - 45; /* Hack: 45px is TOOLBAR HEIGHT */
							$("body,html").stop().animate({"scrollTop": sceneTop}, 750);
						}
					},0);

				};
				
				// iframes on ipads plus window.resize watchers == crash.
				if ($rootScope.isFramed && ($rootScope.isIPad || $rootScope.isIPhone)) {
					scope.$watch(function() {return scope.IOSFramewidth},twiddleSceneLayout);
				} else {
					angular.element($window).bind('resize', twiddleSceneLayout);
				}

				scope.$watch('scene.isActive', function (newVal, oldVal) {
					if (newVal) {
// 						console.log("SCENE ENTERING", scope.scene);
						twiddleSceneLayout();
						$timeout(function() {
							$rootScope.$emit('magnet.changeMagnet',element.find('.videoContainer'));
						},0);
					} else if (oldVal) {
//						console.log("SCENE EXITING",scope.scene);
					}
				});

				$rootScope.$on('toolbar.changedSceneTemplate', function() {
					twiddleSceneLayout();
					if (scope.scene.isActive) {
						$timeout(function() {
//						console.log("Changed scene template, updating magnet for scene");
							$rootScope.$emit('magnet.changeMagnet',element.find('.videoContainer'));
						},0);
					}
				});

			}
		};
	});
