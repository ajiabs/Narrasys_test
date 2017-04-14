/**
 * Created by githop on 6/16/16.
 */

export default function ittTimelineEditor() {
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
      '   <itt-guest-accessible-url narrative="tEditor.narrative" timeline="tEditor._timeline"></itt-guest-accessible-url>',
      '		<label>Hidden</label>',
      '		<input type="checkbox" ng-model="tEditor._timeline.hidden"/>',
      '		<div class="ancillaryNav">',
      '			<button class="button" ng-disabled="tlEditForm.$invalid || tEditor._timeline.error" ng-click="tEditor.onUpdate({t: tEditor._timeline})">Save</button>',
      '			<button class="button" ng-click="tEditor.confirmDelete()">Delete</button>',
      '			<button class="button" ng-click="tEditor.onDone()">Cancel</button>',
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
