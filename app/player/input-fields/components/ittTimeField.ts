// @npUpgrade-inputFields-true
import { IChapter, IEvent, IScene } from '../../../models';
import { IProducerInputFieldController } from '../input-fields.module';

/**
 * Created by githop on 6/30/16.
 */


const TEMPLATE = `
<div class="field" ng-if="$ctrl.hideTime">
	<div class="label">Start</div>
	<div class="input">
  <itt-validation-tip
    ng-if="$ctrl.ittItemForm.time.$invalid"
    text="{{$ctrl.data.validationMessage}}">
  </itt-validation-tip>
		<np-input-time
		  item="$ctrl.data"
		  on-field-change="$ctrl.onUpdate()"
		  input-field="start_time">
    </np-input-time>
		<span ng-if="!($ctrl.stop || $ctrl.isScene || $ctrl.isChapter)">
			<span class="label"> &nbsp; &nbsp; &nbsp; End</span>
			<np-input-time
			  item="$ctrl.data" on-field-change="$ctrl.onUpdate()" input-field="end_time"></np-input-time>
		</span>
	</div>
</div>
`;

interface ITimeFieldBindings extends IProducerInputFieldController {
  data: IEvent;
  itemForm: ng.IFormController;
  onUpdate: () => void;
}

class TimeFieldController implements ITimeFieldBindings {
  data: IEvent;
  itemForm: ng.IFormController;
  onUpdate: () => void;
  static $inject = [];

  constructor() {
    //
  }

  get hideTime() {
    return (this.data && !(this.data instanceof IScene && this.data.start_time <= 0.1));
  }

  get isScene() {
    return (this.data && this.data instanceof IScene);
  }

  get isChapter() {
    return (this.data && this.data instanceof IChapter);
  }


  $onInit() {
    //
  }
}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class TimeField implements ng.IComponentOptions {
  bindings: IComponentBindings = {
    data: '<',
    itemForm: '<',
    onUpdate: '&'
  };
  template: string = TEMPLATE;
  controller = TimeFieldController;
  static Name: string = 'npTimeField'; // tslint:disable-line
}
