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
			scope: {
	        	data: '=',
				itemForm: '='
			},
			template: [
			'<div class="field" ng-if="templSelect.isVisible(\'templateSelect\')">',
			'	<div class="label">Template</div>',
			'	<div class="input">',
			'		<select ng-model="templSelect.data.templateUrl" ng-change="templSelect.onSelectChange(templSelect.data, templSelect.itemForm)" ng-options="option.url as option.name for option in templSelect.data.templateOpts"></select>',
			'	</div>',
			'</div>'
			].join(' '),
			controller: ['selectService', function(selectService) {
				var ctrl = this;
				ctrl.isVisible = selectService.getVisibility;
				ctrl.onSelectChange = selectService.onSelectChange;
			}],
			controllerAs: 'templSelect',
			bindToController: true

	    };
	}


})();
