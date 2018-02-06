// @npUpgrade-inputFields-true
import { IItemForm } from '../../../interfaces';

/**
 * Created by githop on 6/30/16.
 */

const TEMPLATE = `
<div class="field">
	<div class="label">Typography</div>
	<div class="input">
		<select size="1" ng-model="$ctrl.itemForm.typography" ng-change="$ctrl.onUpdate()">
			<option value="">(Default)</option>
			<option value="Sans">Sans</option>
			<option value="Serif">Serif</option>
			<option value="Book">Book</option>
			<option value="Swiss">Swiss</option>
		</select>
	</div>
</div>
`;

interface ITypographySelectBindings extends ng.IComponentController {
  itemForm: IItemForm;
  onUpdate: () => void;
}

class TypographySelectController implements ITypographySelectBindings {
  itemForm: IItemForm;
  onUpdate: () => void;
  static $inject = [];
}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class TypographySelect implements ng.IComponentOptions {
  bindings: IComponentBindings = {
    itemForm: '<',
    onUpdate: '&'
  };
  template: string = TEMPLATE;
  controller = TypographySelectController;
  static Name: string = 'npTypographySelect'; // tslint:disable-line
}
