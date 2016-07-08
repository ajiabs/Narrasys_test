/**
 * Created by githop on 6/30/16.
 */
(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittTemplateSelect', ittTemplateSelect);

	function ittTemplateSelect() {
	    return {
	        restrict: 'EA',
			template: [
			'<div class="field">',
			'	<div class="label">Template</div>',
			'	<div class="input">',
			'		<select ng-model="item.templateUrl" ng-change="selectService.onSelectChange(item)" ng-options="option.url as option.name for option in item.templateOpts"></select>',
			'	</div>',
			'</div>'
			].join(' ')
	    };
	}


})();
