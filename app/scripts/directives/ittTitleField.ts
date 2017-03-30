/**
 * Created by githop on 6/30/16.
 */


export default function ittTitleField() {
  return {
    restrict: 'EA',
    scope: {
      data: '=',
      modelOpts: '=?',
      doValidate: '=?',
      ittItemForm: '=?'
    },
    template: [
      '<div class="field" ng-if="$ctrl.isVisible(\'titleField\')">',
      '	<div class="label">Title [{{$ctrl.appState.lang}}]',
      '		<itt-validation-tip ng-if="$ctrl.ittItemForm[$ctrl.textAreaName].$invalid" text="Title is a required field"></itt-validation-tip>',
      '	</div>',
      '	<div class="input" ng-model-options="$ctrl.modelOpts" do-validate="$ctrl.doValidate" sxs-input-i18n="$ctrl.data.title" on-emit-name="$ctrl.onName($taName)" x-inputtype="\'input\'" autofocus></div>',
      '</div>'
    ].join(' '),
    controller: ['appState', 'ittUtils', 'selectService', function (appState, ittUtils, selectService) {
      var ctrl = this;
      ctrl.appState = appState;
      ctrl.isVisible = selectService.getVisibility;
      ctrl.onName = onName;

      if (!ittUtils.existy(ctrl.modelOpts)) {
        ctrl.modelOpts = {updateOn: 'default'};
      }

      function onName(v) {
        ctrl.textAreaName = v;
      }

    }],
    controllerAs: '$ctrl',
    bindToController: true
  };
}
