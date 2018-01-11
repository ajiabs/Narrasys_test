// @npUpgrade-inputFields-true
import { IEpisode, IEvent, IScene } from '../../../models';
import { IItemForm } from '../../../interfaces';

/**
 *
 * Created by githop on 6/30/16.
 */

const TEMPLATE = `
<div class="field">
	<div class="label">Highlight<span ng-if="$ctrl.isEpisode"> Style</span></div>
	<div class="input">
		<select size="1" ng-model="$ctrl.itemForm.highlight" ng-change="$ctrl.onUpdate()">
			<option ng-if="$ctrl.isEpisode" value="">(Default)</option>
			<option ng-if="$ctrl.isScene" value="">(Inherit from episode)</option>
			<option ng-if="!($ctrl.isScene || $ctrl.isEpisode)" value="">(Inherit from layout)</option>
			<option value="None">No highlight</option>
			<option value="Solid">Solid</option>
			<option value="Border">Border</option>
			<option value="Side">Side</option>
			<option value="Bloom">Translucent</option>
			<option value="Tilt">Tilt</option>
		</select>
	</div>
</div>
`;

interface IHighlightSelectBindings extends ng.IComponentController {
  data: IEpisode | IEvent;
  itemForm: IItemForm;
  onUpdate: () => void;
}

class HighlightSelectController implements IHighlightSelectBindings {
  data: IEpisode | IEvent;
  itemForm: IItemForm;
  onUpdate: () => void;

  get isEpisode() {
    if (this.data) {
      return this.data instanceof IEpisode;
    }
    return false;
  }

  get isScene() {
    if (this.data) {
      return this.data instanceof IScene;
    }
    return false;
  }
}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class HighlightSelect implements ng.IComponentOptions {
  bindings: IComponentBindings = {
    data: '<',
    itemForm: '<',
    onUpdate: '&'
  };
  template: string = TEMPLATE;
  controller = HighlightSelectController;
  static Name: string = 'npHighlightSelect'; // tslint:disable-line
}

export default function ittHighlightSelect() {
  return {
    restrict: 'EA',
    template: [
      '<div class="field">',
      '	<div class="label">Highlight<span ng-if="episode"> Style</spann></div>',
      '	<div class="input">',
      '		<select size="1" ng-model="itemForm.highlight">',
      '			<option ng-if="episode" value="">(Default)</option>',
      '			<option ng-if="item._type === \'Scene\'" value="">(Inherit from episode)</option>',
      '			<option ng-if="item._type !== \'Scene\' && !episode" value="">(Inherit from layout)</option>',
      '			<option value="None">No highlight</option>',
      '			<option value="Solid">Solid</option>',
      '			<option value="Border">Border</option>',
      '			<option value="Side">Side</option>',
      '			<option value="Bloom">Translucent</option>',
      '			<option value="Tilt">Tilt</option>',
      '		</select>',
      '	</div>',
      '</div>'
    ].join(' ')
  };
}
