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
			'	<div class="label">{{$ctrl.labelText}}</div>',
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
				ctrl.labelText = 'Template';

				//for episodes, not items (aka events).
				//need a type of 'episode' for our selectSerivce
				//switch statement
				if (!ctrl.data.hasOwnProperty('producerItemType')) {
					ctrl.data.producerItemType = 'episode';
					ctrl.labelText = 'Theme';
				}
			}],
			controllerAs: '$ctrl',
			bindToController: true

	    };
	}


})();
