// @npUpgrade-inputFields-true

import { ILangformFlags } from '../../episode/services/episodeEdit.service';

/**
 * Created by githop on 8/23/16.
 */

const TEMPLATE = `
<div class="field">
	<div class="label">Languages</div>
	<div class="input">
	<label>
		<input type="checkbox" ng-model="$ctrl.langForm.en" ng-change="$ctrl.onLangflagChange()">English
	</label>
	<label>
		<input type="checkbox" ng-model="$ctrl.langForm.es" ng-change="$ctrl.onLangflagChange()">Spanish
	</label>
	<label>
		<input type="checkbox" ng-model="$ctrl.langForm.zh" ng-change="$ctrl.onLangflagChange()">Chinese
	</label>
	<label>
		<input type="checkbox" ng-model="$ctrl.langForm.pt" ng-change="$ctrl.onLangflagChange()">Portuguese
	</label>
	<label>
		<input type="checkbox" ng-model="$ctrl.langForm.fr" ng-change="$ctrl.onLangflagChange()">French
	</label>
	<label>
		<input type="checkbox" ng-model="$ctrl.langForm.de" ng-change="$ctrl.onLangflagChange()">German
	</label>
	<label>
		<input type="checkbox" ng-model="$ctrl.langForm.it" ng-change="$ctrl.onLangflagChange()">Italian
	</label>
	</div>
</div>
`;

interface ILanguageFlagsBindings extends ng.IComponentController {
  langForm: ILangformFlags;
  onLangflagChange: () => void;
}

class LanguageFlagsController implements ILanguageFlagsBindings {
  langForm: ILangformFlags;
  onLangflagChange: () => void;
  static $inject = [];

  constructor() {
    //
  }

  $onInit() {
    //
  }
}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class LanguageFlags implements ng.IComponentOptions {
  bindings: IComponentBindings = {
    langForm: '<',
    onLangflagChange: '&'
  };
  template: string = TEMPLATE;
  controller = LanguageFlagsController;
  static Name: string = 'npLanguageFlags'; // tslint:disable-line
}

// tslint//impure, currently depends on inheriting scope for 'langform'
// export default function ittLanguageFlags() {
//   return {
//     restrict: 'EA',
//     template: [
//
//     ].join('\n')
//   };
// }

