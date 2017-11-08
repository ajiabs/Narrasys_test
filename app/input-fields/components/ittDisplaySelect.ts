// @npUpgrade-inputFields-false
/**
 *
 * Created by githop on 6/30/16.
 */
export default function ittDisplaySelect() {
  return {
    restrict: 'EA',
    scope: {
      data: '=',
      itemForm: '=?',
    },
    template: [
      '<div class="field" ng-if="$ctrl.getVisibility(\'display\')">',
      '	<div class="label">Display</div>',
      '	<div class="input">',
      '		<select ng-change="$ctrl.onItemFormUpdate($ctrl.data, $ctrl.itemForm)"',
      '			ng-model="$ctrl.data.layouts[$ctrl.layoutIndex]"',
      '			ng-options="{{$ctrl.setNgOpts(\'display\')}}"',
      '			itt-options-disabled="option.isDisabled for option in $ctrl.getSelectOpts(\'display\')">',
      '		</select>',
      '	</div>',
      '</div>',
      '<div class="field" ng-if="$ctrl.getVisibility(\'bgImagePosition\')">',
      '	<div class="label">Position</div>',
      '		<div class="input">',
      '		<select ng-change="$ctrl.onItemFormUpdate($ctrl.data, $ctrl.itemForm)" ng-model="$ctrl.itemForm.position" ng-options="{{$ctrl.setNgOpts(\'imagePosition\')}}"></select>',
      '	</div>',
      '</div>'
    ].join(''),
    controller: ['$scope', 'selectService', 'ittUtils', function ($scope, selectService, ittUtils) {
      var ctrl = this;
      ctrl.getVisibility = selectService.getVisibility;
      ctrl.getSelectOpts = selectService.getSelectOpts;
      ctrl.onItemFormUpdate = selectService.onSelectChange;
      ctrl.setNgOpts = ittUtils.setNgOpts;
      //layout index should be 0 for images, 1 for scenes
      ctrl.layoutIndex = (ctrl.data.producerItemType === 'image') ? 0 : 1;

      $scope.$watch(watchTemplate, handleChange);

      function watchTemplate() {
        return ctrl.data.templateUrl;
      }

      function handleChange(nv) {
        ctrl.isImageFillTemplate = (nv && nv === 'templates/item/image-fill.html');

      }

    }],
    controllerAs: '$ctrl',
    bindToController: true
  };
}
