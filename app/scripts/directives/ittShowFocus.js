angular.module('com.inthetelling.story')
	.directive('ittShowFocus', function ($timeout) {
		return function (scope, element, attrs) {
			scope.$watch(attrs.ittShowFocus,
				function (newValue) {
					$timeout(function () {
						newValue && element.filter(':visible')
							.first()
							.focus();
					});
				}, true)

		};
	});
