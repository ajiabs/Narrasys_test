import { IEvent } from '../../../models';
import { IEpisodeEditService, IItemForm } from '../../../interfaces';

const TEMPLATE = `
<div class="field" ng-show="$ctrl.visibility">
	<div class="label">{{$ctrl.label}}
		<itt-validation-tip ng-if="$ctrl.showValidationTip" text="{{$ctrl.label}} is required"></itt-validation-tip>
	</div>
	<div ng-if="$ctrl.context === 'producer'" class="input" np-upload-producer-template></div>
	<div ng-if="$ctrl.context === 'editor'" class="input" np-upload-sxs-template></div>
</div>
`;

interface IProducerUploadFieldBindings extends ng.IComponentController {
  context: 'editor' | 'producer';
  label: 'Image' | 'File' | 'Speaker thumbnail';
  data: IEvent;
  validationForm: ng.IFormController;
  itemForm: IItemForm;
  episodeContainerId: string;
}

class ProducerUploadFieldController implements IProducerUploadFieldBindings {
  context: 'editor' | 'producer';
  label: 'Image' | 'File' | 'Speaker thumbnail';
  data: IEvent;
  validationForm: ng.IFormController;
  itemForm: IItemForm;
  episodeContainerId: string;
  static $inject = ['selectService', 'episodeEdit'];

  constructor(public selectSerivce, public episodeEdit: IEpisodeEditService) {
    //
  }

  get visibility() {
    if (this.label === 'Image') {
      return this.selectSerivce.getVisibility('imageUpload');
    }
    return true;
  }

  get showValidationTip() {
    return (
      this.validationForm != null &&
      this.validationForm.itemAsset &&
      this.validationForm.itemAsset.$invalid
    );
  }

  $onDestroy() {
    this.episodeEdit.resetUploadView();
  }
}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class ProducerUploadField implements ng.IComponentOptions {
  bindings: IComponentBindings = {
    context: '@',
    label: '@',
    data: '<',
    validationForm: '<?',
    itemForm: '<',
    episodeContainerId: '@'
  };
  template: string = TEMPLATE;
  controller = ProducerUploadFieldController;
  static Name: string = 'npProducerUploadField'; // tslint:disable-line
}
