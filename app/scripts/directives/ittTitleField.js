/**
 * Created by githop on 6/30/16.
 */
(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittTitleField', ittTitleField);

	function ittTitleField() {
	    return {
	        restrict: 'EA',
	        scope: {
				data: '=',
				modelOpts: '=?'
			},
			template: [
			'<div class="field">',
			'	<div class="label">Title [{{titleField.lang}}]</div>',
			'	<div class="input" ng-model-options="titleField.modelOpts" sxs-input-i18n="titleField.data.title" x-inputtype="\'input\'" autofocus></div>',
			'</div>'
			].join(' '),
			controller: ['appState', 'ittUtils', function(appState, ittUtils) {
				var ctrl = this;
				ctrl.lang = appState.lang;
				if (!ittUtils.existy(ctrl.modelOpts)) {
					ctrl.modelOpts = {updateOn: 'default'};
				}
			}],
			controllerAs: 'titleField',
			bindToController: true
	    };
	}


})();
