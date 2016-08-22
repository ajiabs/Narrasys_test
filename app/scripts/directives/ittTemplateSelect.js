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
				itemForm: '=?'
			},
			template: [
			'<div class="field" ng-if="$ctrl.isVisible(\'templateSelect\')">',
			'	<div class="label">Template</div>',
			'	<div class="input">',
			'		<select ng-model="$ctrl.data.templateUrl" ng-change="$ctrl.onSelectChange($ctrl.data, $ctrl.itemForm)" ng-options="option.url as option.name for option in $ctrl.data.templateOpts" itt-options-disabled="option.isDisabled for option in $ctrl.data.templateOpts"></select>',
			'	</div>',
			'</div>'
			].join(' '),
			controller: ['selectService', function(selectService) {
				var ctrl = this;
				ctrl.isVisible = selectService.getVisibility;
				ctrl.onSelectChange = selectService.onSelectChange;
				ctrl.getSelectOpts = selectService.getSelectOpts;
			}],
			controllerAs: '$ctrl',
			bindToController: true

	    };
	}


})();
