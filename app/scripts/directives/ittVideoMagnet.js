'use strict';

// This directive is basically a placeholder which can be removed/replaced
// or reparented within the dom. When present in the dom all ittMagnetized directive elements
// will automatically change their size and position to overlay the magnet directive.
// multiple magnets may be used in the dom. A magnet will 'attract' the video directive
// when the scene which contains it becomes active. Only one magnet should be present in any scene.

angular.module('com.inthetelling.player')
.directive('ittVideoMagnet', function ($window, $timeout, s$rootScope) {
	return {
		restrict: 'A',
		replace: true,
		link: function(scope, iElement, iAttrs, controller) {
			//console.log("ITT-VIDEO-MAGNET LINKING FUNCTION: [scope:", scope, "]");
			// 'activate' a dom instance of the itt-video-magnet directive by broadcasting an event from the root scope
			// with a reference to the itt-video-magnet's dom element. The itt-video directive listens for these events
			// and utilizes the dom element to reposition itself appropriately.
			scope.activate = function(beforeDOM) {
				console.log("ittVideoMagnet.activate()", iElement);
				if (beforeDOM) {
					// DOM hasn't changed so can do this immediately:
					$rootScope.$broadcast('videoMagnet', iElement);
				} else {
					// TODO/HACK: the css class in the scene template needs to be set before this is broadcast, otherwise the magnet
					// can't find the correct position (because the newly-active scene will still be hidden when the magnet tries to do its thing.)
					// Couldn't figure out how to get angular's $timeout in here, and timeouts are probably not the best solution to this anyway
					$timeout(function() {
						$rootScope.$broadcast('videoMagnet', iElement);
					}, 1);
				}
			};

			// watch this directive's parent scene and if its state changes to active then activate the video magnet
			scope.$watch('scene.isActive', function(newValue, oldValue) {
				if (newValue && newValue !== oldValue) {
					scope.activate();
				}
			});

			// for triggering video magnets from outside the scene. Only the magnet in the active scene should respond.
			$rootScope.$on('triggerCurrentlyActiveVideoMagnet', function() {
				if (scope.scene.isActive) {
					scope.activate();
				}
			});

			angular.element($window).bind('resize', function() {
				if (scope.scene.isActive) {
					scope.activate(true);
				}
			});

		}
	};
});
