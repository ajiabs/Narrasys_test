/**
 * Created by githop on 6/30/16.
 */
(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittImageField', ittImageField);

	function ittImageField() {
	    return {
	        restrict: 'EA',
	        scope: true,
			template: [
			'<div class="field" ng-if="selectService.showImageUpload()">',
			'	<div class="label">Image</div>',
			'	<div class="input" ng-include="\'templates/producer/upload-producer.html\'"></div>',
			'</div>'
			].join(' ')
	    };
	}


})();
