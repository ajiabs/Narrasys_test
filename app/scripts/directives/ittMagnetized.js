'use strict';

// ittMagnetized elements respond to videoMagnet events and reposition themselves to match
// the active videoMagnet node.

angular.module('com.inthetelling.player')
.directive('ittMagnetized', function ($rootScope) {
	return {
		restrict: 'A',
		replace: true,
		link: function(scope, iElement, iAttrs, controller) {
	
			console.log("ittMagnetized link");

			// TODO failed attempt to unbind previous magnet event in this scope
			if (scope.magnetFunction) {scope.magnetFunction();}

			// listen for videoMagnet events and resize/reposition ourselves if we receive one
			scope.magnetFunction = scope.$on('videoMagnet', function(evt, el) {
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
				
				// TODO HACK
				// Need to refactor the videoMagnet, trigger it once per scene instead of
				// once per magnetized element, and include this as part of it.... as it is this
				// is 7 events when it could be one per scene
				// Separating the following out into separate directives too
				// would just multiply that problem, so for now I'm just going to handle it directly.
				$('.currentScene .matchVideoHeight').height(el.height());
				$('.currentScene .stretchToViewportBottom').each(function() {
					$(this).css("min-height",($(window).height() - this.offsetTop - 60));
				});


			});
		}
	};
});
