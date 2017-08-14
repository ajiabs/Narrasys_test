/**
 *
 * Created by githop on 6/30/16.
 */
import {IEvent} from '../models';

import {ISelectService} from '../interfaces';
import {setNgOpts} from '../services/ittUtils';

const TEMPLATE = `
<div class="field" ng-if="$ctrl.getVisibility('display')">
  <div class="label">Display</div>
  <div class="input">
    <select ng-change="$ctrl.onItemFormUpdate($ctrl.data, $ctrl.itemForm)"
      ng-model="$ctrl.data.layouts[$ctrl.layoutIndex]"
      ng-options="{{$ctrl.setNgOpts('display')}}"
      np-options-disabled="option.isDisabled for option in $ctrl.getSelectOpts('display')">
    </select>
  </div>
</div>
<div class="field" ng-if="$ctrl.getVisibility('bgImagePosition')">
  <div class="label">Position</div>
    <div class="input">
    <select
      ng-change="$ctrl.onItemFormUpdate($ctrl.data, $ctrl.itemForm)"
      ng-model="$ctrl.itemForm.position" ng-options="{{$ctrl.setNgOpts('imagePosition')}}"></select>
  </div>
</div>
      `;

interface IDisplaySelectBindings {
  data: IEvent;
  itemForm?: ng.IFormController;
}

class DisplaySelectController implements ng.IComponentController, IDisplaySelectBindings {
  data: IEvent;
  layoutIndex: number;
  static $inject = ['selectService'];
  constructor(private selectService: ISelectService) {
    //
  }

  $onInit() {
    this.layoutIndex = this.data.producerItemType === 'image' ? 0 : 1;
  }

  getVisibility(type: string) {
    return this.selectService.getVisibility(type);
  }

  getSelectOpts(type: string) {
    return this.selectService.getSelectOpts(type);
  }

  onItemFormUpdate(item, itemForm) {
    this.selectService.onSelectChange(item, itemForm);
  }

  setNgOpts(opts: string) {
    return setNgOpts(opts);
  }
}

export class DisplaySelect implements ng.IComponentOptions {
  bindings: any = {
    data: '=',
    itemForm: '=?'
  };
  template: string = TEMPLATE;
  controller = DisplaySelectController;
  static Name: string = 'npDisplaySelect'; // tslint:disable-line
}
