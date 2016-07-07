/**
 * Created by githop on 6/16/16.
 */

export default function ittNarrativeEditor() {
	return {
		restrict: 'EA',
		template: [
			'<div class="narrative__edit">',
			'	<form name="nEditForm">',
			'		<div ng-show="nEditor.canAccess">',
			'			<label for="nCustomer">Customer</label><span ng-if="nEditForm.customer.$invalid" class="invalid__field"> Required</span>',
			'			<select id="nCustomer" name="customer" required ng-model="nEditor.selectedCustomer" ng-change="nEditor.selectCustomer(nEditor.selectedCustomer)" ng-options="cust.name for cust in nEditor._customers track by cust._id"></select></br>',
			'		</div>',
			'		<label id="nName">Name of Narrative</label><span ng-if="nEditForm.name.$invalid" class="invalid__field"> Required</span>',
			'		<input for="nName" type="text" name="name" placeholder="Add Narrative Name" ng-model="nEditor._narrative.name.en" required>',
			'		<label for="nDescription">Description</label>',
			'		<textarea id="nDescription" name="description" placeholder="Add a Description" ng-model="nEditor._narrative.description.en"></textarea>',
			'		<label for="nPath">Path</label><span ng-if="nEditForm.path.$invalid" class="invalid__field"> Required</span>',
			'		<input id="nPath" type="text" name="path" placeholder="link-to-narrative" ng-model="nEditor._narrative.path_slug.en" required/>',
			'		<label for="nSupportUrl">Support Url</label><span ng-if="nEditForm.supportUrl.$invalid" class="invalid__field"> Not a valid URL</span>',
			'		<input id="nSupportUrl" type="text" name="supportUrl" itt-valid-url placeholder="link for support" ng-model="nEditor._narrative.support_url"/>',
			'		<label for="nNewWindow">Disable New Window</label>',
			'		<input id="nNewWindow" type="checkbox" ng-model="nEditor._narrative.disable_new_window"/>',
			'		<label for="nDisableNav">Disable Navigation</label>',
			'		<input id="nDisableNav" type="checkbox" ng-model="nEditor._narrative.disable_navigation"/>',
			'		<label for="nGuestAccess">Enable Guest Access</label>',
			'		<input id="nGuestAccess" type="checkbox" ng-model="nEditor._narrative.guest_access_allowed"/>',
			'		<div class="ancillaryNav">',
			'			<button class="done" ng-click="nEditor.handleUpdate(nEditor._narrative)" ng-disabled="nEditForm.$invalid">Save</button>',
			'			<button class="done" ng-click="nEditor.onDone()">Cancel</button>',
			'		</div>',
			'	</form>',
			'</div>'
		].join(' '),
		scope: {
			narrative: '=',
			customers: '=',
			onDone: '&',
			onUpdate: '&'
		},
		controllerAs: 'nEditor',
		bindToController: true,
		controller: ['ittUtils', 'authSvc', function (ittUtils, authSvc) {
			var ctrl = this;
			//copy to dereference original narrative as we are two-way bound (one way binding available in 1.5)
			ctrl._narrative = angular.copy(this.narrative);
			ctrl._customers = angular.copy(this.customers);
			ctrl.handleUpdate = handleUpdate;
			ctrl.selectCustomer = selectCustomer;
			ctrl.canAccess = authSvc.userHasRole('admin');

			_onInit();

			function _onInit() {
				setCustomer();
			}

			//set selected customer on-change of dropdown select
			function selectCustomer(cust) {
				ctrl.selectedCustomer = cust;
			}

			function handleUpdate(n) {
				//use selected customer from setCustomer() or from drop down select
				if (ittUtils.existy(ctrl.selectedCustomer)) {
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
				ctrl.onUpdate({n: narrative});
			}

			function setCustomer() {
				if (ctrl._customers.length === 1) {
					ctrl.selectedCustomer = ctrl._customers[0];
				} else {
					if (ittUtils.existy(ctrl._narrative)) {
						ctrl.selectedCustomer = ctrl._customers.filter(function (c) {
							return ctrl._narrative.customer_id === c._id;
						})[0];

					} else {
						ctrl._customers.unshift({name: 'Select a Customer'});
					}

				}
			}
		}]
	};
}
