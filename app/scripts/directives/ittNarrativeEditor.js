/**
 * Created by githop on 6/16/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittNarrativeEditor', ittNarrativeEditor);

	function ittNarrativeEditor() {
	    return {
	        restrict: 'EA',
			template: [
				'<div class="narrative__edit">',
				'	<label id="nName">Name of Narrative</label>',
				'	<input for="nName" type="text" ng-model="nEditor._narrative.name.en">',
				'	<label for="nDescription">Description</label>',
				'	<textarea id="nDescription" ng-model="nEditor._narrative.description.en"></textarea>',
				'	<label for="nPath">Path</label>',
				'	<input id="nPath" type="text" ng-model="nEditor._narrative.slug_path.en"/>',
				'	<label for="nSupportUrl">Support Url</label>',
				'	<input id="nSupportUrl" type="text" ng-model="nEditor._narrative.support_url"/>',
				'	<label for="nNewWindow">Disable New Window</label>',
				'	<input id="nNewWindow" type="checkbox" ng-model="nEditor._narrative.disable_new_window"/>',
				'	<label for="nDisableNav">Disable Navigation</label>',
				'	<input id="nDisableNav" type="checkbox" ng-model="nEditor._narrative.disable_navigation"/>',
				'	<label for="nGuestAccess">Disable Guest Access</label>',
				'	<input id="nGuestAccess" type="checkbox" ng-model="nEditor._narrative.guest_access_allowed"/>',
				'	<div class="ancillaryNav">',
				'		<button class="done" ng-click="nEditor.onUpdate({n: nEditor._narrative })">Save</button>',
				'		<button class="done" ng-click="nEditor.onDone()">Cancel</button>',
				'	</div>',
				'</div>'
			].join(' '),
	        scope: {
				narrative: '=',
				onDone: '&',
				onUpdate: '&'
			},
			controller: function() {
				var ctrl = this;
				//copy to dereference original narrative as we are two-way bound (one way binding available in 1.5)
				ctrl._narrative = angular.copy(this.narrative);
			},
			controllerAs: 'nEditor',
			bindToController: true
	    };
	}


})();
