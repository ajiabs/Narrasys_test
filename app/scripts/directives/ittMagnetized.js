'use strict';

// ittMagnetized elements respond to videoMagnet events just like ittVideo.
angular.module('com.inthetelling.player')
.directive('ittMagnetized', function (queuePointScheduler, videojs, $timeout, config) {
	return {
		restrict: 'A',
		replace: true,
		link: function(scope, iElement, iAttrs, controller) {
	
			console.log("ittMagnetized link");
	

			// listen for videoMagnet events and resize/reposition ourselves if we receive one
			scope.$on('videoMagnet', function(evt, el) {
			console.log("ittMagnetized triggered");
			
				// TODO: Animate?
				//console.log("videoMagnet.on()!", evt, el);
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
			});
		}
	};
});
