'use strict';
//import angular from 'angular';

export default function ittShowHideVisualOnly($animate) {
	'ngInject';
	return {
		restrict: 'A',
		multiElement: true,
		link: function (scope, element, attr) {
			scope.$watch(attr.ittShowHideVisualOnly, function ngShowWatchAction(value) {
				if (value) {
					$animate.removeClass(element, 'visual-hide');
				} else {
					$animate.addClass(element, 'visual-hide');
				}
			});
		}
	};
}

//angular.module('com.inthetelling.story')
//	.animation(".visual-hide", function () {
//		return {
//			addClass: function (element) {
//				//we'll use opacity, so we aren't hidden from screen readers, just hidden from eyes.
//				element.fadeTo("slow", 0, function () {
//				});
//			},
//			removeClass: function (element) {
//				element.fadeTo("slow", 1, function () {
//				});
//			}
//		};
//	});
