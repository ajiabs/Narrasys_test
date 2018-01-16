// @npUpgrade-inputFields-true
import { IProducerInputFieldController } from '../input-fields.module';
import { IEvent } from '../../../models';

/**
 *
 * Created by githop on 6/30/16.
 */

const TEMPLATE = `
<div class="field">
	<div class="label">Annotation Text [{{$ctrl.appState.lang}}]
		<itt-validation-tip
		  ng-if="$ctrl.ittItemForm[$ctrl.textAreaName].$invalid"
		  text="Annotation Text is a required field">
    </itt-validation-tip>
	</div>
	<np-input-18n 
	  class="input"
	  field="$ctrl.data.annotation"
	  on-field-change="$ctrl.onUpdate()"
	  do-validate="true"
	  x-inputtype="textarea"
	  on-emit-name="$ctrl.onName($taName)"
	  np-autofocus>
  </np-input-18n>
</div>'
`;

interface IAnnotationFieldBindings extends IProducerInputFieldController {
  data: IEvent;
  onUpdate: () => void;
}

class AnnotationFieldController implements IAnnotationFieldBindings {
  data: IEvent;
  onUpdate: () => void;
  //
  textAreaName: string;
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

export class AnnotationField implements ng.IComponentOptions {
  bindings: IComponentBindings = {
    data: '<',
    onUpdate: '&'
  };
  template: string = TEMPLATE;
  controller = AnnotationFieldController;
  static Name: string = 'npAnnotationField'; // tslint:disable-line
}

export default function ittAnnotationField() {
  return {
    restrict: 'EA',
    scope: {
      data: '=',
      ittItemForm: '=',
      onUpdate: '&?'
    },
    template: [
      '<div class="field">',
      '	<div class="label">Annotation Text [{{$ctrl.appState.lang}}]',
      '		<itt-validation-tip ng-if="$ctrl.ittItemForm[$ctrl.textAreaName].$invalid" text="Annotation Text is a required field"></itt-validation-tip>',
      '	</div>',
      '	<div class="input" sxs-input-i18n="$ctrl.data.annotation" on-field-change="$ctrl.onUpdate()" do-validate="true" x-inputtype="\'textarea\'" on-emit-name="$ctrl.onName($taName)" np-autofocus></div>',
      '</div>'
    ].join('\n'),
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
