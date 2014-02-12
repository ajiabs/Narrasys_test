'use strict';

// ittMagnetized elements respond to ittMagnet events and reposition themselves to match
// the $rootScope.activeMagnet node.

// Was using a directive for magnets, but that was overcomplicated. A global makes sense here
// because we really do only ever want one magnet active at a time.

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
				scope.reposition = function (evt) {
					// TODO: Animate?
						if (!scope.magnet) {
							// no magnet set, so don't do anything
							return;
						}

//					console.log("ittMagnetized triggered, attracting ",element," to ",scope.magnet);
					
					// A race condition on load can cause the height to resolve to 0; if that happens we force it to a 16:9 aspect ratio.
					// TODO see if we can avoid this happening in the first place.  (Normally we load an invisible gif with the
					// correct aspect ratio to set the node height; this condition occurs if the gif hasn't completed loading by the time
					// this code runs.  It'd be easy enough to make it _likely_ to have loaded first, but can we _guarantee_ it?)
/*					var newHeight;
					if (magnet.height() === 0) {
						console.warn("Videocontainer height appears to be zero; forcing to 16:9 aspect ratio");
						newHeight = magnet.width() * 9 / 16;
					} else {
						newHeight = magnet.height();
					}*/

					if (scope.magnet.css("position") === "fixed") {
						// if videoContainer is position:fixed, video should be too
						element.css("position", "fixed");
						element.offset(scope.magnet.offset());
						element.width(scope.magnet.width());
						element.height(scope.magnet.height());
					} else {
						element.css("position", "absolute");
						element.offset(scope.magnet.offset());
						element.width(scope.magnet.width());
						element.height(scope.magnet.height());
					}
				};

				$rootScope.$on('magnet.changeMagnet', function(evt,magnet) {
					scope.magnet = magnet;
					scope.reposition();
				});

				// reposition ourselves on magnet events.  Toolbar will send this out
				var unsubscribe = $rootScope.$on('magnet.activated', scope.reposition);

				// cleanup routine on destroy
				scope.$on('$destroy', function () {
					unsubscribe();
				});
			}
		};
	});
