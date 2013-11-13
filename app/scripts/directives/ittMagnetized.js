'use strict';

// ittMagnetized elements respond to videoMagnet events and reposition themselves to match
// the active videoMagnet node.
angular.module('com.inthetelling.player')
.directive('ittMagnetized', function () {
	return {
		restrict: 'A',
		replace: true,
		link: function(scope, iElement, iAttrs, controller) {
	
			console.log("ittMagnetized link");

			// listen for videoMagnet events and resize/reposition ourselves if we receive one
			scope.$on('videoMagnet', function(evt, el) {
			console.log("ittMagnetized triggered");
			
				// TODO: Animate?
				if (el.parent().css("position") === "fixed") {
					// if videoContainer is position:fixed, video should be too
					// TODO: add equivalent padding to next pane element to prevent overlap
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
			});
		}
	};
});
