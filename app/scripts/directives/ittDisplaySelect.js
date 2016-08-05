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
				item: '=',
				itemForm: '=?',
			},
			template: [
				'<div class="field" ng-if="displaySelect.getVisibility(\'display\')">',
				'	<div class="label">Display</div>',
				'	<div class="input">',
				'		<select ng-model="displaySelect.item.layouts[displaySelect.layoutIndex]" 		  ng-options="{{displaySelect.setNgOpts(\'display\')}}"></select>',
				'		<select ng-if="displaySelect.itemForm" ng-model="displaySelect.itemForm.position" ng-options="{{displaySelect.setNgOpts(\'imagePosition\')}}">',
				'		<select ng-if="displaySelect.itemForm" ng-model="displaySelect.itemForm.pin" 	  ng-options="{{displaySelect.setNgOpts(\'imagePin\')}}"></select>',
				'	</div>',
				'</div>'
			].join(''),
			controller: ['selectService', function (selectService) {
				var ctrl = this;
				ctrl.getVisibility = selectService.getVisibility;
				ctrl.getSelectOpts = selectService.getSelectOpts;
				ctrl.setNgOpts = setNgOpts;
				//layout index should be 0 for images, 1 for scenes
				ctrl.layoutIndex = (ctrl.item.producerItemType === 'image') ? 0 : 1;

				function setNgOpts(type) {
					return "option.value as option.name for option in displaySelect.getSelectOpts(" + "'" + type + "'" + ")";
				}

			}],
			controllerAs: 'displaySelect',
			bindToController: true
		};
	}


})();
