// @npUpgrade-inputFields-true
import { IEpisode, IEvent, IScene } from '../../../models';
import { IItemForm } from '../../../interfaces';

/**
 * Created by githop on 6/30/16.
 */

const TEMPLATE = `
<div class="field">
	<div class="label"><span ng-if="$ctrl.isEpisode">Display </span>Timestamp</div>
	<div class="input">
		<select size="1" ng-model="$ctrl.itemForm.timestamp" ng-change="$ctrl.onItemFormChange()">
			<option ng-if="$ctrl.isEpisode" value="">(Default)</option>
			<option ng-if="$ctrl.isScene" value="">(Inherit from episode)</option>
			<option ng-if="!$ctrl.isScene" value="">(Inherit from layout)</option>
			<option value="None">Off</option>
			<option value="Inline">On</option>
		</select>
	</div>
</div>
`;

interface ITimestampSelectBindings extends ng.IComponentController {
  data: IEpisode | IEvent;
  itemForm: IItemForm;
  onItemFormChange: () => void;
}

class TimestampSelectController implements ITimestampSelectBindings {
  data: IEpisode | IEvent;
  itemForm: IItemForm;
  onItemFormChange: () => void;
  static $inject = [];

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

export class TimestampSelect implements ng.IComponentOptions {
  bindings: IComponentBindings = {
    data: '<',
    itemForm: '<',
    onItemFormChange: '&'
  };
  template: string = TEMPLATE;
  controller = TimestampSelectController;
  static Name: string = 'npTimestampSelect'; // tslint:disable-line
}

export default function ittTimestampSelect() {
  return {
    restrict: 'EA',
    scope: true,
    template: [
      '<div class="field">',
      '	<div class="label"><span ng-if="episode">Display </span>Timestamp</div>',
      '	<div class="input">',
      '		<select size="1" ng-model="itemForm.timestamp">',
      '			<option ng-if="episode" value="">(Default)</option>',
      '			<option ng-if="item._type === \'Scene\'" value="">(Inherit from episode)</option>',
      '			<option ng-if="item._type !== \'Scene\'" value="">(Inherit from layout)</option>',
      '			<option value="None">Off</option>',
      '			<option value="Inline">On</option>',
      '		</select>',
      '	</div>',
      '</div>'
    ].join(' ')
  };
}
