// @npUpgrade-inputFields-false
import { IEvent } from '../../../models';

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
  itemForm: ng.IFormController;
}

class ImageFieldController implements IImageFieldBindings {
  data: IEvent;
  itemForm: ng.IFormController;
  static $inject = ['selectService'];
  constructor(public selectService) {
    //
  }

  get imageUploadVisibility() {
    return this.selectService.getVisibility('imageUpload');
  }

  $onInit() {
    console.log('huh', this.data);
  }
}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class ImageField implements ng.IComponentOptions {
  bindings: IComponentBindings = {
    data: '<',
    itemForm: '<'
  };
  template: string = TEMPLATE;
  controller = ImageFieldController;
  static Name: string = 'npImageField'; // tslint:disable-line
}

export default function ittImageField() {
  return {
    restrict: 'EA',
    template: [
      '<div class="field" ng-show="selectService.getVisibility(\'imageUpload\')">',
      '	<div class="label">Image',
      '		<itt-validation-tip ng-if="ittItemForm.itemAsset.$invalid" text="Image is required"></itt-validation-tip>',
      '	</div>',
      '	<div class="input" np-upload-producer-template></div>',
      '</div>'
    ].join(' ')
  };
}
