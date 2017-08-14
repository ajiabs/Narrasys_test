/**
 * Created by githop on 8/23/16.
 */
import {ILangForm, ISelectService} from '../interfaces';
import {IEvent} from '../models';

const TEMPLATE = `
<div class="field">
	<div class="label">Default Language</div>
	<div class="input">
		<select
		  ng-model="$ctrl.data.defaultLanguage"
		  ng-options="option.value as option.name for option in $ctrl.langOpts"
		  np-options-disabled="option.isDisabled for option in $ctrl.langOpts"></select>
	</div>
</div>
`;

interface ILanguageSelectBindings extends ng.IComponentController {
  data: IEvent;
  langForm: ILangForm;
}

class LanguageSelectController implements ILanguageSelectBindings {
  data: IEvent;
  langForm: ILangForm;
  langOpts: any;
  static $inject = ['selectService'];
  constructor(public selectService: ISelectService) {
    //
  }

  $onChanges(changesObj) {

    if (changesObj.langForm.isFirstChange()) {
      // onChanges fires before onInit so we can do our init on the first tick.
      this.langOpts = this.selectService.getSelectOpts('language');

    } else if (changesObj.langForm && changesObj.langForm.currentValue) {

      this.langOpts = this.langOpts.map((l) => {
        changesObj.langOpts.currentValue.forEach((v, k) => {
          if (l.value === k) {
            l.isDisabled = !v;
          }
        });
        return l;
      });
    }
  }

}

export class LanguageSelect implements ng.IComponentOptions {
  bindings: any = {
    data: '=',
    langForm: '<'
  };
  template: string = TEMPLATE;
  controller = LanguageSelectController;
  static Name: string = 'npLanguageSelect'; // tslint:disable-line
}

// export default function ittLanguageSelect() {
//   return {
//     restrict: 'EA',
//     scope: {
//       data: '=',
//       langForm: '=?'
//     },
//     template: [
//       '<div class="field">',
//       '	<div class="label">Default Language</div>',
//       '	<div class="input">',
//       '		<select ng-model="$ctrl.data.defaultLanguage" ng-options="{{$ctrl.setNgOpts()}}" itt-options-disabled="option.isDisabled for option in $ctrl.langOpts"></select>',
//       '	</div>',
//       '</div>'
//     ].join('\n'),
//     controller: ['$scope', 'selectService', function ($scope, selectService) {
//       var ctrl = this;
//       ctrl.getSelectOpts = selectService.getSelectOpts.bind(selectService);
//       ctrl.setNgOpts = setNgOpts;
//       ctrl.langOpts = selectService.getSelectOpts('language');
//
//       $scope.$watch(watchLangForm, handleUpdates, true);
//
//       function setNgOpts() {
//         return "option.value as option.name for option in $ctrl.langOpts";
//       }
//
//       function watchLangForm() {
//         return ctrl.langForm;
//       }
//
//       //read the state of the lang form, set the disabled state
//       //from the state of the language checkbox.
//       function handleUpdates(nv) {
//         ctrl.langOpts = ctrl.langOpts.map(function (l) {
//           angular.forEach(nv, function (v, k) {
//             if (l.value === k) {
//               l.isDisabled = !v;
//             }
//           });
//           return l;
//         });
//       }
//
//     }],
//     controllerAs: '$ctrl',
//     bindToController: true
//   };
// }
