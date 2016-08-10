/**
 *
 * Created by githop on 6/30/16.
 */

(function () {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittDisplaySelect', ittDisplaySelect);

	function ittDisplaySelect() {
		return {
			restrict: 'EA',
			scope: {
				data: '=',
				itemForm: '=?',
			},
			template: [
				'<div class="field" ng-if="displaySelect.getVisibility(\'display\')">',
				'	<div class="label">Display</div>',
				'	<div class="input">',
				'		<select ng-change="displaySelect.onItemFormUpdate(displaySelect.data, displaySelect.itemForm)"',
				'			ng-model="displaySelect.data.layouts[displaySelect.layoutIndex]"',
				'			ng-options="{{displaySelect.setNgOpts(\'display\')}}"',
				'			itt-options-disabled="option.isDisabled for option in displaySelect.getSelectOpts(\'display\')">',
				'		</select>',
				'	</div>',
				'</div>',
				'<div class="field" ng-if="displaySelect.isImageFillTemplate">',
				'	<div class="label">Position</div>',
				'		<div class="input">',
				'		<select ng-change="displaySelect.onItemFormUpdate(displaySelect.data, displaySelect.itemForm)" ng-model="displaySelect.itemForm.position" ng-options="{{displaySelect.setNgOpts(\'imagePosition\')}}"></select>',
				'	</div>',
				'</div>'
			].join(''),
			controller: ['$scope', 'selectService', function ($scope, selectService) {
				var ctrl = this;
				ctrl.getVisibility = selectService.getVisibility;
				ctrl.getSelectOpts = selectService.getSelectOpts;
				ctrl.onItemFormUpdate = selectService.onSelectChange;
				ctrl.setNgOpts = setNgOpts;
				//layout index should be 0 for images, 1 for scenes
				ctrl.layoutIndex = (ctrl.data.producerItemType === 'image') ? 0 : 1;

				$scope.$watch(watchTemplate, handleChange);

				function watchTemplate() {
					return ctrl.data.templateUrl;
				}

				function handleChange(nv) {
					ctrl.isImageFillTemplate = (nv && nv === 'templates/item/image-fill.html');

				}

				function setNgOpts(type) {
					return "option.value as option.name for option in displaySelect.getSelectOpts(" + "'" + type + "'" + ")";
				}

			}],
			controllerAs: 'displaySelect',
			bindToController: true
		};
	}


})();
