/**
 * Created by githop on 6/30/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittSpeakerField', ittSpeakerField);

	function ittSpeakerField() {
	    return {
	        restrict: 'EA',
			template: [
			'<div class="field" ng-if="selectService.getVisibility(\'speakerField\')">',
			'	<div class="label">Speaker [{{appState.lang}}]</div>',
			'	<div class="input">',
			'		<div sxs-annotator-autocomplete="annotators" item="item" ng-model="item.annotator"></div>',
			'	</div>',
			'</div>'
			].join(' ')
	    };
	}


})();