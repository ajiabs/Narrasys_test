// @npUpgrade-inputFields-true
import { IEpisode, IEvent } from '../../../models';
import { existy } from '../../../shared/services/ittUtils';

/**
 * Created by githop on 6/30/16.
 */
const TEMPLATE = `
<div class="field" ng-if="$ctrl.isVisible">
	<div class="label">Title [{{$ctrl.appState.lang}}]
		<itt-validation-tip
		  ng-if="$ctrl.ittItemForm[$ctrl.textAreaName].$invalid"
		  text="Title is a required field">
    </itt-validation-tip>
	</div>
	<div class="input"
	  ng-model-options="$ctrl.modelOpts"
	  do-validate="$ctrl.doValidate"
	  sxs-input-i18n="$ctrl.data.title"
	  on-emit-name="$ctrl.onName($taName)"
	  on-field-change="$ctrl.onFieldChange()"
	  x-inputtype="'input'" autofocus></div>
</div>
`;

interface ITitleFieldBindings extends ng.IComponentController {
  data: IEpisode | IEvent;
  modelOpts?: ng.INgModelOptions;
  doValidate?: boolean;
  ittItemForm?: ng.IFormController;
  onFieldChange: () => void;
}

class TitleFieldController implements ITitleFieldBindings {
  data: IEpisode | IEvent;
  modelOpts?: ng.INgModelOptions;
  doValidate?: boolean;
  ittItemForm?: ng.IFormController;
  onFieldChange: () => void;
  //
  textAreaName: string;
  static $inject = ['appState', 'selectService'];

  constructor(public appState, public selectService) {
    //
  }

  get isVisible() {
    return this.selectService.getVisibility('titleField');
  }

  $onInit() {
    if (!existy(this.modelOpts)) {
      this.modelOpts = { updateOn: 'default' };
    }
  }

  onName(v) {
    this.textAreaName = v;
  }
}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class TitleField implements ng.IComponentOptions {
  bindings: IComponentBindings = {
    data: '<',
    modelOpts: '<?',
    doValidate: '<?',
    ittItemForm: '<?',
    onFieldChange: '&?'
  };
  template: string = TEMPLATE;
  controller = TitleFieldController;
  static Name: string = 'npTitleField'; // tslint:disable-line
}

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
