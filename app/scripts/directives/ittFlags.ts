/**
 * Created by githop on 6/30/16.
 */
import { IEvent } from '../models';
import { existy } from '../services/ittUtils';

const TEMPLATE = `
<div class="field">
  <div class="label">Flags</div>
  <div class="input">
    <span ng-repeat="flag in $ctrl._flags">
      <span ng-if="flag !== 'invertColor'">
        <label for="{{$ctrl._ids[flag]}}"></label>
        <input id="{{$ctrl._ids[flag]}}"
          type="checkbox"
          itt-dynamic-model="'$ctrl.data.' + flag"
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
  templateUrl: string;
  itemForm?: ng.IFormController;
}

class FlagsController implements IFlagsBindings {
  flags: string[];
  data: IEvent;
  templateUrl: string;
  itemForm?: ng.IFormController;
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
    if (changesObj.templateUrl) {
      const { previousValue, currentValue } = changesObj.templateUrl;
      if (!changesObj.templateUrl.isFirstChange()) {
        this.$timeout(() => this.setFlags(currentValue, previousValue));
      }
    }
  }

  handleChange() {
    if (this.data.hasOwnProperty('stop')) {
      this.selectService.onSelectChange(this.data, this.itemForm);
    }
  }

  setFlags(newVal, oldVal) {
    //reset invert color when switching between templates.
    if (newVal !== oldVal) {
      this.itemForm.color = '';
    }

    if (newVal) {

      if (newVal === 'templates/item/image-fill.html') {
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
    }
  }

  private _isEditingItemForm() {
    return existy(this.itemForm) && this.data._id === 'internal:editing';
  }

  private static _h1OrH2(url) {
    return (url === 'templates/item/text-h1.html' || url === 'templates/item/text-h2.html');
  }
}


export class Flags implements ng.IComponentOptions {
  bindings: any = {
    flags: '=',
    data: '=',
    templateUrl: '@',
    //for the invertColor option
    itemForm: '=?'
  };
  template: string = TEMPLATE;
  controller = FlagsController;
  static Name: string = 'npFlags'; // tslint:disable-line
}
