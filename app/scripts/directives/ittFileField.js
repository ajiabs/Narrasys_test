/**
 * Created by githop on 6/30/16.
 */

(function () {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittFileField', ittFileField);

	function ittFileField() {
		return {
			restrict: 'EA',
			scope: true,
			template: [
				'<div class="field">',
				'	<div class="label">File',
				'		<itt-validation-tip ng-if="ittItemForm.itemAsset.$invalid" text="File is required"></itt-validation-tip>',
				'	</div>',
				'	<div class="input" ng-include="\'templates/producer/upload-producer.html\'"></div>',
				'</div>'
			].join(' ')
		};
	}


})();
