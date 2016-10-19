/**
 * Created by githop on 9/28/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittTooltip', ittTooltip);

	function ittTooltip() {
	    return {
	        restrict: 'EA',
			transclude: true,
			scope: {
	        	tipText: '@',
				css: '@?'
			},
	        template: [
	        	'<span class="tooltip-static">',
				'	<ng-transclude></ng-transclude>',
				'	<span class="{{css ? css : \'tooltip-text\'}}" style="text-indent: 0;">{{tipText}}</span>',
				'</span>'
			].join('')
	    };
	}


})();
