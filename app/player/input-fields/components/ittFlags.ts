// @npUpgrade-inputFields-true
/**
 * Created by githop on 6/30/16.
 */
import { IEvent } from '../../../models';
import { existy } from '../../../shared/services/ittUtils';
import { EventTemplates } from '../../../constants';

const TEMPLATE = `
<div class="field">
  <div class="label">Flags</div>
  <div class="input">
    <span ng-repeat="flag in $ctrl._flags">
      <span ng-if="flag !== 'invertColor'">
        <label for="{{$ctrl._ids[flag]}}"></label>
        <input id="{{$ctrl._ids[flag]}}"
          type="checkbox"
          np-dynamic-model="'$ctrl.data.' + flag"
          ng-change="$ctrl.handleChange()"/>{{$ctrl._displays[flag]}}
      </span>
      <span ng-if="flag === 'invertColor'">
        <label for="{{$ctrl._ids[flag]}}"></label>
        <input id="{{$ctrl._ids[flag]}}"
          type="checkbox"
          ng-model="$ctrl.itemForm.color"
          ng-true-value="'Invert'"
          ng-false-value="''"
          ng-change="$ctrl.handleChange()"/>{{$ctrl._displays[flag]}}
      </span>
    </span>
  </div>
</div>
`;

interface IFlagsBindings extends ng.IComponentController {
  flags: string[];
  data: IEvent;
  componentName: string;
  itemForm?: ng.IFormController;
  onUpdate: () => void;
}

class FlagsController implements IFlagsBindings {
  flags: string[];
  data: IEvent;
  componentName: string;
  itemForm?: ng.IFormController;
  onUpdate: () => void;
  _flags: any;
  _displays = {
    required: 'Required',
    stop: 'Stop item',
    cosmetic: 'Cosmetic',
    chapter_marker: 'Chapter Event',
    invertColor: 'Invert Color'
  };
  _ids = {
    required: 'itemRequired',
    stop: 'itemStop',
    cosmetic: 'itemCosmetic',
    chapter_marker: 'itemChapter',
    invertColor: 'Invert'
  };
  static $inject = ['$timeout', 'selectService'];

  constructor(private $timeout, private selectService) {
    //
  }

  $onInit() {
    this._flags = angular.copy(this.flags);
  }

  $onChanges(changesObj) {
    if (changesObj.componentName) {
      const { previousValue, currentValue } = changesObj.componentName;
      this.$timeout(() => this.setFlags(currentValue, previousValue));
    }
  }

  handleChange() {
    if (this.data.hasOwnProperty('stop')) {
      this.selectService.onSelectChange(this.data, this.itemForm);
    }
    this.emitUpdate();
  }

  setFlags(newVal, oldVal) {
    //reset invert color when switching between templates.
    // only reset if we are the right type and the value changes
    // e.g. ignore undefined -> string
    if (newVal !== oldVal && typeof newVal === typeof oldVal) {
      this.itemForm.color = '';
    }

    if (newVal) {

      if (newVal === EventTemplates.IMAGE_FILL_TEMPLATE) {
        this._flags = this._flags.filter((f) => {
          return f !== 'stop';
        });
      } else {
        this._flags = this.flags;
      }

      if (!FlagsController._h1OrH2(newVal)) {
        if (this._isEditingItemForm()) {
          this.itemForm.color = '';
        }

        this._flags = this._flags.filter((f) => {
          return f !== 'chapter_marker';
        });
      } else {
        this._flags = this.flags;
        if (this._isEditingItemForm()) {
          this.itemForm.color = 'Invert';
        }
      }
      this.emitUpdate();
    }
  }

  private static _h1OrH2(url) {
    return (url === EventTemplates.HEADER_TWO_TEMPLATE || url === EventTemplates.HEADER_ONE_TEMPLATE);
  }

  private emitUpdate() {
    this.$timeout(() => {
      this.onUpdate();
    });
  }

  private _isEditingItemForm() {
    return existy(this.itemForm) && this.data._id === 'internal:editing';
  }
}


export class Flags implements ng.IComponentOptions {
  bindings: any = {
    flags: '<',
    data: '<',
    componentName: '@',
    //for the invertColor option
    itemForm: '<?',
    onUpdate: '&'
  };
  template: string = TEMPLATE;
  controller = FlagsController;
  static Name: string = 'npFlags'; // tslint:disable-line
}
