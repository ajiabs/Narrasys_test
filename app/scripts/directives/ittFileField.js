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
				'	<div class="label">File</div>',
				'	<i ng-if="ittItemForm.itemAsset.$invalid">File is required</i>',
				'	<div class="input" ng-include="\'templates/producer/upload-producer.html\'"></div>',
				'</div>'
			].join(' ')
		};
	}


})();
