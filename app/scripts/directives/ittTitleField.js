/**
 * Created by githop on 6/30/16.
 */
(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittTitleField', ittTitleField);

	function ittTitleField() {
	    return {
	        restrict: 'EA',
	        scope: true,
			template: [
			'<div class="field">',
			'	<div class="label">Title [{{appState.lang}}]</div>',
			'	<div class="input" sxs-input-i18n="item.title" x-inputtype="\'input\'" autofocus></div>',
			'</div>'
			].join(' ')
	    };
	}


})();
