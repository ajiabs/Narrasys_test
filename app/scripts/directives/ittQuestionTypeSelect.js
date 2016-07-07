/**
 * Created by githop on 6/30/16.
 */
(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittQuestionTypeSelect', ittQuestionTypeSelect);

	function ittQuestionTypeSelect() {
	    return {
	        restrict: 'EA',
	        scope: true,
			template: [
			'<div class="field">',
			'	<div class="label">Question type</div>',
			'	<div class="input">',
			'	<select ng-model="item.data._plugin.questiontype">',
			'		<option value="mc-poll">Poll</option>',
			'		<option value="mc-formative">Formative</option>',
			'	</select>',
			'	</div>',
			'</div>'
			].join(' ')
	    };
	}


})();
