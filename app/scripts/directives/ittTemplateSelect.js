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
			'	<div class="input" ng-class="{layouts: $ctrl.labelText === \'Template\' && $ctrl.data.producerItemType === \'scene\'}">',
			'		<select ng-model="$ctrl.data.templateUrl" ng-change="$ctrl.onSelectChange($ctrl.data, $ctrl.itemForm)" ng-options="option.url as option.name for option in $ctrl.data.templateOpts" itt-options-disabled="option.isDisabled for option in $ctrl.data.templateOpts"></select>',
			'	</div>',
			'</div>'
			].join(' '),
			controller: ['selectService', 'modelSvc', function(selectService, modelSvc) {
				var ctrl = this;
				ctrl.isVisible = selectService.getVisibility;
				ctrl.onSelectChange = selectService.onSelectChange;
				ctrl.getSelectOpts = selectService.getSelectOpts;
				ctrl.labelText = 'Template';

				var isAnnotation = ctrl.data.producerItemType === 'annotation';
				var currentScene, isCenteredPro, isCenterVV, isMondrian;
				if (isAnnotation) {
					currentScene = selectService.getSceneName(modelSvc.scene(ctrl.data.scene_id));
					isCenteredPro = currentScene === 'centeredPro';
					isCenterVV = currentScene === 'centerVV';
					isMondrian = currentScene === 'centerVVMondrian';
					//remove H1s for certain layouts - TS-1137
					if (isCenteredPro || isCenterVV || isMondrian) {
						angular.forEach(ctrl.data.templateOpts, function(tmpl) {
							if (tmpl.name === 'Header 1') {
								tmpl.isDisabled = true;
							}
						});
					}
				}



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
