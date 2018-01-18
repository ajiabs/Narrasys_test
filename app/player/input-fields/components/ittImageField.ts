// @npUpgrade-inputFields-true
import { IEvent } from '../../../models';
import { IEpisodeEditService } from '../../../interfaces';
import { IItemForm } from '../../services/select/selectService';

/**
 * Created by githop on 6/30/16.
 */

const TEMPLATE = `
<div class="field" ng-show="$ctrl.imageUploadVisibility">
	<div class="label">Image
		<itt-validation-tip ng-if="$ctrl.itemForm.itemAsset.$invalid" text="Image is required"></itt-validation-tip>
	</div>
	<div class="input" np-upload-producer-template></div>
</div>
`;

interface IImageFieldBindings extends ng.IComponentController {
  data: IEvent;
  validationForm: ng.IFormController;
  itemForm: IItemForm;
  episodeContainerId: string;
}

class ImageFieldController implements IImageFieldBindings {
  data: IEvent;
  validationForm: ng.IFormController;
  itemForm: IItemForm;
  episodeContainerId: string;
  static $inject = ['selectService', 'episodeEdit', 'appState'];
  constructor(public selectService, public episodeEdit: IEpisodeEditService, public appState) {
    //
  }

  get imageUploadVisibility() {
    return this.selectService.getVisibility('imageUpload');
  }

  $onInit() {
    //
  }
}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class ImageField implements ng.IComponentOptions {
  bindings: IComponentBindings = {
    data: '<',
    validationForm: '<',
    itemForm: '<',
    episodeContainerId: '@'
  };
  template: string = TEMPLATE;
  controller = ImageFieldController;
  static Name: string = 'npImageField'; // tslint:disable-line
}
