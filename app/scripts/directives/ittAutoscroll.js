'use strict';

// automatically scrolls the root container element (not the window) to make the topmost current item visible.
// (Window never scrolls because we're overriding it with #CONTAINER to make fullscreen work better.)


angular.module('com.inthetelling.player')
	.directive('ittAutoscroll', function($rootScope, $timeout) {
		return {
			restrict: 'A',
			replace: true,
			scope: true,
			link: function(scope, element) {
				console.log("ittAutoscroll");
				scope.autoscrollEnabled = true;

				angular.element('#CONTAINER').bind("scroll", function() {
					console.log("cancelling autoscroll");
					scope.autoscrollEnabled = false;
				});
				scope.enableAutoscroll = function() {
					scope.autoscrollEnabled = true;
					scope.autoscroll();
				};

				scope.autoscroll = function() {
					console.log("autoscrolling");
				};

				// $rootScope.$on('item.autoscroll', function() {
				// 	if (!scope.captureScrollEvents || !scope.autoscrollEnabled) {
				// 		return;
				// 	}

				// 	var top = Infinity;
				// 	// There will always be at least one currentItem, since this is triggered by item enter.
				// 	angular.forEach($('.content .item.currentItem'), function(item) {
				// 		var t = $(item).offset().top;
				// 		if (t < top) {
				// 			top = t;
				// 		}
				// 	});
				// 	var offset = 45 + $('.videoContainer:visible').height(); /* TOOLBAR HEIGHT */
				// 	if (top < Infinity) {
				// 		scope.captureScrollEvents = false;
				// 		$("body,html").stop().animate({
				// 			"scrollTop": top - offset
				// 		}, 1000, "swing", function() {
				// 			$timeout(function() {
				// 				scope.captureScrollEvents = true;
				// 			}, 50); // allow extra time; iPad was still capturing the tail end of the animated scroll
				// 		});
				// 	}
				// });

				// angular.element('#CONTAINER').bind("scroll", function() {
				// 	if (scope.captureScrollEvents && scope.autoscrollEnabled) {
				// 		scope.autoscrollEnabled = false;
				// 	}
				// });
				// scope.enableAutoscroll = function() {
				// 	scope.autoscrollEnabled = true;
				// 	$rootScope.$emit('item.autoscroll');
				// };


				// cleanup watchers on destroy
				scope.$on('$destroy', function() {
					scope.unwatch();
				});
			}
		};
	});
