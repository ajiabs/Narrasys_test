// @npUpgrade-inputFields-true
import { IProducerInputFieldController } from '../input-fields.module';
import { IAnnotation, IEvent } from '../../../models';

/**
 *
 * Created by githop on 6/30/16.
 */

const TEMPLATE = `
<div class="field">
	<div class="label">{{$ctrl.label}} [{{$ctrl.appState.lang}}]
		<itt-validation-tip
		  ng-if="$ctrl.validationForm[$ctrl.textAreaName].$invalid"
		  text="Annotation Text is a required field">
    </itt-validation-tip>
	</div>
	<np-input-i18n 
	  class="input"
	  field="$ctrl.data.annotation"
	  on-field-change="$ctrl.dispatchUpdate($field)"
	  do-validate="true"
	  inputtype="textarea"
	  on-emit-name="$ctrl.onName($taName)"
	  np-autofocus>
  </np-input-i18n>
</div>'
`;

interface IAnnotationFieldBindings extends IProducerInputFieldController {
  data: IAnnotation;
  label: 'Annotation Text' | 'Transcript';
  validationForm: ng.IFormController;
  onUpdate?: ($ev: { $item: IEvent }) => ({ $item: IEvent });
}

class AnnotationFieldController implements IAnnotationFieldBindings {
  data: IAnnotation;
  label: 'Annotation Text' | 'Transcript';
  validationForm: ng.IFormController;
  onUpdate?: ($ev: { $item: IEvent }) => ({ $item: IEvent });
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

  dispatchUpdate($field) {
    // $field is the value emitted from InputI18n
    this.data.annotation = $field;
    this.onUpdate({ $item: this.data });
  }
}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class AnnotationField implements ng.IComponentOptions {
  bindings: IComponentBindings = {
    data: '<',
    label: '@',
    validationForm: '<',
    onUpdate: '&'
  };
  template: string = TEMPLATE;
  controller = AnnotationFieldController;
  static Name: string = 'npAnnotationField'; // tslint:disable-line
}
