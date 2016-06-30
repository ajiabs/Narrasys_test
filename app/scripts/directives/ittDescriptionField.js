/**
 *
 * Created by githop on 6/30/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittDescriptionField', ittDescriptionField);

	function ittDescriptionField() {
	    return {
	        restrict: 'EA',
	        scope: true,
			template: [
			'<div class="field">',
			'	<div class="label">Description [{{appState.lang}}]</div>',
			'	<div class="input" sxs-input-i18n="item.description" x-inputtype="\'textarea\'"></div>',
			'</div>'
			].join(' ')
	    };
	}


})();
