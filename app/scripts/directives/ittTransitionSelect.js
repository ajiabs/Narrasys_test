/**
 * Created by githop on 6/30/16.
 */
(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittTransitionSelect', ittTransitionSelect);

	function ittTransitionSelect() {
	    return {
	        restrict: 'EA',
			template: [
			'<div class="field">',
			'	<div class="label">Transition</div>',
			'	<div class="input">',
			'		<select size="1" ng-model="itemForm.transition">',
			'			<option value="">(Default)</option>',
			'			<option value="None">No transition</option>',
			'			<option value="Fade">Fade</option>',
			'			<option value="SlideL">Slide left</option>',
			'			<option value="SlideR">Slide right</option>',
			'			<option value="ExpandW">Expand</option>',
			'			<option value="Pop">Pop</option>',
			'		</select>',
			'	</div>',
			'</div>'
			].join(' ')
	    };
	}


})();
