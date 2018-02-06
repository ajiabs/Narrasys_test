// @npUpgrade-inputFields-true
import { IEvent } from '../../../models';
import { IProducerInputFieldController } from '../input-fields.module';

/**
 * Created by githop on 6/30/16.
 */

const TEMPLATE = `
<div class="field">
	<div class="label">Transcript [{{$ctrl.appState.lang}}]
		<itt-validation-tip
		  ng-if="$ctrl.ittItemForm[$ctrl.textAreaName].$invalid"
		  text="Transcript is a required field">
     </itt-validation-tip>
	</div>
  <np-input-i18n
    class="input"
    field="$ctrl.data.annotation"
    do-validate="true"
    inputtype="textarea"
    on-field-change="$ctrl.onUpdate()"
    on-emit-name="$ctrl.onName($taName)"
    np-autofocus>
  </np-input-i18n>
</div>
`;

interface ITranscriptFieldBindings extends IProducerInputFieldController {
  data: IEvent;
  onUpdate: () => void;
  ittItemForm: ng.IFormController;
}

class TranscriptFieldController implements ITranscriptFieldBindings {
  data: IEvent;
  onUpdate: () => void;
  textAreaName: string;
  ittItemForm: ng.IFormController;
  static $inject = ['appState'];

  constructor(public appState) {
    //
  }

  $onInit() {
    this.textAreaName = '';
  }

  onName(name: string) {
    this.textAreaName = name;
  }
}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class TranscriptField implements ng.IComponentOptions {
  bindings: IComponentBindings = {
    data: '<',
    ittItemForm: '<',
    onUpdate: '&'
  };
  template: string = TEMPLATE;
  controller = TranscriptFieldController;
  static Name: string = 'npTranscriptField'; // tslint:disable-line
}
