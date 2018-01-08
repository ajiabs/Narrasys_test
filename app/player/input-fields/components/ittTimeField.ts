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
		<span sxs-input-time="$ctrl.data" on-field-change="$ctrl.onUpdate()" x-input-field="start_time"></span>
		<span ng-if="!($ctrl.stop || $ctrl.isScene || $ctrl.isChapter)">
			<span class="label"> &nbsp; &nbsp; &nbsp; End</span>
			<span sxs-input-time="$ctrl.data" on-field-change="$ctrl.onUpdate()" x-input-field="end_time"></span>
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

export default function ittTimeField() {
  return {
    restrict: 'EA',
    scope: true,
    template: [
      '<div class="field" ng-if="!(item._type===\'Scene\' && item.start_time <= 0.1)">',
      '	<div class="label">Start</div>',
      '	<div class="input">',
      '  <itt-validation-tip ng-if="ittItemForm.time.$invalid" text="{{item.validationMessage}}"></itt-validation-tip>',
      '		<span sxs-input-time="item" x-input-field="start_time"></span>',
      '		<span ng-if="!(item.stop || item._type === \'Scene\' || item._type === \'Chapter\')">',
      '			<span class="label"> &nbsp; &nbsp; &nbsp; End</span>',
      '			<span sxs-input-time="item" x-input-field="end_time"></span>',
      '		</span>',
      '	</div>',
      '</div>'
    ].join(' ')
  };
}
