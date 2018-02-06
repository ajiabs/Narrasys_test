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
  componentName: string;
  onUpdate: () => void;
}

class DisplaySelectController implements IDisplaySelectBindings {
  data: IEvent;
  itemForm: IItemForm;
  onUpdate: () => void;
  componentName: string;
  isImageFillTemplate: boolean;
  layoutIndex: number;
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

  getSelectOpts(selectOptType: string) {
    return this.selectService.getSelectOpts(selectOptType);
  }

  setNgOpts(selectOptTyp: string) {
    return `option.value as option.name 
        disable when option.isDisabled
        for option in $ctrl.getSelectOpts('${selectOptTyp}')`;
  }

  onItemFormUpdate(evt: IEvent, form: IItemForm) {
    this.selectService.onSelectChange(evt, form);
    this.data.styles = this.selectService.handleEventItemFormUpdate(form);
    this.onUpdate();
  }

  $onInit() {
    this.layoutIndex = this.data.producerItemType === 'image' ? 0 : 1;
  }


  $onChanges(changes: { componentName: ng.IChangesObject }) {
    if (changes && changes.componentName && !changes.componentName.isFirstChange()) {
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
    componentName: '@',
    onUpdate: '&'
  };
  template: string = TEMPLATE;
  controller = DisplaySelectController;
  static Name: string = 'npDisplaySelect'; // tslint:disable-line
}
