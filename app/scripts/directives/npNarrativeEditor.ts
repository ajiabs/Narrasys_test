/**
 * Created by githop on 6/16/16.
 */

import { createInstance, ICustomer, INarrative } from '../../models';

import { SOCIAL_IMAGE_SQUARE, SOCIAL_IMAGE_WIDE } from '../../constants';
import { IUploadsService, Partial } from '../../interfaces';
import { existy, pick } from '../services/ittUtils';
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
    <div ng-show="$ctrl._containerInfo && $ctrl.canAccess">
      <label for="nCustomer">Customer
        <itt-validation-tip ng-if="nEditForm.customer.$invalid" text="A customer must be set"></itt-validation-tip>
      </label>
      <select id="nCustomer" name="customer" required ng-model="$ctrl.selectedCustomer"
              ng-change="$ctrl.selectCustomer($ctrl.selectedCustomer)"
              ng-options="cust.name for cust in $ctrl._customers track by cust._id"></select></br>
    </div>
    <div ng-if="$ctrl.selectedCustomer && $ctrl._containerInfo == null">
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
    <input id="nSupportUrl" type="text" name="supportUrl" itt-valid-url placeholder="link for support"
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
  data?: { narrative: Partial<INarrative>, containerId: string };
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
  private _customers: ICustomer[];
  private _containerInfo: any;
  static $inject = ['authSvc', 'uploadsService'];

  constructor(private authSvc, private uploadsService: IUploadsService) {
    //
  }

  $onInit() {
    this._narrative = angular.copy(this.narrative);
    this._customers = angular.copy(this.customers);
    this._containerInfo = angular.copy(this.containerInfo);

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
    if (this._narrative == null) {
      return;
    }

    if (this._narrative.guest_access_allowed === false) {
      this._narrative.enable_social_sharing = false;
      this._narrative.disableSocialshare = true;
    } else {
      this._narrative.disableSocialshare = false;
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
    } else if (existy(this._containerInfo)) {
      const { containerId } = this._containerInfo;
      this.onUpdate({ data: { narrative, containerId } });
    } else {
      this.onUpdate({ $narrative: narrative });
    }

  }

  private _setNameFromContainer() {
    if (existy(this._containerInfo)) {
      if (existy(this._narrative)) {
        this._narrative.name = this._containerInfo.name;
      } else {
        this._narrative = { name: this._containerInfo.name };
      }
    }
  }

  private _setCustomer() {
    if (this.customers && this._customers.length === 1) {
      this.selectCustomer(this._customers[0]);
    } else {
      if (existy(this._narrative) || existy(this._containerInfo)) {
        const cId = existy(this._containerInfo) && this._containerInfo.customerId || this._narrative.customer_id;
        this.selectCustomer(this._customers.filter((c: ICustomer) => c._id === cId)[0]);
      } else {
        this._customers.unshift({ name: 'Select a Customer' } as any);
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

// export default function ittNarrativeEditor() {
//   return {
//     restrict: 'EA',
//     template: `
// <div class="narrative__edit">
//   <h2>Narrative Settings</h2>
//   <form name="nEditForm">
//     <div ng-show="$ctrl._containerInfo && $ctrl.canAccess">
//       <label for="nCustomer">Customer
//         <itt-validation-tip ng-if="nEditForm.customer.$invalid" text="A customer must be set"></itt-validation-tip>
//       </label>
//       <select id="nCustomer" name="customer" required ng-model="$ctrl.selectedCustomer"
//               ng-change="$ctrl.selectCustomer($ctrl.selectedCustomer)"
//               ng-options="cust.name for cust in $ctrl._customers track by cust._id"></select></br>
//     </div>
//     <div ng-if="$ctrl.selectedCustomer && $ctrl._containerInfo == null">
//       <h5>{{$ctrl.selectedCustomer.name}}</h5>
//     </div>
//     <label id="nName">Narrative Title
//       <itt-validation-tip ng-if="nEditForm.name.$invalid" text="Title is required"></itt-validation-tip>
//     </label>
//     <input for="nName" type="text" name="name" placeholder="Add Narrative Title"
//            ng-model="$ctrl._narrative.name.en" required>
//     <label for="nDescription">Description</label>
//     <textarea id="nDescription" name="description" placeholder="Add a Description"
//               ng-model="$ctrl._narrative.description.en"></textarea>
//     <div ng-if="!$ctrl.hidePathSlug">
//       <itt-guest-accessible-url narrative="$ctrl._narrative" sub-domain="{{$ctrl._narrative.narrative_subdomain}}"
//                                 customer="$ctrl.selectedCustomer"></itt-guest-accessible-url>
//     </div>
//     <label for="nSupportUrl">Support Url
//       <itt-validation-tip ng-if="nEditForm.supportUrl.$invalid" text="Not a valid URL"></itt-validation-tip>
//     </label>
//     <input id="nSupportUrl" type="text" name="supportUrl" itt-valid-url placeholder="link for support"
//            ng-model="$ctrl._narrative.support_url"/>
//
//     <div class="narrative-flags">
//       <div>
//         <input id="nNewWindow" type="checkbox" ng-model="$ctrl._narrative.disable_new_window"/>
//         <label for="nNewWindow">Disable New Window</label>
//       </div>
//
//       <div>
//         <input id="nDisableNav" type="checkbox" ng-model="$ctrl._narrative.disable_navigation"/>
//         <label for="nDisableNav">Disable Navigation</label>
//       </div>
//
//       <div>
//         <input
//           id="nGuestAccess"
//           type="checkbox"
//           ng-change="$ctrl.guestAccessEffects()"
//           ng-model="$ctrl._narrative.guest_access_allowed"/>
//         <label for="nGuestAccess">Enable Guest Access</label>
//       </div>
//
//       <div ng-if="$ctrl.trueAdmin && $ctrl._narrative._id">
//         <input
//           id="socialshare-checkbox"
//           type="checkbox"
//           ng-disabled="$ctrl._narrative.disableSocialshare"
//           ng-model="$ctrl._narrative.enable_social_sharing"/>
//         <label for="socialshare-checkbox">Enable Socialshare</label>
//       </div>
//     </div>
//
//     <itt-enable-socialshare
//       ng-if="$ctrl.trueAdmin && $ctrl._narrative._id"
//       container-id="{{$ctrl.selectedCustomer.root_container_id}}"
//       editor-form="nEditForm"
//       narrative="$ctrl._narrative">
//     </itt-enable-socialshare>
//     <div class="ancillaryNav">
//       <button class="done" ng-click="$ctrl.handleUpdate($ctrl._narrative)"
//               ng-disabled="nEditForm.$invalid || $ctrl._narrative.error">Save
//       </button>
//       <button class="done" ng-click="$ctrl.onDone({$event: $event})">Cancel</button>
//     </div>
//   </form>
// </div>`,
//     scope: {
//       narrative: '=?',
//       customers: '=',
//       containerInfo: '=?',
//       hidePathSlug: '=?',
//       onDone: '&',
//       onUpdate: '&'
//     },
//     controllerAs: '$ctrl',
//     bindToController: true,
//     controller: ['ittUtils', 'authSvc', 'uploadsService', function (ittUtils, authSvc, uploadsService) {
//       const ctrl = this;
//       const existy = ittUtils.existy;
//
//       angular.extend(ctrl, {
//         trueAdmin: authSvc.userHasRole('admin'),
//         canAccess: authSvc.userHasRole('admin') || authSvc.userHasRole('customer admin'),
//         _narrative: angular.copy(ctrl.narrative),
//         _customers: angular.copy(ctrl.customers),
//         _containerInfo: angular.copy(ctrl.containerInfo),
//         selectedCustomer: null,
//         //
//         handleUpdate,
//         selectCustomer,
//         guestAccessEffects
//       });
//
//       _onInit();
//
//       function _onInit() {
//         _setNameFromContainer();
//         _setCustomer();
//         guestAccessEffects();
//       }
//
//       function guestAccessEffects() {
//
//         if (ctrl._narrative == null) {
//           return;
//         }
//
//         if (ctrl._narrative.guest_access_allowed === false) {
//           ctrl._narrative.enable_social_sharing = false;
//           ctrl._narrative.disableSocialshare = true;
//         } else {
//           ctrl._narrative.disableSocialshare = false;
//         }
//       }
//
//       //set selected customer on-change of dropdown select
//       function selectCustomer(cust) {
//         ctrl.selectedCustomer = cust;
//       }
//
//       function handleUpdate(n) {
//         //use selected customer from setCustomer() or from drop down select
//         if (existy(ctrl.selectedCustomer)) {
//           n.customer_id = ctrl.selectedCustomer._id;
//
//         }
//         const fields = [
//           'name',
//           'description',
//           'customer_id',
//           'guest_access_allowed',
//           'enable_social_sharing',
//           'narrative_image_ids',
//           'path_slug',
//           'support_url',
//           'disable_navigation',
//           'disable_new_window',
//           '_id'
//         ];
//
//         const narrative = ittUtils.pick(n, fields);
//         const socialImagesToUpload: Array<{file: FileList, tag: string}> = [];
//         if (n.social_image_square) {
//           socialImagesToUpload.push({file: n.social_image_square.file, tag: SOCIAL_IMAGE_SQUARE});
//         }
//
//         if (n.social_image_wide) {
//           socialImagesToUpload.push({file: n.social_image_wide.file, tag: SOCIAL_IMAGE_WIDE});
//         }
//
//         //if there are pending social image uploads, upload them
//         //then push the asset ID in the img ids array.
//         if (socialImagesToUpload.length > 0) {
//           uploadsService.uploadTaggedFiles(socialImagesToUpload, ctrl.selectedCustomer.root_container_id)
//             .then((assets) => {
//               assets.forEach((asset) => narrative.narrative_image_ids.push(asset.file._id));
//               uploadsService.resetUploads();
//               ctrl.onUpdate({n: narrative});
//               return;
//             });
//         } else if (existy(ctrl._containerInfo)) {
//           ctrl.onUpdate({data: {n: narrative, c: ctrl._containerInfo.containerId}});
//         } else {
//           ctrl.onUpdate({n: narrative});
//         }
//
//       }
//
//       //check for name or path as given input from the containerInfo param
//       //set input name/path on narrative if it exists
//       //otherwise create narrative object and assign name/path
//       function _setNameFromContainer() {
//         if (existy(ctrl._containerInfo)) {
//           if (existy(ctrl._narrative)) {
//             ctrl._narrative.name = ctrl._containerInfo.name;
//           } else {
//             ctrl._narrative = {name: ctrl._containerInfo.name};
//           }
//         }
//       }
//
//       function _setCustomer() {
//         if (ctrl._customers.length === 1) {
//           ctrl.selectedCustomer = ctrl._customers[0];
//         } else {
//           if (existy(ctrl._narrative) || existy(ctrl._containerInfo)) {
//             const cId = existy(ctrl._containerInfo) && ctrl._containerInfo.customerId || ctrl._narrative.customer_id;
//             ctrl.selectedCustomer = ctrl._customers.filter(function (c) {
//               return c._id === cId;
//             })[0];
//           } else {
//             ctrl._customers.unshift({name: 'Select a Customer'});
//           }
//         }
//       }
//     }]
//   };
// }
