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
	        	doValidate: '=?'
			},
			template: [
			'<div class="field">',
			'	<div class="label">Question text</div>',
			'	<div class="input" do-validate="qText.doValidate" sxs-input-i18n="qText.data.data._plugin.questiontext" x-inputtype="\'textarea\'"></div>',
			'</div>'
			].join(' '),
			controller: [angular.noop],
			controllerAs: 'qText',
			bindToController: true
	    };
	}


})();
