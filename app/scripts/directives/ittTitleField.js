/**
 * Created by githop on 6/30/16.
 */
(function () {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittTitleField', ittTitleField);

	function ittTitleField() {
		return {
			restrict: 'EA',
			scope: {
				data: '=',
				modelOpts: '=?',
				doValidate: '=?'
			},
			template: [
				'<div class="field" ng-if="titleField.isVisible(\'titleField\')">',
				'	<div class="label">Title [{{titleField.lang}}]</div>',
				'	<div class="input" ng-model-options="titleField.modelOpts" do-validate="titleField.doValidate" sxs-input-i18n="titleField.data.title" x-inputtype="\'input\'" autofocus></div>',
				'</div>'
			].join(' '),
			controller: ['appState', 'ittUtils', 'selectService', function (appState, ittUtils, selectService) {
				var ctrl = this;
				ctrl.lang = appState.lang;
				ctrl.isVisible = selectService.getVisibility;

				if (!ittUtils.existy(ctrl.modelOpts)) {
					ctrl.modelOpts = {updateOn: 'default'};
				}

			}],
			controllerAs: 'titleField',
			bindToController: true
		};
	}


})();
