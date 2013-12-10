'use strict';

// ittMagnetized elements respond to ittMagnet events and reposition themselves to match
// the active ittMagnet's node.

angular.module('com.inthetelling.player')
.directive('ittMagnetized', function ($rootScope, $timeout) {
	return {
		restrict: 'A',
		replace: true,
		scope: true,
		link: function(scope, iElement) {
			console.log("ittMagnetized", iElement);

			// resize/reposition ourselves against the passed magnet's element
			var reposition = function(evt, el) {
				console.log("ittMagnetized triggered");
				// TODO: Animate?
				if (el.parent().css("position") === "fixed") {
					// if videoContainer is position:fixed, video should be too
					iElement.css("position","fixed");
					iElement.offset(el.offset());
					iElement.width(el.width());
					iElement.height(el.height());
				} else {
					iElement.css("position","absolute");
					iElement.offset(el.offset());
					iElement.width(el.width());
					iElement.height(el.height());
				}
			};

			// reposition ourselves on magent events
			var unsubscribe = $rootScope.$on('magnet.activated', reposition);
			
			// cleanup routine on destroy
			scope.$on('$destroy', function() {
				unsubscribe();
			});
		}
	};
});
