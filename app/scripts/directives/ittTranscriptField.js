/**
 * Created by githop on 6/30/16.
 */

(function () {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittTranscriptField', ittTranscriptField);

	function ittTranscriptField() {
		return {
			restrict: 'EA',
			scope: {
				data: '=',
				//not itemForm, which is a plain old JS object,
				//this is the 'IttItemForm' a ng-form defined at the head of item.html
				ittItemForm: '='
			},
			template: [
				'<div class="field">',
				'	<div class="label">Transcript [{{$ctrl.lang}}]</div>',
				'	<itt-validation-tip ng-if="$ctrl.ittItemForm[$ctrl.textAreaName].$invalid" text="Transcript is a required field"></itt-validation-tip>',
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
