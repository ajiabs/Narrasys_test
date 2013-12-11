'use strict';

// This directive is basically a placeholder which can be removed/replaced
// or reparented within the dom. When present in the dom all ittMagnetized directive elements
// will automatically change their size and position to overlay the magnet directive.
// multiple magnets may be used in the dom. A magnet will 'attract' the magnetized directive
// when the scene which contains it becomes active. Only one magnet should be present in any scene.

angular.module('com.inthetelling.player')
.directive('ittMagnet', function ($window, $timeout, $rootScope) {
	return {
		restrict: 'A',
		replace: true,
		scope: true,
		link: function(scope, iElement, iAttrs, controller) {
		
			// Throw a console error if the scope isn't a scene
			if (!scope.scene) {
				console.warn("PROBABLE ERROR: ittMagnet directive should have a scene on its scope. Got this instead:", scope);
			}
		
			// 'activate' a dom instance of the itt-magnet directive by broadcasting an event from the root scope
			// with a reference to the itt-magnet's dom element. The itt-magnetized directive listens for these events
			// and utilizes the dom element to reposition itself appropriately.
			var activate = function() {
				console.log("ittMagnet.activate()", iElement);
				// Need timeout because this needs to run after DOM update; so we don't wind up trying to test against a display:none node
				$timeout(function() {
					$rootScope.$emit('magnet.activated', iElement);
				}, 0);
			};

			// call the activate method if the parent scene is active
			var activateIfSceneIsActive = function() {
				if (scope.scene.isActive) {
					activate();
				}
			};

			// watch this directive's parent scene and if its state changes to active then activate the video magnet
			scope.$watch('scene.isActive', function(newValue, oldValue) {
				if (newValue && newValue !== oldValue) {
					activate();
				}
			});

			// for triggering video magnets from outside the scene. Only the magnet in the active scene should respond.
			var unsubscribe = $rootScope.$on('toolbar.changedSceneTemplate', activateIfSceneIsActive);
			angular.element($window).bind('resize', activateIfSceneIsActive);
			
			// cleanup routine on destroy
			scope.$on('$destroy', function() {
				unsubscribe();
				angular.element($window).unbind('resize', activateIfSceneIsActive);
			});

		}
	};
});
