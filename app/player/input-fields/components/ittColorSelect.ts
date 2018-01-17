// @npUpgrade-inputFields-true
import { IItemForm } from '../../../interfaces';

/**
 * Created by githop on 6/30/16.
 */

const TEMPLATE = `
<div class="field">
	<div class="label">Color</div>
	<div class="input">
		<select size="1" ng-model="$ctrl.itemForm.color" ng-change="$ctrl.onUpdate()">
			<option value="">(Default)</option>
			<option value="Invert">Invert</option>
			<option value="Sepia">Sepia</option>
			<option value="Solarized">Solarized</option>
			<option value="Vivid">Vivid</option>
		</select>
	</div>
</div>
`;

interface IColorSelectBindings extends ng.IComponentController {
  itemForm: IItemForm;
}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class ColorSelect implements ng.IComponentOptions {
  bindings: IComponentBindings = {
    itemForm: '<',
    onUpdate: '&'
  };
  template: string = TEMPLATE;
  static Name: string = 'npColorSelect'; // tslint:disable-line
}
