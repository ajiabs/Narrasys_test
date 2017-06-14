import {pick} from '../services/ittUtils';
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
    <textarea id="tlDescription" name="description" placeholder="Insert Description..."
              ng-model="$ctrl._timeline.description.en"></textarea>
    <itt-guest-accessible-url narrative="$ctrl.narrative" timeline="$ctrl._timeline"></itt-guest-accessible-url>
    <label>Hidden</label>
    <input type="checkbox" ng-model="$ctrl._timeline.hidden"/>
    <itt-enable-socialshare
      ng-if="$ctrl.trueAdmin"
      narrative="$ctrl.narrative"
      container-id="{{$ctrl.containerId}}"
      timeline="$ctrl._timeline">
    </itt-enable-socialshare>
    <div class="ancillaryNav">
      <button class="button" ng-disabled="tlEditForm.$invalid || $ctrl._timeline.error"
              ng-click="$ctrl.handleUpdate($ctrl._timeline)">Save
      </button>
      <button class="button" ng-click="$ctrl.confirmDelete()">Delete</button>
      <button class="button" ng-click="$ctrl.onDone()">Cancel</button>
    </div>
  </form>
</div>
<itt-modal modal-class="timeline__delete" ng-if="$ctrl.underDelete">
  <h2>Are you sure?</h2>
  <p>delete: </p>
  <p class="under__delete"><strong>{{$ctrl._timeline.name.en}}?</strong></p>
  <button ng-click="$ctrl.onDelete($ctrl._timeline)">yes</button>
  <button ng-click="$ctrl.underDelete = false">no</button>
</itt-modal>`,
    scope: {
      timeline: '=',
      narrative: '=',
      containerId: '@?',
      onUpdate: '&',
      onDelete: '&',
      onDone: '&'
    },
    controller: ['$location', 'ittUtils', 'config', 'uploadsService', 'authSvc',
      function ($location, ittUtils, config, uploadsService, authSvc) {
      const ctrl = this;
      const existy = ittUtils.existy;
      ctrl.confirmDelete = confirmDelete;
      ctrl.handleUpdate = handleUpdate;
      ctrl.underDelete = false;
      ctrl.trueAdmin = authSvc.userHasRole('admin');
      onInit();

      function onInit() {
        ctrl.host = $location.protocol() + ':' + config.apiDataBaseUrl;
        if (existy(ctrl.timeline) && ctrl.timeline.isTemp === true) {
          ctrl._timeline = ctrl.timeline;
        } else {
          ctrl._timeline = angular.copy(ctrl.timeline);
        }
      }


      function handleUpdate(t) {


        const tlFileds = [
          '_id',
          'name',
          'description',
          'hidden',
          'sort_order',
          'path_slug',
          'episode_segments',
          'timeline_image_ids'
        ];

        const tlToSave = pick(t, tlFileds);

        let socialImagesToUpload: {file: FileList, tag: string}[] = [];
        if (t.square) {
          socialImagesToUpload.push({file: t.square.file, tag: 'square'});
        }

        if (t.wide) {
          socialImagesToUpload.push({file: t.wide.file, tag: 'wide'});
        }

        if (socialImagesToUpload.length > 0) {
          uploadsService.uploadTaggedFiles(socialImagesToUpload, ctrl.containerId)
            .then((assets) => {
              assets.forEach((asset) => tlToSave.timeline_image_ids.push(asset.file._id));
              uploadsService.resetUploads();
              ctrl.onUpdate({t: tlToSave});
              return;
            });
        } else {
          ctrl.onUpdate({t: tlToSave});
        }

      }

      function confirmDelete() {
        ctrl.underDelete = true;
      }

    }],
    controllerAs: '$ctrl',
    bindToController: true
  };
}
