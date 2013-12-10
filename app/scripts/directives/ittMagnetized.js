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

			// resize/reposition ourselves to the passed magnet's element.
			// (iElement is the magnetized node, el is the magnet node.)
			var reposition = function(evt, el) {
				console.log("ittMagnetized triggered");
				// TODO: Animate?

				// A race condition on load can cause the height to resolve to 0; if that happens we force it to a 16:9 aspect ratio.
				var newHeight;
				if (el.height() === 0) {
					console.warn("Videocontainer height appears to be zero; forcing to 16:9 aspect ratio");
					newHeight = el.width() * 9 / 16;
				} else {
					newHeight = el.height();
				}

				if (el.parent().css("position") === "fixed") {
					// if videoContainer is position:fixed, video should be too
					iElement.css("position","fixed");
					iElement.offset(el.offset());
					iElement.width(el.width());
					iElement.height(newHeight);
				} else {
					iElement.css("position","absolute");
					iElement.offset(el.offset());
					iElement.width(el.width());
					iElement.height(newHeight);
				}
			};

			// reposition ourselves on magnet events
			var unsubscribe = $rootScope.$on('magnet.activate', reposition);
			
			// cleanup routine on destroy
			scope.$on('$destroy', function() {
				unsubscribe();
			});
		}
	};
});
