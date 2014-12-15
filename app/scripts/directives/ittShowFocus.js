'use strict';

angular.module('com.inthetelling.story')
	.directive('ittShowFocus', function ($timeout) {
		return function (scope, element, attrs) {
			scope.$watch(attrs.ittShowFocus,
				function (newValue) {
					$timeout(function () {
						/* jshint -W030 */
						newValue && element.filter(':visible')
							.first()
							.focus();
						/* jshint +W030 */
					});
				}, true);

		};
	});
