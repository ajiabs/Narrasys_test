// @npUpgrade-inputFields-true
import { IEpisode, IEvent } from '../../../models';
import { existy } from '../../../shared/services/ittUtils';

/**
 *
 * Created by githop on 6/30/16.
 */

const TEMPLATE = `
<div class="field">
	<div class="label">Description [{{$ctrl.lang}}]</div>
	<np-input-i18n
	  class="input"
	  field="$ctrl.data.description"
	  on-field-change="$ctrl.onFieldChange()"
	  inputtype="textarea">
  </np-input-i18n>
</div>
`;

interface IDescriptionFieldBindings extends ng.IComponentController {
  data: IEpisode | IEvent;
  modelOpts: ng.INgModelOptions;
  onFieldChange: () => void;
}

class DescriptionFieldController implements IDescriptionFieldBindings {
  data: IEpisode | IEvent;
  modelOpts: ng.INgModelOptions;
  onFieldChange: () => void;
  static $inject = ['appState'];

  constructor(public appState) {
    //
  }

  get lang() {
    return this.appState.lang;
  }

  $onInit() {
    if (!existy(this.modelOpts)) {
      this.modelOpts = { updateOn: 'default' };
    }
  }
}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class DescriptionField implements ng.IComponentOptions {
  bindings: IComponentBindings = {
    data: '<',
    modelOpts: '<?',
    onFieldChange: '&?'
  };
  template: string = TEMPLATE;
  controller = DescriptionFieldController;
  static Name: string = 'npDescriptionField'; // tslint:disable-line
}

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
