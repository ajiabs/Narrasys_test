/**
 * Created by githop on 6/30/16.
 */
(function () {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittQuestionTypeSelect', ittQuestionTypeSelect);

	function ittQuestionTypeSelect() {
		return {
			restrict: 'EA',
			scope: {
				data: '='
			},
			template: [
				'<div class="field">',
				'	<div class="label">Question type</div>',
				'	<div class="input">',
				'	<select ng-model="qTypeSelect.data.data._plugin.questiontype" ng-options="{{qTypeSelect.setNgOpts(\'questionType\')}}"></select>',
				'	</div>',
				'</div>'
			].join(' '),
			controller: ['selectService', function (selectService) {
				var ctrl = this;
				ctrl.setNgOpts = setNgOpts;
				ctrl.getSelectOpts = selectService.getSelectOpts;
				onInit();

				function onInit() {
					//initialize layout data by forcing a pass through the select service.
					selectService.onSelectChange(ctrl.data, {});
				}

				function setNgOpts(type) {
					return "option.value as option.name for option in qTypeSelect.getSelectOpts(" + "'" + type + "'" + ")";
				}
			}],
			controllerAs: 'qTypeSelect',
			bindToController: true
		};
	}


})();
