/**
 * Created by githop on 6/30/16.
 */
(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittTimestampSelect', ittTimestampSelect);

	function ittTimestampSelect() {
	    return {
	        restrict: 'EA',
	        scope: true,
			template: [
			'<div class="field">',
			'	<div class="label"><span ng-if="episode">Display </span>Timestamp</div>',
			'	<div class="input">',
			'		<select size="1" ng-model="itemForm.timestamp">',
			'			<option value="">(Default)</option>',
			'			<option value="None">No timestamp</option>',
			'			<option value="Inline">Inline timestamp</option>',
			'		</select>',
			'	</div>',
			'</div>'
			].join(' ')
	    };
	}


})();
