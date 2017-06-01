/**
 * Created by githop on 6/16/16.
 */

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
 *  <itt-narrative-editor
 customers="customers"
 container-info="{containerId: container._id, customerId: container.customer_id, name: container.name}"
 on-done="toggleNarrativeModal()"
 on-update="postNewNarrative(data)">
 </itt-narrative-editor>

 //narrative show/index pages
 <itt-narrative-editor
 customers="$ctrl.selectedCustomer"
 narrative="$ctrl.narrativeToEdit"
 on-done="$ctrl.closeAddOrEditModal()"
 on-update="$ctrl.addOrUpdateNarrative(n)">
 </itt-narrative-editor>
 * </pre>
 */
export default function ittNarrativeEditor() {
  return {
    restrict: 'EA',
    template: `
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
           ng-model="$ctrl._narrative.name.en" required>
    <label for="nDescription">Description</label>
    <textarea id="nDescription" name="description" placeholder="Add a Description"
              ng-model="$ctrl._narrative.description.en"></textarea>
    <div ng-if="!$ctrl.hidePathSlug">
      <itt-guest-accessible-url narrative="$ctrl._narrative" sub-domain="{{$ctrl.selectedCustomer.domains[0]}}"
                                customer="$ctrl.selectedCustomer"></itt-guest-accessible-url>
    </div>
    <label for="nSupportUrl">Support Url
      <itt-validation-tip ng-if="nEditForm.supportUrl.$invalid" text="Not a valid URL"></itt-validation-tip>
    </label>
    <input id="nSupportUrl" type="text" name="supportUrl" itt-valid-url placeholder="link for support"
           ng-model="$ctrl._narrative.support_url"/>
    <label for="nNewWindow">Disable New Window</label>
    <input id="nNewWindow" type="checkbox" ng-model="$ctrl._narrative.disable_new_window"/> |
    <label for="nDisableNav">Disable Navigation</label>
    <input id="nDisableNav" type="checkbox" ng-model="$ctrl._narrative.disable_navigation"/> |
    <label for="nGuestAccess">Enable Guest Access</label>
    <input id="nGuestAccess" type="checkbox" ng-model="$ctrl._narrative.guest_access_allowed"/>
    <itt-enable-socialshare
      container-id="{{$ctrl.selectedCustomer.root_container_id}}"
      narrative="$ctrl._narrative"
      editor-form="nEditForm"></itt-enable-socialshare>
    <div class="ancillaryNav">
      <button class="done" ng-click="$ctrl.handleUpdate($ctrl._narrative)"
              ng-disabled="nEditForm.$invalid || $ctrl._narrative.error">Save
      </button>
      <button class="done" ng-click="$ctrl.onDone({$event: $event})">Cancel</button>
    </div>
  </form>
</div>`,
    scope: {
      narrative: '=?',
      customers: '=',
      containerInfo: '=?',
      hidePathSlug: '=?',
      onDone: '&',
      onUpdate: '&'
    },
    controllerAs: '$ctrl',
    bindToController: true,
    controller: ['ittUtils', 'authSvc', function (ittUtils, authSvc) {
      var ctrl = this;
      var existy = ittUtils.existy;

      angular.extend(ctrl, {
        canAccess: authSvc.userHasRole('admin') || authSvc.userHasRole('customer admin'),
        _narrative: angular.copy(ctrl.narrative),
        _customers: angular.copy(ctrl.customers),
        _containerInfo: angular.copy(ctrl.containerInfo),
        selectedCustomer: null,
        //
        handleUpdate: handleUpdate,
        selectCustomer: selectCustomer
      });

      _onInit();

      function _onInit() {
        _setNameFromContainer();
        _setCustomer();
        console.log('selected cust', )
      }

      //set selected customer on-change of dropdown select
      function selectCustomer(cust) {
        ctrl.selectedCustomer = cust;
      }

      function handleUpdate(n) {
        //use selected customer from setCustomer() or from drop down select
        if (existy(ctrl.selectedCustomer)) {
          n.customer_id = ctrl.selectedCustomer._id;

        }
        var fields = [
          'name',
          'description',
          'customer_id',
          'guest_access_allowed',
          'enable_social_sharing',
          'narrative_image_ids',
          'timeline_image_ids',
          'path_slug',
          'support_url',
          'disable_navigation',
          'disable_new_window',
          '_id'
        ];
        var narrative = ittUtils.pick(n, fields);
        if (existy(ctrl._containerInfo)) {
          ctrl.onUpdate({data: {n: narrative, c: ctrl._containerInfo.containerId}});
        } else {
          ctrl.onUpdate({n: narrative});
        }

      }

      //check for name or path as given input from the containerInfo param
      //set input name/path on narrative if it exists
      //otherwise create narrative object and assign name/path
      function _setNameFromContainer() {
        if (existy(ctrl._containerInfo)) {
          if (existy(ctrl._narrative)) {
            ctrl._narrative.name = ctrl._containerInfo.name;
          } else {
            ctrl._narrative = {name: ctrl._containerInfo.name};
          }
        }
      }

      function _setCustomer() {
        if (ctrl._customers.length === 1) {
          ctrl.selectedCustomer = ctrl._customers[0];
        } else {
          if (existy(ctrl._narrative) || existy(ctrl._containerInfo)) {
            var cId = existy(ctrl._containerInfo) && ctrl._containerInfo.customerId || ctrl._narrative.customer_id;
            ctrl.selectedCustomer = ctrl._customers.filter(function (c) {
              return c._id === cId;
            })[0];
          } else {
            ctrl._customers.unshift({name: 'Select a Customer'});
          }
        }
      }
    }]
  };
}
