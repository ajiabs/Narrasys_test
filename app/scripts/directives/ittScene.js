'use strict';

// Minor jquery dependency ($.inArray)

angular.module('com.inthetelling.story')
	.directive('ittScene', function ($timeout, $interval, appState) {
		return {
			restrict: 'A',
			replace: false,
			scope: {
				scene: '=ittScene',
				episode: '=episode'
			},
			template: '<span ng-include="scene.templateUrl"></span>',
			controller: 'SceneController',
			link: function (scope, element) {
				// console.log('ittScene', scope, element, attrs);

				// force discover and watch modes to not start out scrolled halfway out of view (STORY-161)
				if (appState.viewMode !== 'review') {
					window.scrollTo(0, 0);
				}
				scope.precalculateSceneValues();
				scope.appState = appState;

				var twiddleScene = function () {
					var magnetNode = element.find('.videoMagnet img');
					if (magnetNode.height() === null) {
						// console.warn("twiddleScene called with no visible video magnet; waiting.");
						var unwatchMagnet = scope.$watch(function () {
							// Don't try to optimize by using magnetNode from above; if we got here in the first place magnetNode is undefined.
							// This is an expensive $watch but will only run for a tick or two while the scene is being drawn...
							return element.find('.videoMagnet img').height();
						}, function (newH) {
							if (newH > 0) {
								unwatchMagnet();
								twiddleScene();
							}
						});
					} else {
						element.find('.matchVideoHeight:visible').each(function () {
							$(this).css("height", element.find('.videoMagnet img').height());
						});
						var availableViewportHeight = angular.element(window).height() - $('#CONTAINER').scrollTop(); /* TOOLBAR HEIGHT */
						element.find('.stretchToViewport:visible').each(function () {
							$(this).css("min-height", (availableViewportHeight - $(this).offset().top));
						});
						// landing screen: keep the bottom toolbar onscreen
						element.find('.stretchToViewportShort:visible').each(function () {
							$(this).css("min-height", (availableViewportHeight - $(this).offset().top - 210));
						});
					}

					element.find('.content').each(function () {
						var contentpane = $(this);
						if (contentpane.outerWidth() > 550) {
							contentpane.addClass('allowSidebars');
						} else {
							contentpane.removeClass('allowSidebars');
						}
					});
				};

				// Trigger twiddleScene when the window changes size, the scene becomes current, or the viewMode changes:
				scope.unwatch = scope.$watch(function () {
					return {
						winWidth: appState.windowWidth,
						winHeight: appState.windowHeight,
						newMode: appState.viewMode
					};
				}, function (the) {
					if (the.newMode === 'discover' && scope.scene.isCurrent) {
						twiddleScene();
					}
				}, true);

				// HACK to catch cases (mostly on ios) where matchvideoheight isn't matching.
				// slow, odd interval
				scope.safetyBelt = $interval(twiddleScene, 1321);

				// cleanup watchers on destroy
				scope.$on('$destroy', function () {
					scope.unwatch();
					$interval.cancel(scope.safetyBelt);
				});

			},

		};
	});
