// @npUpgrade-inputFields-false
/**
 * Created by githop on 8/23/16.
 */

export default function ittLanguageSelect() {
  return {
    restrict: 'EA',
    scope: {
      data: '=',
      langForm: '=?'
    },
    template: [
      '<div class="field">',
      '	<div class="label">Default Language</div>',
      '	<div class="input">',
      '		<select ng-model="$ctrl.data.defaultLanguage" ng-options="{{::$ctrl.setNgOpts()}}"></select>',
      '	</div>',
      '</div>'
    ].join('\n'),
    controller: ['$scope', 'selectService', function ($scope, selectService) {
      var ctrl = this;
      ctrl.getSelectOpts = selectService.getSelectOpts;
      ctrl.setNgOpts = setNgOpts;
      ctrl.langOpts = selectService.getSelectOpts('language');

      $scope.$watch(watchLangForm, handleUpdates, true);

      function setNgOpts() {
        return 'option.value as option.name disable when option.isDisabled for option in $ctrl.langOpts';
      }

      function watchLangForm() {
        return ctrl.langForm;
      }

      //read the state of the lang form, set the disabled state
      //from the state of the language checkbox.
      function handleUpdates(nv) {
        ctrl.langOpts = ctrl.langOpts.map(function (l) {
          angular.forEach(nv, function (v, k) {
            if (l.value === k) {
              l.isDisabled = !v;
            }
          });
          return l;
        });
      }

    }],
    controllerAs: '$ctrl',
    bindToController: true
  };
}
