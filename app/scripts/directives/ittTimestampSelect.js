/**
 * Created by githop on 6/30/16.
 */
(function () {
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
				'			<option ng-if="episode" value="">(Default)</option>',
				'			<option ng-if="item._type === \'Scene\'" value="">(Inherit from episode)</option>',
				'			<option ng-if="item._type !== \'Scene\'" value="">(Inherit from layout)</option>',
				'			<option value="None">Off</option>',
				'			<option value="Inline">On</option>',
				'		</select>',
				'	</div>',
				'</div>'
			].join(' ')
		};
	}


})();
