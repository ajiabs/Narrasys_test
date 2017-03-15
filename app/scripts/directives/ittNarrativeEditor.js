/**
 * Created by githop on 6/16/16.
 */

(function () {
  'use strict';

  angular.module('com.inthetelling.story')
    .directive('ittNarrativeEditor', ittNarrativeEditor);

  function ittNarrativeEditor() {
    return {
      restrict: 'EA',
      template: [
        '<div class="narrative__edit">',
        '<h2>Narrative Settings</h2>',
        '	<form name="nEditForm">',
        '		<div ng-show="!$ctrl.hideCustomerDropdown && $ctrl.canAccess">',
        '			<label for="nCustomer">Customer',
        '				<itt-validation-tip ng-if="nEditForm.customer.$invalid" text="A customer must be set"></itt-validation-tip>',
        '			</label>',
        '			<select id="nCustomer" name="customer" required ng-model="$ctrl.selectedCustomer" ng-change="$ctrl.selectCustomer($ctrl.selectedCustomer)" ng-options="cust.name for cust in $ctrl._customers track by cust._id"></select></br>',
        '		</div>',
        '		<label id="nName">Narrative Title',
        '			<itt-validation-tip ng-if="nEditForm.name.$invalid" text="Title is required"></itt-validation-tip>',
        '		</label>',
        '		<input for="nName" type="text" name="name" placeholder="Add Narrative Title" ng-model="$ctrl._narrative.name.en" required>',
        '		<label for="nDescription">Description</label>',
        '		<textarea id="nDescription" name="description" placeholder="Add a Description" ng-model="$ctrl._narrative.description.en"></textarea>',
        '   <div ng-if="$ctrl._narrative.guest_access_allowed">',
        '		  <label for="nPath">Guest Accessible URL: <span>{{$ctrl.host}}/#/{{$ctrl._narrative.path_slug.en | slugify }}</span>',
        '			  <itt-validation-tip ng-if="nEditForm.path.$invalid"  text="A human friendly URL is required"></itt-validation-tip>',
        '		  </label>',
        '		  <input id="nPath" type="text" name="path" placeholder="human-friendly-link-to-narrative" ng-model="$ctrl._narrative.path_slug.en"/>',
        '   </div>',
        '		<label for="nSupportUrl">Support Url',
        '			<itt-validation-tip ng-if="nEditForm.supportUrl.$invalid" text="Not a valid URL"></itt-validation-tip>',
        '		</label>',
        '		<input id="nSupportUrl" type="text" name="supportUrl" itt-valid-url placeholder="link for support" ng-model="$ctrl._narrative.support_url"/>',
        '		<label for="nNewWindow">Disable New Window</label>',
        '		<input id="nNewWindow" type="checkbox" ng-model="$ctrl._narrative.disable_new_window"/> | ',
        '		<label for="nDisableNav">Disable Navigation</label>',
        '		<input id="nDisableNav" type="checkbox" ng-model="$ctrl._narrative.disable_navigation"/> | ',
        '		<label for="nGuestAccess">Enable Guest Access</label>',
        '		<input id="nGuestAccess" type="checkbox" ng-model="$ctrl._narrative.guest_access_allowed"/>',
        '		<div class="ancillaryNav">',
        '			<button class="done" ng-click="$ctrl.handleUpdate($ctrl._narrative)" ng-disabled="nEditForm.$invalid">Save</button>',
        '			<button class="done" ng-click="$ctrl.onDone({$event: $event})">Cancel</button>',
        '		</div>',
        '	</form>',
        '</div>'
      ].join(' '),
      scope: {
        narrative: '=',
        customers: '=',
        containerId: '=?',
        customerId: '=?',
        hideCustomerDropdown: '=?',
        name: '=?',
        onDone: '&',
        onUpdate: '&'
      },
      controllerAs: '$ctrl',
      bindToController: true,
      controller: ['$location', 'ittUtils', 'authSvc', 'config', function ($location, ittUtils, authSvc, config) {
        var ctrl = this;
        var existy = ittUtils.existy;
        //copy to dereference original narrative as we are two-way bound (one way binding available in 1.5)
        ctrl._narrative = angular.copy(this.narrative);
        ctrl._customerId = angular.copy(this.customerId);
        ctrl._customers = angular.copy(this.customers);
        ctrl._containerId = angular.copy(this.containerId);
        ctrl._name = angular.copy(this.name);
        ctrl.handleUpdate = handleUpdate;
        ctrl.selectCustomer = selectCustomer;
        ctrl.canAccess = authSvc.userHasRole('admin') || authSvc.userHasRole('customer admin');
        ctrl.host = $location.protocol() + ':' + config.apiDataBaseUrl;
        _onInit();

        function _onInit() {
          //check for name or path as given input
          //set input name/path on narrative if it exists
          //otherwise create narrative object and assign name/path
          if (existy(ctrl._name)) {
            if (existy(ctrl._narrative)) {
              ctrl._narrative.name = ctrl._name;
            } else {
              ctrl._narrative = {name: ctrl._name};
            }
          }

          setCustomer();
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
            'path_slug',
            'support_url',
            'disable_navigation',
            'disable_new_window',
            '_id'
          ];
          var narrative = ittUtils.pick(n, fields);
          if (existy(ctrl._containerId)) {
            ctrl.onUpdate({data: {n: narrative, c: ctrl._containerId}});
          } else {
            ctrl.onUpdate({n: narrative});
          }

        }

        function setCustomer() {
          if (ctrl._customers.length === 1) {
            ctrl.selectedCustomer = ctrl._customers[0];
          } else {
            if (existy(ctrl._narrative) || existy(ctrl._customerId)) {
              var cId = ctrl._customerId || ctrl._narrative.customer_id;
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


})();
