/**
 * Created by githop on 6/16/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittTimelineEditor', ittTimelineEditor);

	function ittTimelineEditor() {
	    return {
	        restrict: 'EA',
			template: [
				'<div class="narrative__edit">',
				'	<h3>Sort Order: <small>{{tEditor._timeline.sort_order}}</small></h3>',
				'	<label for="tlName">Name</label>',
				'	<input type="text" ng-model="tEditor._timeline.name.en" id="tlName">',
				'	<label for="tlDescription">Description</label>',
				'	<textarea id="tlDescription" ng-model="tEditor._timeline.description.en"></textarea>',
				'	<label for="tlPath">Path</label>',
				'	<input id="tlPath" type="text" ng-model="tEditor._timeline.path_slug.en"/>',
				'	<div class="ancillaryNav">',
				'		<button class="button" ng-click="tEditor.onUpdate({t: tEditor._timeline})">update</button>',
				'		<button class="button" ng-click="tEditor.onDone()">cancel</button>',
				'	</div>',
				'</div>'
			].join(' '),
	        scope: {
				timeline:'=',
				onUpdate: '&',
				onDone: '&'
			},
			controller: function() {
				var ctrl = this;
				ctrl._timeline = angular.copy(this.timeline);
			},
			controllerAs: 'tEditor',
			bindToController: true
	    };
	}


})();
