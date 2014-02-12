'use strict';

// ittMagnetized elements respond to ittMagnet events and reposition themselves to match
// the $rootScope.activeMagnet node.

// (Was using a directive for magnets, but that was overcomplicated. A global makes sense here
// because we really do only ever want one magnet active at a time.)

angular.module('com.inthetelling.player')
	.directive('ittMagnetized', function ($rootScope, $timeout) {
		return {
			restrict: 'A',
			replace: true,
			scope: true,
			link: function (scope, element) {
				//			console.log("ittMagnetized", element);

				// resize/reposition ourselves to the passed magnet's element.
				scope.reposition = function (animate) {
						if (!scope.magnet) {
							// no magnet set, so don't do anything
							return;
						}
//					console.log("ittMagnetized triggered, attracting ",element," to ",scope.magnet, " animation is ",animate);
					
					// if videoContainer is position:fixed, video should be too
					element.css("position", (scope.magnet.css("position") === "fixed") ? "fixed" : "absolute" );

					if (animate && jQuery(element).is(':visible')) {
						jQuery(element).stop(true).animate({
							top: scope.magnet.offset().top,
							left: scope.magnet.offset().left,
							width: scope.magnet.width(),
							height: scope.magnet.height()
						},500);
					} else {
						element.offset(scope.magnet.offset());
						element.width(scope.magnet.width());
						element.height(scope.magnet.height());
					}
				};
				
				$rootScope.$on('magnet.changeMagnet', function(evt,magnet) {
					scope.magnet = magnet;
					scope.reposition(true);
				});

				// reposition ourselves on magnet events sent from the toolbar / player chrome
				var watcherOne = $rootScope.$on('magnet.reposition', function() {scope.reposition(true)});
				var watcherTwo = $rootScope.$on('magnet.repositionImmediately', function() {scope.reposition(false)});

				// cleanup watchers on destroy
				scope.$on('$destroy', function () {
					watcherOne();
					watcherTwo();
				});
			}
		};
	});
