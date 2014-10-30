'use strict';
// attach to any directive to make its first input/textarea autofocus

angular.module('com.inthetelling.story')
	.directive('autofocus', function ($timeout) {
		return {
			link: function (scope, element) {
				$timeout(function () { // give any child directives time to render themselves...
					console.log(element);
					if (element[0].tagName === 'TEXTAREA' || element[0].tagName === 'INPUT') {
						element[0].focus();
					} else {
						element.find('input,textarea')[0].focus();
					}
				});
			}
		};
	});
