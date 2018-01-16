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

export default function ittTranscriptField() {
  return {
    restrict: 'EA',
    scope: {
      data: '=',
      //not itemForm, which is a plain old JS object,
      //this is the 'IttItemForm' a ng-form defined at the head of item.html
      ittItemForm: '='
    },
    template: [
      '<div class="field">',
      '	<div class="label">Transcript [{{$ctrl.appState.lang}}]',
      '		<itt-validation-tip ng-if="$ctrl.ittItemForm[$ctrl.textAreaName].$invalid" text="Transcript is a required field"></itt-validation-tip>',
      '	</div>',
      '	<div class="input" sxs-input-i18n="$ctrl.data.annotation" do-validate="true" x-inputtype="\'textarea\'" on-emit-name="$ctrl.onName($taName)" np-autofocus></div>',
      '</div>'
    ].join(' '),
    controller: ['appState', function (appState) {
      var ctrl = this;
      ctrl.onName = onName;
      ctrl.appState = appState;
      ctrl.textAreaName = '';

      function onName(v) {
        ctrl.textAreaName = v;

      }
    }],
    controllerAs: '$ctrl',
    bindToController: true
  };
}
