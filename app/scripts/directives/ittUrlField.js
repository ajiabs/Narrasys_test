/**
 * Created by githop on 6/30/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittUrlField', ittUrlField);

	function ittUrlField() {
	    return {
	        restrict: 'EA',
			template: [
			'<div class="field">',
			'	<div class="label">URL</div>',
			'	<div class="input">',
			'		<input type="text" itt-valid-item-url item="item" name="itemUrl" ng-model-options="{ updateOn: \'blur\' }" ng-model="item.url"/>',
			'	</div>',
			'</div>'
			].join(' ')
	    };
	}


})();
