// @npUpgrade-inputFields-false
import { IItemForm } from '../../../interfaces';

/**
 * Created by githop on 6/30/16.
 */

const TEMPLATE = ``;

interface ITypographySelectBindings extends ng.IComponentController {
  itemForm: IItemForm;
}

class TypographySelectController implements ITypographySelectBindings {
  itemForm: IItemForm;
  static $inject = [];

  constructor() {
    //
  }

  $onInit() {
    //
  }
}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class TypographySelect implements ng.IComponentOptions {
  bindings: IComponentBindings = {};
  template: string = TEMPLATE;
  controller = TypographySelectController;
  static Name: string = 'npTypographySelect'; // tslint:disable-line
}

export default function ittTypographySelect() {
  return {
    restrict: 'EA',
    template: [
      '<div class="field">',
      '	<div class="label">Typography</div>',
      '	<div class="input">',
      '		<select size="1" ng-model="itemForm.typography">',
      '			<option value="">(Default)</option>',
      '			<option value="Sans">Sans</option>',
      '			<option value="Serif">Serif</option>',
      '			<option value="Book">Book</option>',
      '			<option value="Swiss">Swiss</option>',
      '		</select>',
      '	</div>',
      '</div>'
    ].join(' ')
  };
}
