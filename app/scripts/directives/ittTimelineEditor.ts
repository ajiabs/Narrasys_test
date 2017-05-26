/**
 * Created by githop on 6/16/16.
 */

export default function ittTimelineEditor() {
  return {
    restrict: 'EA',
    template: `
      <div class="timeline__edit">
      	<form name="tlEditForm">
      		<label for="tlName">Name
      			<itt-validation-tip ng-if="tlEditForm.name.$invalid" text="Name is required"></itt-validation-tip>
      		</label>
      		<input type="text" name="name" ng-model="$ctrl._timeline.name.en" id="tlName" required>
      		<label for="tlDescription">Description</label>
      		<textarea id="tlDescription" name="description" placeholder="Insert Description..." ng-model="$ctrl._timeline.description.en"></textarea>
         <itt-guest-accessible-url narrative="$ctrl.narrative" timeline="$ctrl._timeline"></itt-guest-accessible-url>
      		<label>Hidden</label>
      		<input type="checkbox" ng-model="$ctrl._timeline.hidden"/>
      		<itt-enable-socialshare narrative="$ctrl.narrative" timeline="$ctrl._timeline"></itt-enable-socialshare>
      		<div class="ancillaryNav">
      			<button class="button" ng-disabled="tlEditForm.$invalid || $ctrl._timeline.error" ng-click="$ctrl.onUpdate({t: $ctrl._timeline})">Save</button>
      			<button class="button" ng-click="$ctrl.confirmDelete()">Delete</button>
      			<button class="button" ng-click="$ctrl.onDone()">Cancel</button>
      		</div>
      	</form>
      </div>
      <itt-modal modal-class="timeline__delete" ng-if="$ctrl.underDelete">
      		<h2>Are you sure?</h2>
      		<p>delete: </p>
      		<p class="under__delete"><strong>{{$ctrl._timeline.name.en}}?</strong></p>
      		<button ng-click="$ctrl.onDelete({t: $ctrl._timeline})">yes</button>
      		<button ng-click="$ctrl.underDelete = false">no</button>
      </itt-modal>`,
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
    controllerAs: '$ctrl',
    bindToController: true
  };
}
