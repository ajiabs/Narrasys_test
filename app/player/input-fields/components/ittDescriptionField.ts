// @npUpgrade-inputFields-false
/**
 *
 * Created by githop on 6/30/16.
 */

export default function ittDescriptionField() {
  return {
    restrict: 'EA',
    scope: {
      data: '=',
      modelOpts: '=?'
    },
    template: [
      '<div class="field">',
      '	<div class="label">Description [{{descriptionField.lang}}]</div>',
      '	<div class="input" ng-model-options="descriptionField.modelOpts" sxs-input-i18n="descriptionField.data.description" x-inputtype="\'textarea\'"></div>',
      '</div>'
    ].join(' '),
    controller: ['appState', 'ittUtils', function (appState, ittUtils) {
      var ctrl = this;
      ctrl.lang = appState.lang;
      if (!ittUtils.existy(ctrl.modelOpts)) {
        ctrl.modelOpts = {updateOn: 'default'};
      }
    }],
    controllerAs: 'descriptionField',
    bindToController: true
  };
}
