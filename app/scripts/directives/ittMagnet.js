'use strict';

// Sends magnet signal whenever becomes visible.
// In watch mode (only), also watches the window size and tries to keep the video from overflowing the window height

// TODO: remove dependence on jQuery?  (.is(:visible))

angular.module('com.inthetelling.story')
	.directive('ittMagnet', function ($rootScope, $timeout) {
		return {
			restrict: 'A',
			replace: true,
			scope: true,
			link: function (scope, element) {
				scope.unwatchVisibility = scope.$watch(function () {
					return element.is(':visible');
				}, function (newV, oldV) {
					if (newV) {
						$rootScope.$emit('magnet.changeMagnet', element);
					}
				});

				if (element.attr("id") === 'watchModeVideoMagnet') {
					scope.unwatchSize = scope.$watch(function () {
						return {
							w: angular.element(window).width(),
							h: angular.element(window).height(),
							v: element.is(':visible')
						};
					}, function () {
						// we want the video to be as wide as possible without overflowing the window.
						// And dont' want to set the height directly, just the width. So math:
						var win = angular.element(window);
						var maxAllowableHeight = win.height() - 45; // TOOLBAR HEIGHT 
						if (win.width() / maxAllowableHeight > (16 / 9)) {
							element.width(16 / 9 * maxAllowableHeight);
						} else {
							element.width(win.width());
						}
						$rootScope.$emit('magnet.changeMagnet', element);
					}, true);
				}

				// cleanup watchers on destroy
				scope.$on('$destroy', function () {
					scope.unwatchVisibility();
					if (scope.unwatchSize) {
						scope.unwatchSize();
					}
				});
			}
		};
	});
