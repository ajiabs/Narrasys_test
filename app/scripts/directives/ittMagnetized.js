'use strict';

// ittMagnetized elements respond to videoMagnet events and reposition themselves to match
// the active videoMagnet node.

// TODO: There is still a memory leak here, but much smaller.


angular.module('com.inthetelling.player')
.directive('ittMagnetized', function ($rootScope) {
	return {
		restrict: 'A',
		replace: true,
		scope: true,
		link: function(scope, iElement) {
			console.log("ittMagnetized", iElement);

			// listen for videoMagnet events and resize/reposition ourselves if we receive one
			function magnet(evt, el) {
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
			}
			scope.unbindMagnet = $rootScope.$on('videoMagnet.activated', magnet);
			
			// TODO / BUG: memory leak
			// This is destroying most, but not all, bound videoMagnet events!
			// For each time toolbar.changedSceneTemplate is run, it leaves one extra videoMagnet event per magnetized element.
			// Leak is no longer exponential, at least, leaving for now
			scope.$on('$destroy', function() {
				console.log("Destroying videoMagnet event");
				scope.unbindMagnet();
			});
		}
	};
});
