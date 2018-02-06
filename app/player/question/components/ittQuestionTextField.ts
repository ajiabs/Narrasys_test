// @npUpgrade-question-true
import { IPlugin } from '../../../models';

/**
 * Created by githop on 6/30/16.
 */

const TEMPLATE = `
<div class="field">
	<div class="label">Question text
		<itt-validation-tip
		  ng-if="$ctrl.ittItemForm[$ctrl.textAreaName].$invalid"
		  text="Question Text is a required field">
    </itt-validation-tip>
	</div>
	<np-input-i18n
	  class="input"
	  do-validate="$ctrl.doValidate"
	  on-emit-name="$ctrl.onName($taName)"
	  on-field-change="$ctrl.emitUpdate($field)"
	  field="$ctrl.data.data._plugin.questiontext"
	  inputtype="textarea">
  </np-input-i18n>
</div>
`;

interface IQuestionTextFieldBindings extends ng.IComponentController {
  data: IPlugin;
  doValidate: boolean;
  itemForm: ng.IFormController;
  onUpdate: () => void;
}

class QuestionTextFieldController implements IQuestionTextFieldBindings {
  data: IPlugin;
  doValidate: boolean;
  itemForm: ng.IFormController;
  onUpdate: () => void;
  //
  textAreaName: string;
  static $inject = ['$timeout'];

  constructor(private $timeout: ng.ITimeoutService) {
    //
  }

  onName(v) {
    this.textAreaName = v;
  }

  emitUpdate($field) {
    this.$timeout(() => {
      this.data.data._plugin.questiontext = $field;
      this.onUpdate();
    });
  }
}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class QuestionTextField implements ng.IComponentOptions {
  bindings: IComponentBindings = {
    data: '<',
    doValidate: '<',
    ittItemForm: '<',
    onUpdate: '&'
  };
  template: string = TEMPLATE;
  controller = QuestionTextFieldController;
  static Name: string = 'npQuestionTextField'; // tslint:disable-line
}
