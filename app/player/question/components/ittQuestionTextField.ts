// @npUpgrade-question-true
import { IEvent } from '../../../models';

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
	  field="$ctrl.data.data._plugin.questiontext"
	  inputtype="textarea">
  </np-input-i18n>
</div>
`;

interface IQuestionTextFieldBindings extends ng.IComponentController {
  data: IEvent;
  doValidate: boolean;
  itemForm: ng.IFormController;
}

class QuestionTextFieldController implements IQuestionTextFieldBindings {
  data: IEvent;
  doValidate: boolean;
  itemForm: ng.IFormController;
  //
  textAreaName: string;
  static $inject = [];

  constructor() {
    //
  }

  $onInit() {
    //
  }

  onName(v) {
    this.textAreaName = v;
  }
}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class QuestionTextField implements ng.IComponentOptions {
  bindings: IComponentBindings = {};
  template: string = TEMPLATE;
  controller = QuestionTextFieldController;
  static Name: string = 'npQuestionTextField'; // tslint:disable-line
}

export default function ittQuestionTextField() {
  return {
    restrict: 'EA',
    scope: {
      data: "=",
      doValidate: '=?',
      ittItemForm: '=?'
    },
    template: [
      '<div class="field">',
      '	<div class="label">Question text',
      '		<itt-validation-tip ng-if="$ctrl.ittItemForm[$ctrl.textAreaName].$invalid" text="Question Text is a required field"></itt-validation-tip>',
      '	</div>',
      '	<div class="input" do-validate="$ctrl.doValidate" on-emit-name="$ctrl.onName($taName)" sxs-input-i18n="$ctrl.data.data._plugin.questiontext" x-inputtype="\'textarea\'"></div>',
      '</div>'
    ].join(' '),
    controller: [function () {
      var ctrl = this;
      ctrl.onName = onName;

      function onName(v) {
        console.log("name!", v);
        ctrl.textAreaName = v;
      }
    }],
    controllerAs: '$ctrl',
    bindToController: true
  };
}

