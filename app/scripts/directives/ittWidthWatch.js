'use strict';
/* Attach this to content panes, so they can tell their items when to drop into inline timestamps. */
angular.module('com.inthetelling.story')
	.directive('ittWidthWatch', function () {
		return {
			restrict: 'A',
			replace: false,
			link: function (scope, element) {
				var unwatch = scope.$watch(function () {
					return element.width();
				}, function (w) {
					scope.isNarrow = (w < 450);
				});
				scope.$on("$destroy", unwatch);
			}
		};
	});
