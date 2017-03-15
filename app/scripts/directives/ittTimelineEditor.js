/**
 * Created by githop on 6/16/16.
 */

(function () {
  'use strict';

  angular.module('com.inthetelling.story')
    .directive('ittTimelineEditor', ittTimelineEditor);

  function ittTimelineEditor() {
    return {
      restrict: 'EA',
      template: [
        '<div class="timeline__edit">',
        '	<form name="tlEditForm">',
        '		<label for="tlName">Name',
        '			<itt-validation-tip ng-if="tlEditForm.name.$invalid" text="Name is required"></itt-validation-tip>',
        '		</label>',
        '		<input type="text" name="name" ng-model="tEditor._timeline.name.en" id="tlName" required>',
        '		<label for="tlDescription">Description</label>',
        '		<textarea id="tlDescription" name="description" placeholder="Insert Description..." ng-model="tEditor._timeline.description.en"></textarea>',
        '   <div ng-if="tEditor.narrative.guest_access_allowed">',
        '		<label for="tlPath">Guest Accessible URL: <br> {{tEditor.host}}/#/story/{{tEditor.narrative.path_slug.en}}/{{tEditor._timeline.path_slug.en}}',
        '			<itt-validation-tip ng-if="tlEditForm.path.$invalid" text="Path is required"></itt-validation-tip>',
        '		</label>',
        '		<input id="tlPath" type="text" name="path" placeholder="path-to-episode" ng-model="tEditor._timeline.path_slug.en" required>',
        ' </div>',
        '		<label>Hidden</label>',
        '		<input type="checkbox" ng-model="tEditor._timeline.hidden"/>',
        '		<div class="ancillaryNav">',
        '			<button class="button" ng-disabled="tlEditForm.$invalid" ng-click="tEditor.onUpdate({t: tEditor._timeline})">Save</button>',
        '			<button class="button" ng-click="tEditor.confirmDelete()">Delete</button>',
        '			<button class="button" ng-click="tEditor.onDone()">cancel</button>',
        '		</div>',
        '	</form>',
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
        timeline: '=',
        narrative: '=',
        onUpdate: '&',
        onDelete: '&',
        onDone: '&'
      },
      controller: ['$location', 'ittUtils', 'config', function ($location, ittUtils, config) {
        var ctrl = this;
        var existy = ittUtils.existy;

        ctrl.confirmDelete = confirmDelete;
        ctrl.underDelete = false;
        ctrl.host = $location.protocol() + ':' + config.apiDataBaseUrl;

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
