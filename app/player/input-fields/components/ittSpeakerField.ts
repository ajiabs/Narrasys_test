// @npUpgrade-inputFields-true
import { IEvent } from '../../../models';
import { IProducerInputFieldController } from '../input-fields.module';

/**
 * Created by githop on 6/30/16.
 */

const TEMPLATE = `
<div class="field" ng-if="$ctrl.speakerFieldVisibility">
	<div class="label">Speaker [{{$ctrl.appState.lang}}]</div>
	<div class="input">
		<div
		  sxs-annotator-autocomplete="annotators"
		  item="$ctrl.data"
		  ng-model="$ctrl.data.annotator"
		  ng-change="$ctrl.onUpdate()">
    </div>
	</div>
</div>
`;

interface ISpeakerFieldBindings extends IProducerInputFieldController {
  data: IEvent;
  onUpdate: () => void;
}

class SpeakerFieldController implements ISpeakerFieldBindings {
  data: IEvent;
  onUpdate: () => void;
  static $inject = ['selectService', 'appState'];

  constructor(public selectService, public appState) {
    //
  }

  get speakerFieldVisibility() {
    return this.selectService.getVisibility('speakerField');
  }

  $onInit() {
    //
  }
}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class SpeakerField implements ng.IComponentOptions {
  bindings: IComponentBindings = {
    data: '<',
    onUpdate: '&'
  };
  template: string = TEMPLATE;
  controller = SpeakerFieldController;
  static Name: string = 'npSpeakerField'; // tslint:disable-line
}

export default function ittSpeakerField() {
  return {
    restrict: 'EA',
    template: `
      <div class="field" ng-if="selectService.getVisibility('speakerField')">
      	<div class="label">Speaker [{{appState.lang}}]</div>
      	<div class="input">
      		<div sxs-annotator-autocomplete="annotators" item="item" ng-model="item.annotator"></div>
      	</div>
      </div>`
  };
}
