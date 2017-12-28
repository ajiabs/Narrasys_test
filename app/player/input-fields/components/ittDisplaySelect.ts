// @npUpgrade-inputFields-true
import { EventTemplates } from '../../../constants';
import { IEvent } from '../../../models';
import { IItemForm } from '../../../interfaces';

const TEMPLATE = `
<div class="field" ng-if="$ctrl.displayVisibility">
	<div class="label">Display</div>
	<div class="input">
		<select ng-change="$ctrl.onItemFormUpdate($ctrl.data, $ctrl.itemForm)"
			ng-model="$ctrl.data.layouts[$ctrl.layoutIndex]"
			ng-options="{{::$ctrl.setNgOpts('display')}}">
		</select>
	</div>
</div>
<div class="field" ng-if="$ctrl.bgImagePositionVisibility">
	<div class="label">Position</div>
		<div class="input">
		<select
		  ng-change="$ctrl.onItemFormUpdate($ctrl.data, $ctrl.itemForm)"
		  ng-model="$ctrl.itemForm.position"
		  ng-options="{{$ctrl.setNgOpts('imagePosition')}}">
  </select>
	</div>
</div>
`;

interface IDisplaySelectBindings extends ng.IComponentController {
  data: IEvent;
  itemForm: IItemForm;
}

class DisplaySelectController implements IDisplaySelectBindings {
  data: IEvent;
  itemForm: IItemForm;
  componentName: string;
  isImageFillTemplate: boolean;
  static $inject = ['selectService'];

  constructor(private selectService) {
    //
  }

  get displayVisibility() {
    return this.selectService.getVisibility('display');
  }

  get bgImagePositionVisibility() {
    return this.selectService.getVisibility('bgImagePosition');
  }

  setNgOpts(selectOptTyp: string) {
    return `option.value as option.name 
        disable when option.isDisabled
        for option in $ctrl.getSelectOpts('${selectOptTyp}')`;
  }

  onItemFormUpdate(evt: IEvent, form: IItemForm) {
    this.selectService.onSelectChange(evt, form);
  }

  onStyleArrUpdate() {

  }

  $onChanges(changes: { componentName: ng.IChangesObject }) {
    if (changes && !changes.componentName.isFirstChange()) {
      const nv = changes.componentName.currentValue;
      this.isImageFillTemplate = (nv && nv === EventTemplates.IMAGE_FILL_TEMPLATE);
    }
  }
}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class DisplaySelect implements ng.IComponentOptions {
  bindings: IComponentBindings = {
    data: '<',
    itemForm: '<',
    componentName: '<'
  };
  template: string = TEMPLATE;
  controller = DisplaySelectController;
  static Name: string = 'npDisplaySelect'; // tslint:disable-line
}

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
      '			ng-options="{{::$ctrl.setNgOpts(\'display\')}}">',
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
    controller: ['$scope', 'selectService', function ($scope, selectService) {
      var ctrl = this;
      ctrl.getVisibility = selectService.getVisibility;
      ctrl.getSelectOpts = selectService.getSelectOpts;
      ctrl.onItemFormUpdate = selectService.onSelectChange;
      ctrl.setNgOpts = setNgOpts;
      //layout index should be 0 for images, 1 for scenes
      ctrl.layoutIndex = (ctrl.data.producerItemType === 'image') ? 0 : 1;
      $scope.$watch(watchTemplate, handleChange);

      function setNgOpts(selectOptTyp: string) {
        return `option.value as option.name 
        disable when option.isDisabled
        for option in $ctrl.getSelectOpts('${selectOptTyp}')`;
      }

      function watchTemplate() {
        return ctrl.data.component_name;
      }

      function handleChange(nv) {
        // ctrl.isImageFillTemplate = (nv && nv === 'templates/item/image-fill.html');
        ctrl.isImageFillTemplate = (nv && nv === EventTemplates.IMAGE_FILL_TEMPLATE);

      }

    }],
    controllerAs: '$ctrl',
    bindToController: true
  };
}
