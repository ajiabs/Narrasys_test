/**
 * Created by githop on 6/30/16.
 */
(function () {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittImageField', ittImageField);

	function ittImageField() {
		return {
			restrict: 'EA',
			template: [
				'<div class="field" ng-show="selectService.getVisibility(\'imageUpload\')">',
				'	<div class="label">Image</div>',
				'	<div class="input" ng-include="\'templates/producer/upload-producer.html\'"></div>',
				'</div>'
			].join(' ')
		};
	}


})();
