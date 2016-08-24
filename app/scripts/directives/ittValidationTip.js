/**
 * Created by githop on 8/24/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittValidationTip', ittValidationTip);

	function ittValidationTip() {
	    return {
	        restrict: 'EA',
	        scope: {
	        	text: '@',
				doInfo: '=?'
			},
			template: [
				'<div class="tooltip-static">',
				'	<i class="fa fa-info-circle" ng-class="{\'error-red\': !doInfo, \'info-blue\': doInfo}"></i>',
				'	<p class="tooltip-text">{{text}}</p>',
				'</div>'
			].join('\n')
	    };
	}


})();
