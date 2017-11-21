// @npUpgrade-stories-true
import { existy, pick } from '../../shared/services/ittUtils';

import { SOCIAL_IMAGE_SQUARE, SOCIAL_IMAGE_WIDE } from '../../constants';
import { INarrative, ITempTimeline, ITimeline } from '../../models';
import { config } from '../../config';
/**
 * Created by githop on 6/16/16.
 */

const TEMPLATE = `
<div class="timeline__edit">
  <form name="tlEditForm">
    <label for="tlName">Name
      <itt-validation-tip ng-if="tlEditForm.name.$invalid" text="Name is required"></itt-validation-tip>
    </label>
    <input type="text" name="name" ng-model="$ctrl._timeline.name.en" id="tlName" required>
    <label for="tlDescription">Description</label>
    <textarea id="tlDescription" name="description" placeholder="Insert Description..."
              ng-model="$ctrl._timeline.description.en"></textarea>
    <np-guest-accessible-url narrative="$ctrl.narrative" timeline="$ctrl._timeline"></np-guest-accessible-url>
    <label>Hidden</label>
    <input type="checkbox" ng-model="$ctrl._timeline.hidden"/>
    <itt-enable-socialshare
      ng-if="$ctrl.trueAdmin"
      narrative="$ctrl.narrative"
      container-id="{{$ctrl.containerId}}"
      editor-form="tlEditForm"
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
<np-modal modal-class="timeline__delete" ng-if="$ctrl.underDelete">
  <h2>Are you sure?</h2>
  <p>delete: </p>
  <p class="under__delete"><strong>{{$ctrl._timeline.name.en}}?</strong></p>
  <button ng-click="$ctrl.onDelete({ t: $ctrl._timeline })">yes</button>
  <button ng-click="$ctrl.underDelete = false">no</button>
</np-modal>
`;

interface ITimelineEditorBindings extends ng.IComponentController {
  timeline: ITimeline;
  narrative: INarrative;
  containerId: string;
  onUpdate: ($ev: { $timeline: ITimeline }) => ({ $timeline: ITimeline });
  onDelete: ($ev: { $timeline: ITimeline }) => ({ $timeline: ITimeline });
  onDone: () => void;
}

class TimelineEditorController implements ITimelineEditorBindings {
  timeline: ITimeline | ITempTimeline;
  narrative: INarrative;
  containerId: string;
  onUpdate: ($ev: { $timeline: ITimeline }) => ({ $timeline: ITimeline });
  onDelete: ($ev: { $timeline: ITimeline }) => ({ $timeline: ITimeline });
  onDone: () => void;
  host: string;
  private _timeline: ITimeline;
  private trueAdmin: boolean;
  private underDelete: boolean = false;
  static $inject = ['$location', 'uploadsService', 'authSvc'];
  constructor(
    private $location: ng.ILocationService,
    private uploadsService,
    private authSvc) {
    //
  }

  $onInit() {
    this.host = this.$location.protocol() + ':' + config.apiDataBaseUrl;
    this.trueAdmin = this.authSvc.userHasRole('admin');
    if (existy(this.timeline) && (this.timeline as ITempTimeline).isTemp === true) {
      this._timeline = this.timeline;
    } else {
      this._timeline = angular.copy(this.timeline);
    }
  }

  handleUpdate(t: ITempTimeline) {
    const tlFileds: Array<keyof ITempTimeline> = [
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

    const socialImagesToUpload: Array<{file: FileList, tag: string}> = [];
    if (t.social_image_square) {
      socialImagesToUpload.push({ file: t.social_image_square.file, tag: SOCIAL_IMAGE_SQUARE });
    }

    if (t.social_image_wide) {
      socialImagesToUpload.push({ file: t.social_image_wide.file, tag: SOCIAL_IMAGE_WIDE });
    }

    if (socialImagesToUpload.length > 0) {
      this.uploadsService.uploadTaggedFiles(socialImagesToUpload, this.containerId)
        .then((assets) => {
          assets.forEach((asset: any) => tlToSave.timeline_image_ids.push(asset.file._id));
          this.uploadsService.resetUploads();
          this.onUpdate({ $timeline: tlToSave });
          return;
        });
    } else {
      this.onUpdate({ $timeline: tlToSave });
    }
  }

  confirmDelete() {
    this.underDelete = true;
  }
}

export class TimelineEditor implements ng.IComponentOptions {
  bindings: any = {
    timeline: '<',
    narrative: '<',
    containerId: '@?',
    onUpdate: '&',
    onDelete: '&',
    onDone: '&'
  };
  template: string = TEMPLATE;
  controller = TimelineEditorController;
  static Name: string = 'npTimelineEditor'; // tslint:disable-line
}
