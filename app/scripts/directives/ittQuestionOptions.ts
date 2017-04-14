/**
 * Created by githop on 6/30/16.
 */
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
