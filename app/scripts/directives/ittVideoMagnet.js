'use strict';

// This directive is basically a placeholder which can be removed/replaced
// or reparented within the dom. When present in the dom all ittMagnetized directive elements
// will automatically change their size and position to overlay the magnet directive.
// multiple magnets may be used in the dom. A magnet will 'attract' the video directive
// when the scene which contains it becomes active. Only one magnet should be present in any scene.

angular.module('com.inthetelling.player')
.directive('ittVideoMagnet', function ($rootScope) {
	return {
		restrict: 'A',
		replace: true,
		link: function(scope, iElement, iAttrs, controller) {
			//console.log("ITT-VIDEO-MAGNET LINKING FUNCTION: [scope:", scope, "]");
			// 'activate' a dom instance of the itt-video-magnet directive by broadcasting an event from the root scope
			// with a reference to the itt-video-magnet's dom element. The itt-video directive listens for these events
			// and utilizes the dom element to reposition itself appropriately.
			scope.activate = function() {
				console.log("ittVideoMagnet.activate()!");
				$rootScope.$broadcast('videoMagnet', iElement);
			};
			// watch this directive's parent scene and if its state changes to active then activate the video magnet
			scope.$watch('scene.isActive', function(newValue, oldValue) {
				if (newValue && newValue !== oldValue) {
					scope.activate();
				}
			});
		}
	};
});
