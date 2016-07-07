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
	        scope: true,
			template: [
			'<div class="field">',
			'	<div class="label">Question text</div>',
			'	<div class="input" sxs-input-i18n="item.data._plugin.questiontext" x-inputtype="\'textarea\'"></div>',
			'</div>'
			].join(' ')
	    };
	}


})();
