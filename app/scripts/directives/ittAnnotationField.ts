/**
 *
 * Created by githop on 6/30/16.
 */

export default function ittAnnotationField() {
  return {
    restrict: 'EA',
    scope: {
      data: '=',
      ittItemForm: '='
    },
    template: [
      '<div class="field">',
      '	<div class="label">Annotation Text [{{$ctrl.appState.lang}}]',
      '		<itt-validation-tip ng-if="$ctrl.ittItemForm[$ctrl.textAreaName].$invalid" text="Annotation Text is a required field"></itt-validation-tip>',
      '	</div>',
      '	<div class="input" sxs-input-i18n="$ctrl.data.annotation" do-validate="true" x-inputtype="\'textarea\'" on-emit-name="$ctrl.onName($taName)" autofocus></div>',
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
