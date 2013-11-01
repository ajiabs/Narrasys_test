'use strict';

// This directive is basically an placeholder which can be removed/replaced
// or reparented within the dom. When present in the dom the ittVideo directive
// will automatically change its size and position to overlay the magnet directive.
// multiple magnets may be used in the dom. A magnet will 'attract' the video directive
// when it goes from being hidden to visible in the dom (whether by insertion or display/hidden
// of self or parent node).
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
			// watch this elements visisbility and if it becomes visible in the dom then automatically activate it
			/*scope.$watch(function() {
				return iElement.is(':visible');
			}, function() {
				if (iElement.is(':visible')) {
					scope.activate();
				}
			});*/
		}
	};
});
