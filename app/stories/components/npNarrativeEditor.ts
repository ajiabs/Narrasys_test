// @npUpgrade-stories-true
/**
 * Created by githop on 6/16/16.
 */

import { createInstance, ICustomer, INarrative } from '../../models';

import { SOCIAL_IMAGE_SQUARE, SOCIAL_IMAGE_WIDE } from '../../constants';
import { IUploadsService, Partial } from '../../interfaces';
import { existy, pick } from '../../shared/services/ittUtils';
/* tslint:disable */
/**
 * @ngdoc directive
 * @name iTT.directive:ittNarrativeEditor
 * @restrict 'EA'
 * @scope
 * @description
 * A presentational component used to edit narratives
 * @param {Object} narrative the narrative to edit
 * @param {Array} customers an array of customers associated with the narrative
 * @param {customerId:string, containerId:string, name:string} containerInfo container specific info to set on the narrative
 * @param {Function} onDone output to call when on cancel.
 * @param {function} onUpdate output to call when saving.
 * @example
 * <pre>
 *  //containers page
 *  <np-narrative-editor
 customers="customers"
 container-info="{containerId: container._id, customerId: container.customer_id, name: container.name}"
 on-done="toggleNarrativeModal()"
 on-update="postNewNarrative(data)">
 </np-narrative-editor>

 //narrative show/index pages
 <np-narrative-editor
 customers="$ctrl.selectedCustomer"
 narrative="$ctrl.narrativeToEdit"
 on-done="$ctrl.closeAddOrEditModal()"
 on-update="$ctrl.addOrUpdateNarrative(n)">
 </np-narrative-editor>
 * </pre>
 */
/* tslint:enable */

const TEMPLATE = `
<div class="narrative__edit">
  <h2>Narrative Settings</h2>
  <form name="nEditForm">
    <div ng-show="$ctrl.containerInfo && $ctrl.canAccess">
      <label for="nCustomer">Customer
        <itt-validation-tip ng-if="nEditForm.customer.$invalid" text="A customer must be set"></itt-validation-tip>
      </label>
      <select id="nCustomer" name="customer" required ng-model="$ctrl.selectedCustomer"
              ng-change="$ctrl.selectCustomer($ctrl.selectedCustomer)"
              ng-options="cust.name for cust in $ctrl.customers track by cust._id"></select></br>
    </div>
    <div ng-if="$ctrl.selectedCustomer && $ctrl.containerInfo == null">
      <h5>{{$ctrl.selectedCustomer.name}}</h5>
    </div>
    <label id="nName">Narrative Title
      <itt-validation-tip ng-if="nEditForm.name.$invalid" text="Title is required"></itt-validation-tip>
    </label>
    <input for="nName" type="text" name="name" placeholder="Add Narrative Title"
           ng-model="$ctrl.narrative.name.en" required>
    <label for="nDescription">Description</label>
    <textarea id="nDescription" name="description" placeholder="Add a Description"
              ng-model="$ctrl.narrative.description.en"></textarea>
    <div ng-if="!$ctrl.hidePathSlug">
      <np-guest-accessible-url
        narrative="$ctrl.narrative"
        sub-domain="{{$ctrl.narrative.narrative_subdomain}}"
        customer="$ctrl.selectedCustomer">
      </np-guest-accessible-url>
    </div>
    <label for="nSupportUrl">Support Url
      <itt-validation-tip ng-if="nEditForm.supportUrl.$invalid" text="Not a valid URL"></itt-validation-tip>
    </label>
    <input id="nSupportUrl" type="text" name="supportUrl" np-valid-url placeholder="link for support"
           ng-model="$ctrl.narrative.support_url"/>
    <div class="narrative-flags">
      <div>
        <input id="nNewWindow" type="checkbox" ng-model="$ctrl.narrative.disable_new_window"/>
        <label for="nNewWindow">Disable New Window</label>
      </div>
      <div>
        <input id="nDisableNav" type="checkbox" ng-model="$ctrl.narrative.disable_navigation"/>
        <label for="nDisableNav">Disable Navigation</label>
      </div>
      <div>
        <input
          id="nGuestAccess"
          type="checkbox"
          ng-change="$ctrl.guestAccessEffects()"
          ng-model="$ctrl.narrative.guest_access_allowed"/>
        <label for="nGuestAccess">Enable Guest Access</label>
      </div>
      <div ng-if="$ctrl.trueAdmin && $ctrl.narrative._id">
        <input
          id="socialshare-checkbox"
          type="checkbox"
          ng-disabled="$ctrl.narrative.disableSocialshare"
          ng-model="$ctrl.narrative.enable_social_sharing"/>
        <label for="socialshare-checkbox">Enable Socialshare</label>
      </div>
    </div>
    <itt-enable-socialshare
      ng-if="$ctrl.trueAdmin && $ctrl.narrative._id"
      container-id="{{$ctrl.selectedCustomer.root_container_id}}"
      editor-form="nEditForm"
      narrative="$ctrl.narrative">
    </itt-enable-socialshare>
    <div class="ancillaryNav">
      <button class="done" ng-click="$ctrl.handleUpdate($ctrl.narrative)"
              ng-disabled="nEditForm.$invalid || $ctrl.narrative.error">Save
      </button>
      <button class="done" ng-click="$ctrl.cancel()">Cancel</button>
    </div>
  </form>
</div>
`;

