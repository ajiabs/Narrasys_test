// @npUpgrade-inputFields-true
import { IEpisode, IEvent, IScene } from '../../../models';
import { IItemForm } from '../../../interfaces';

/**
 * Created by githop on 6/30/16.
 */

const TEMPLATE = `
<div class="field">
	<div class="label">Transition</div>
	<div class="input">
		<select size="1" ng-model="$ctrl.itemForm.transition" ng-change="$ctrl.onUpdate()">
			<option ng-if="$ctrl.isEpisode" value="">(Default)</option>
			<option ng-if="$ctrl.isScene" value="">(Inherit from episode)</option>
			<option ng-if="!($ctrl.isScene || $ctrl.isEpisode)" value="">(Inherit from layout)</option>
			<option value="None">No transition</option>
			<option value="Fade">Fade</option>
			<option value="SlideL">Slide left</option>
			<option value="SlideR">Slide right</option>
			<option value="Pop">Pop</option>
		</select>
	</div>
</div>
`;

interface ITransitionSelectBindings extends ng.IComponentController {
  data: IEpisode | IEvent;
  itemForm: IItemForm;
  onUpdate: () => void;
}

class TransitionSelectController implements ITransitionSelectBindings {
  data: IEpisode | IEvent;
  itemForm: IItemForm;
  onUpdate: () => void;
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

export class TransitionSelect implements ng.IComponentOptions {
  bindings: IComponentBindings = {
    data: '<',
    itemForm: '<',
    onUpdate: '&'
  };
  template: string = TEMPLATE;
  controller = TransitionSelectController;
  static Name: string = 'npTransitionSelect'; // tslint:disable-line
}
