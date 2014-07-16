'use strict';

// Sends magnet signal whenever becomes visible.

// TODO: remove dependence on jQuery?  (.is(:visible))

angular.module('com.inthetelling.story')
	.directive('ittMagnet', function ($rootScope, $timeout) {
		return {
			restrict: 'A',
			replace: true,
			scope: true,
			link: function (scope, element) {
				// console.log("Magnet", element);
				scope.unwatch = scope.$watch(function () {
					return element.is(':visible');
				}, function (newV, oldV) {
					if (newV) {
						$rootScope.$emit('magnet.changeMagnet', element);
					}
				});
				// cleanup watchers on destroy
				scope.$on('$destroy', function () {
					scope.unwatch();
				});
			}
		};
	});
