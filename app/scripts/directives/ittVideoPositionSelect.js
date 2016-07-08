/**
 *
 * Created by githop on 6/30/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittVideoPositionSelect', ittVideoPositionSelect);

	function ittVideoPositionSelect() {
	    return {
	        restrict: 'EA',
	        scope: true,
			template: [
			'<div class="field" ng-if="selectService.getVisibility(\'videoPosition\')">',
			'	<div class="label">Video Postion</div>',
			'	<div class="input">',
			'		<select ng-model="item.layouts[0]" ng-options="option.value as option.name for option in selectService.getVideoPositionOpts()"></select>',
			'	</div>',
			'</div>'
			].join(' ')
	    };
	}


})();
