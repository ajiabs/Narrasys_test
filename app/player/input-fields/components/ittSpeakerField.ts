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
	
    <np-annotator-autocomplete
    	ng-model="$ctrl.data.annotator"
    	ng-change="$ctrl.onUpdate()"
    	item="$ctrl.data"
      annotators="$ctrl.annotators">
    </np-annotator-autocomplete>
	</div>
</div>
`;

interface ISpeakerFieldBindings extends IProducerInputFieldController {
  data: IEvent;
  annotators: any;
  onUpdate: () => void;
}

class SpeakerFieldController implements ISpeakerFieldBindings {
  data: IEvent;
  annotators: any;
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
    annotators: '<',
    onUpdate: '&'
  };
  template: string = TEMPLATE;
  controller = SpeakerFieldController;
  static Name: string = 'npSpeakerField'; // tslint:disable-line
}
