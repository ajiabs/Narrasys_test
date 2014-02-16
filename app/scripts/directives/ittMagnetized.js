'use strict';
// ittMagnetized
// ittMagnetized elements respond to ittMagnet events and reposition themselves to match
// the active ittMagnet's node.

angular.module('com.inthetelling.player')
	.directive('ittMagnetized', function ($rootScope, $timeout) {
		return {
			restrict: 'A',
			replace: true,
			scope: true,
			link: function (scope, element) {
				//			console.log("ittMagnetized", element);

				// resize/reposition ourselves to the passed magnet's element.
				// (element is the magnetized node, el is the magnet node.)
				var reposition = function (evt, el) {
					//				console.log("ittMagnetized triggered");
					// TODO: Animate?

					// A race condition on load can cause the height to resolve to 0; if that happens we force it to a 16:9 aspect ratio.
					// TODO see if we can avoid this happening in the first place.  (Normally we load an invisible gif with the
					// correct aspect ratio to set the node height; this condition occurs if the gif hasn't completed loading by the time
					// this code runs.  It'd be easy enough to make it _likely_ to have loaded first, but can we _guarantee_ it?)
					var newHeight;
					if (el.height() === 0) {
						console.warn("Videocontainer height appears to be zero; forcing to 16:9 aspect ratio");
						newHeight = el.width() * 9 / 16;
					} else {
						newHeight = el.height();
					}

					if (el.css("position") === "fixed") {
						// if videoContainer is position:fixed, video should be too
						element.css("position", "fixed");
						element.offset(el.offset());
						element.width(el.width());
						element.height(newHeight);
					} else {
						element.css("position", "absolute");
						element.offset(el.offset());
						element.width(el.width());
						element.height(newHeight);
					}
				};

				// reposition ourselves on magnet events
				var unsubscribe = $rootScope.$on('magnet.activated', reposition);

				// cleanup routine on destroy
				scope.$on('$destroy', function () {
					unsubscribe();
				});
			}
		};
	});
