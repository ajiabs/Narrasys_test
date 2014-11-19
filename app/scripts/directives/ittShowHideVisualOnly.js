angular.module('com.inthetelling.story')
	.directive('ittShowHideVisualOnly', ['$animate', function ($animate) {
		return {
			restrict: 'A',
			multiElement: true,
			link: function (scope, element, attr) {
				scope.$watch(attr.ittShowHideVisualOnly, function ngShowWatchAction(value) {
					if (element.hasClass('offscreen')) {
						$animate.removeClass(element, 'offscreen');
						$animate.removeClass(element, 'offscreen-animate');
					} else {
						$animate.addClass(element, 'offscreen-animate', function () {
							$animate.addClass(element, 'offscreen');
						});
					}
				});
			}
		}
	}]); 
