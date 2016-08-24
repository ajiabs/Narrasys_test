/**
 * Created by githop on 6/30/16.
 */
(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittQuestionTextField', ittQuestionTextField);

	function ittQuestionTextField() {
	    return {
	        restrict: 'EA',
	        scope: {
	        	data: "=",
	        	doValidate: '=?',
				ittItemForm: '=?'
			},
			template: [
				'<div class="field">',
				'	<div class="label">Question text</div>',
				'	<itt-validation-tip ng-if="$ctrl.ittItemForm[$ctrl.textAreaName].$invalid" text="Question Text is a required field"></itt-validation-tip>',
				'	<div class="input" do-validate="$ctrl.doValidate" on-emit-name="$ctrl.onName($taName)" sxs-input-i18n="$ctrl.data.data._plugin.questiontext" x-inputtype="\'textarea\'"></div>',
				'</div>'
			].join(' '),
			controller: [function() {
				var ctrl = this;
				ctrl.onName = onName;

				function onName(v) {
					console.log("name!", v);
					ctrl.textAreaName = v;
				}
			}],
			controllerAs: '$ctrl',
			bindToController: true
	    };
	}


})();
