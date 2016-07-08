/**
 *
 * Created by githop on 6/30/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittAnnotationField', ittAnnotationField);

	function ittAnnotationField() {
	    return {
	        restrict: 'EA',
	        scope: true,
			template: [
			'<div class="field">',
			'	<div class="label">Annotation Text [{{appState.lang}}]</div>',
			'	<div class="input" sxs-input-i18n="item.annotation" do-validate="true" x-inputtype="\'textarea\'" autofocus></div>',
			'</div>'
			].join(' ')
	    };
	}


})();
