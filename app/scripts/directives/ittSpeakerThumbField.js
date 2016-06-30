/**
 * Created by githop on 6/30/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittSpeakerThumpField', ittSpeakerThumpField);

	function ittSpeakerThumpField() {
	    return {
	        restrict: 'EA',
	        scope: true,
			template: [
			'<div class="field">',
			'	<div class="label">Speaker thumbnail</div>',
			'	<div class="input" ng-include="\'templates/producer/upload-producer.html\'"></div>',
			'</div>'
			].join(' ')
	    };
	}


})();
