/**
 *
 * Created by githop on 6/30/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittAnnotationField', ittAnnotationField);

	function ittAnnotationField() {
	    return {
	        restrict: 'EA',
	        scope: {
	        	data: '=',
				ittItemForm: '='
			},
			template: [
				'<div class="field">',
				'	<div class="label">Annotation Text [{{$ctrl.lang}}]</div>',
				'	<itt-validation-tip ng-if="$ctrl.ittItemForm[$ctrl.textAreaName].$invalid" text="Annotation Text is a required field"></itt-validation-tip>',
				'	<div class="input" sxs-input-i18n="$ctrl.data.annotation" do-validate="true" x-inputtype="\'textarea\'" on-emit-name="$ctrl.onName($taName)" autofocus></div>',
				'</div>'
			].join(' '),
			controller: ['appState', function(appState) {
				var ctrl = this;
				ctrl.onName = onName;
				ctrl.lang = appState.lang;
				ctrl.textAreaName = '';

				function onName(v) {
					ctrl.textAreaName = v;

				}

			}],
			controllerAs: '$ctrl',
			bindToController: true
	    };
	}


})();
