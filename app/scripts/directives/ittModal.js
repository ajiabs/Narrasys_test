/**
 * Created by githop on 6/2/16.
 */
/**
 * Created by githop on 6/1/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittModal', ittModal);

	function ittModal() {
		return {
			restrict: 'EA',
			transclude: true,
			scope: {
				modalClass: '@'
			},
			template: [
				'<div class="itt__modal"><div class="{{modalClass}}"><ng-transclude></ng-transclude></div></div>'
			].join(' ')
		};
	}


})();
