/**
 * Created by githop on 6/30/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittColorSelect', ittColorSelect);

	function ittColorSelect() {
	    return {
	        restrict: 'EA',
			template: [
			'<div class="field">',
			'	<div class="label">Color</div>',
			'	<div class="input">',
			'		<select size="1" ng-model="itemForm.color">',
			'			<option value="">(Default)</option>',
			'			<option value="Invert">Invert</option>',
			'			<option value="Sepia">Sepia</option>',
			'			<option value="Solarized">Solarized</option>',
			'			<option value="Vivid">Vivid</option>',
			'		</select>',
			'	</div>',
			'</div>'
			].join(' ')
	    };
	}


})();
