// @npUpgrade-inputFields-true
import { IEpisode, IEvent } from '../../../models';
import { existy } from '../../../shared/services/ittUtils';
import { IProducerInputFieldController } from '../input-fields.module';

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
	<np-input-i18n
	  class="input"
	  ng-model-options="$ctrl.modelOpts"
	  do-validate="$ctrl.doValidate"
	  field="$ctrl.data.title"
	  on-emit-name="$ctrl.onName($taName)"
	  on-field-change="$ctrl.onUpdate()"
	  inputtype="input"
	  np-autofocus>
  </np-input-i18n>
</div>
`;

interface ITitleFieldBindings extends IProducerInputFieldController {
  data: IEpisode | IEvent;
  modelOpts?: ng.INgModelOptions;
  doValidate?: boolean;
  ittItemForm?: ng.IFormController;
  onUpdate: () => void;
}

class TitleFieldController implements ITitleFieldBindings {
  data: IEpisode | IEvent;
  modelOpts?: ng.INgModelOptions;
  doValidate?: boolean;
  ittItemForm?: ng.IFormController;
  onUpdate: () => void;
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
    onUpdate: '&?'
  };
  template: string = TEMPLATE;
  controller = TitleFieldController;
  static Name: string = 'npTitleField'; // tslint:disable-line
}
