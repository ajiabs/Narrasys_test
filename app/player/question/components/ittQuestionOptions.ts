// @npUpgrade-question-true
import { IProducerInputFieldController } from '../../input-fields/input-fields.module';
import { IPlugin } from '../../../models';

/**
 * Created by githop on 6/30/16.
 */

const TEMPLATE = `
<div class="field">
  <div class="label">Answers</div>
</div>
<div class="field" ng-repeat="distractor in $ctrl.data.data._plugin.distractors track by $index">
  <div class="label">
    {{$index | alpha}} &nbsp;
    <input type="checkbox" ng-model="distractor.correct" ng-change="$ctrl.onFormativeChecked(distractor)"
           ng-if="$ctrl.data.data._plugin.questiontype == 'mc-formative'">
  </div>
  <np-input-i18n
    class="input"
    field="distractor.text"
    on-field-change="$ctrl.onUpdate()"
    inputtype="textarea">
  </np-input-i18n>
</div>
<div class="field">
  <div class="input">
    <button ng-click="$ctrl.addDistractor()">Add distractor</button>
  </div>
</div>
<div class="field" ng-if="$ctrl.data.data._plugin.questiontype == 'mc-formative'">
  <div class="label">Feedback when correct</div>
  <np-input-i18n
    class="input"
    field="$ctrl.data.data._plugin.correctfeedback"
    on-field-change="$ctrl.onUpdate()"
    inputtype="textarea">
  </np-input-i18n>
</div>
<div class="field" ng-if="$ctrl.data.data._plugin.questiontype == 'mc-formative'">
  <div class="label">Feedback when incorrect</div>
  <np-input-18n
    class="input"
    field="$ctrl.data.data._plugin.incorrectfeedback"
    on-field-change="$ctrl.onUpdate()"
    inputtype="textarea">
  </np-input-18n>
</div>
`;

interface IQuestionOptionsBindings extends IProducerInputFieldController {
  data: IPlugin;
  onUpdate: () => void;
}

class QuestionOptionsController implements IQuestionOptionsBindings {
  data: IPlugin;
  onUpdate: () => void;
  static $inject = [];

  constructor() {
    //
  }

  $onInit() {
    //
  }

  addDistractor() {
    this.data.data._plugin.distractors.push({
      text: '',
      index: (this.data.data._plugin.distractors.length + 1)
    });
  }

  onFormativeChecked(distractor) {
    this.data.data._plugin.distractors.forEach((_distractor: any)  => {
      if (_distractor !== distractor) {
        _distractor.correct = undefined;
      }
    });
  }


}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class QuestionOptions implements ng.IComponentOptions {
  bindings: IComponentBindings = {
    data: '<',
    onUpdate: '&'
  };
  template: string = TEMPLATE;
  controller = QuestionOptionsController;
  static Name: string = 'npQuestionOptions'; // tslint:disable-line
}

export default function ittQuestionOptions() {
  return {
    restrict: 'EA',
    scope: true,
    template: [
      '<div class="field"><div class="label">Answers</div></div>',
      '<div class="field" ng-repeat="distractor in item.data._plugin.distractors track by $index">',
      '	<div class="label">',
      '		{{$index | alpha}} &nbsp;',
      '		<input type="checkbox" ng-model="distractor.correct" ng-change="onFormativeChecked(distractor)" ng-if="item.data._plugin.questiontype == \'mc-formative\'">',
      '	</div>',
      '	<div class="input" sxs-input-i18n="distractor.text" x-inputtype="\'textarea\'"></div>',
      '</div>',
      '<div class="field">',
      '	<div class="input">',
      '		<button ng-click="addDistractor($event)">Add distractor</button>',
      '	</div>',
      '</div>',
      '<div class="field" ng-if="item.data._plugin.questiontype == \'mc-formative\'">',
      '	<div class="label">Feedback when correct</div>',
      '	<div class="input" sxs-input-i18n="item.data._plugin.correctfeedback" x-inputtype="\'textarea\'"></div>',
      '</div>',
      '<div class="field" ng-if="item.data._plugin.questiontype == \'mc-formative\'">',
      '	<div class="label">Feedback when incorrect</div>',
      '	<div class="input" sxs-input-i18n="item.data._plugin.incorrectfeedback" x-inputtype="\'textarea\'"></div>',
      '</div>'
    ].join(' ')
  };
}