interface IContainerInfo {
  containerId: string;
  customerId: string;
  name: string;
}

interface INarrativeEditorEmit {
  $narrative?: Partial<INarrative>;
  $data?: { narrative: Partial<INarrative>, containerId: string };
}

interface INarrativeEditorBindings extends ng.IComponentController {
  narrative: INarrative;
  customers: ICustomer[];
  containerInfo: IContainerInfo;
  hidePathSlug: any;
  onDone: ($undo: any) => any;
  onUpdate: (a: INarrativeEditorEmit) => INarrativeEditorEmit;
}

class NarrativeEditorController implements INarrativeEditorBindings {
  narrative: INarrative;
  customers: ICustomer[];
  containerInfo: IContainerInfo;
  hidePathSlug: any;
  onDone: ($undo: any) => any;
  onUpdate: (a: INarrativeEditorEmit) => INarrativeEditorEmit;
  selectedCustomer: ICustomer;
  private _narrative: Partial<INarrative>;
  static $inject = ['authSvc', 'uploadsService'];

  constructor(private authSvc, private uploadsService: IUploadsService) {
    //
  }

  $onInit() {
    if (this.narrative) {
      if (this.narrative.social_image_square != null || this.narrative.social_image_wide != null) {
        this.narrative.social_image_wide = null;
        this.narrative.social_image_square = null;
      }
    }
    this._narrative = angular.copy(this.narrative);
    this._setNameFromContainer();
    this._setCustomer();
    this.guestAccessEffects();
  }

  cancel() {
    this.narrative = angular.copy(this._narrative) as INarrative;
    this.onDone({ $undo: this.narrative });
  }

  trueAdmin() {
    return this.authSvc.userHasRole('admin');
  }

  canAccess() {
    return this.trueAdmin() || this.authSvc.userHasRole('customer admin');
  }

  guestAccessEffects() {
    if (this.narrative == null) {
      return;
    }

    if (this.narrative.guest_access_allowed === false) {
      this.narrative.enable_social_sharing = false;
      this.narrative.disableSocialshare = true;
    } else {
      this.narrative.disableSocialshare = false;
    }
  }

  selectCustomer(c: ICustomer) {
    this.selectedCustomer = c;
  }

  handleUpdate(n: Partial<INarrative>) {
    //use selected customer from setCustomer() or from drop down select
    if (existy(this.selectedCustomer)) {
      n.customer_id = this.selectedCustomer._id;

    }
    const fields: Array<keyof INarrative> = [
      'name',
      'description',
      'customer_id',
      'guest_access_allowed',
      'enable_social_sharing',
      'narrative_image_ids',
      'path_slug',
      'support_url',
      'disable_navigation',
      'disable_new_window',
      '_id'
    ];

    const narrative = createInstance<INarrative>('Narrative', pick(n, fields));
    const socialImagesToUpload: Array<{file: FileList, tag: string}> = [];
    if (n.social_image_square) {
      socialImagesToUpload.push({ file: n.social_image_square.file, tag: SOCIAL_IMAGE_SQUARE });
    }

    if (n.social_image_wide) {
      socialImagesToUpload.push({ file: n.social_image_wide.file, tag: SOCIAL_IMAGE_WIDE });
    }

    //if there are pending social image uploads, upload them
    //then push the asset ID in the img ids array.
    if (socialImagesToUpload.length > 0) {
      this.uploadsService.uploadTaggedFiles(socialImagesToUpload, this.selectedCustomer.root_container_id)
        .then((assets) => {
          assets.forEach((asset: any) => narrative.narrative_image_ids.push(asset.file._id));
          this.uploadsService.resetUploads();
          this.onUpdate({ $narrative: narrative });
          return;
        });
    } else if (existy(this.containerInfo)) {
      const { containerId } = this.containerInfo;
      this.onUpdate({ $data: { narrative, containerId } });
    } else {
      this.onUpdate({ $narrative: narrative });
    }
  }

  private _setNameFromContainer() {
    if (existy(this.containerInfo)) {
      if (existy(this.narrative)) {
        this.narrative.name = this.containerInfo.name;
      } else {
        this.narrative = { name: this.containerInfo.name };
      }
    }
  }

  private _setCustomer() {
    if (this.customers && this.customers.length === 1) {
      this.selectCustomer(this.customers[0]);
    } else {
      if (existy(this.narrative) || existy(this.containerInfo)) {
        const cId = existy(this.containerInfo) && this.containerInfo.customerId || this.narrative.customer_id;
        this.selectCustomer(this.customers.filter((c: ICustomer) => c._id === cId)[0]);
      } else {
        this.customers.unshift({ name: 'Select a Customer' } as any);
      }
    }
  }
}

export class NarrativeEditor implements ng.IComponentOptions {
  bindings: any = {
    narrative: '<?',
    customers: '<',
    containerInfo: '<?',
    hidePathSlug: '<?',
    onDone: '&',
    onUpdate: '&'
  };
  template: string = TEMPLATE;
  controller = NarrativeEditorController;
  static Name: string = 'npNarrativeEditor'; // tslint:disable-line
}

