// @npUpgrade-question-false
/**
 * Created by githop on 6/30/16.
 */
export default function ittQuestionTypeSelect() {
  return {
    restrict: 'EA',
    scope: {
      data: '='
    },
    template: [
      '<div class="field">',
      '	<div class="label">Template</div>',
      '	<div class="input">',
      '	<select ng-model="$ctrl.data.data._plugin.questiontype" ng-options="{{$ctrl.setNgOpts(\'questionType\')}}"></select>',
      '	</div>',
      '</div>'
    ].join(' '),
    controller: ['selectService', 'ittUtils', function (selectService, ittUtils) {
      var ctrl = this;
      ctrl.setNgOpts = ittUtils.setNgOpts;
      ctrl.getSelectOpts = selectService.getSelectOpts;
      ctrl.selectService = selectService;
      onInit();

      function onInit() {
        //initialize layout data by forcing a pass through the select service.
        selectService.onSelectChange(ctrl.data, {});
      }

    }],
    controllerAs: '$ctrl',
    bindToController: true
  };
}
