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
				'	<textarea id="tlDescription" placeholder="Insert Description..." ng-model="tEditor._timeline.description.en"></textarea>',
				'	<label for="tlPath">Path</label>',
				'	<input id="tlPath" type="text" placeholder="path-to-episode" ng-model="tEditor._timeline.path_slug.en"/>',
				'	<label>Hidden</label>',
				'	<input type="checkbox" ng-model="tEditor._timeline.hidden"/>',
				'	<div class="ancillaryNav">',
				'		<button class="button" ng-click="tEditor.onUpdate({t: tEditor._timeline})">Save</button>',
				'		<button class="button" ng-click="tEditor.confirmDelete()">Delete</button>',
				'		<button class="button" ng-click="tEditor.onDone()">cancel</button>',
				'	</div>',
				'</div>',
				'<itt-modal modal-class="timeline__delete" ng-if="tEditor.underDelete">',
				'		<h2>Are you sure?</h2>',
				'		<p>delete: </p>',
				'		<p class="under__delete"><strong>{{tEditor._timeline.name.en}}?</strong></p>',
				'		<button ng-click="tEditor.onDelete({t: tEditor._timeline})">yes</button>',
				'		<button ng-click="tEditor.underDelete = false">no</button>',
				'</itt-modal>'
			].join(' '),
	        scope: {
				timeline:'=',
				onUpdate: '&',
				onDelete: '&',
				onDone: '&'
			},
			controller: ['ittUtils', function(ittUtils) {
				var ctrl = this;
				var existy = ittUtils.existy;

				ctrl.confirmDelete = confirmDelete;
				ctrl.underDelete = false;

				if (existy(ctrl.timeline) && ctrl.timeline.isTemp === true) {
					ctrl._timeline = ctrl.timeline;
				} else {
					ctrl._timeline = angular.copy(ctrl.timeline);
				}

				function confirmDelete() {
					ctrl.underDelete = true;
				}

			}],
			controllerAs: 'tEditor',
			bindToController: true
	    };
	}


})();
