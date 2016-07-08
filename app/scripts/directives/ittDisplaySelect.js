/**
 *
 * Created by githop on 6/30/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittDisplaySelect', ittDisplaySelect);

	function ittDisplaySelect() {
	    return {
	        restrict: 'EA',
	        scope: true,
			template: [
			'<div class="field" ng-if="selectService.getVisibility(\'display\')">',
			'	<div class="label">Display</div>',
			'	<div class="input">',
			'		<select ng-model="item.layouts[1]">',
			'			<option value="">Show all content items, highlight current ones</option>',
			'			<option value="showCurrent">Show only current items</option>',
			'		</select>',
			'	</div>',
			'</div>'
			].join('')
	    };
	}


})();
