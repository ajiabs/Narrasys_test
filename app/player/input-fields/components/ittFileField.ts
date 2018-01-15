// @npUpgrade-inputFields-true
import { IEvent } from '../../../models';

/**
 * Created by githop on 6/30/16.
 */

const TEMPLATE = `
<div class="field">
	<div class="label">File
		<itt-validation-tip ng-if="$ctrl.ittItemForm.itemAsset.$invalid" text="File is required"></itt-validation-tip>
	</div>
	<div class="input" np-upload-producer-template></div>
</div>
`;

interface IFileFieldBindings extends ng.IComponentController {
  data: IEvent;
  itemForm: ng.IFormController;
}

class FileFieldController implements IFileFieldBindings {
  data: IEvent;
  itemForm: ng.IFormController;
}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class FileField implements ng.IComponentOptions {
  bindings: IComponentBindings = {
    data: '<',
    itemForm: '<'
  };
  template: string = TEMPLATE;
  controller = FileFieldController;
  static Name: string = 'npFileField'; // tslint:disable-line
}

export default function ittFileField() {
  return {
    restrict: 'EA',
    scope: true,
    template: [
      '<div class="field">',
      '	<div class="label">File',
      '		<itt-validation-tip ng-if="ittItemForm.itemAsset.$invalid" text="File is required"></itt-validation-tip>',
      '	</div>',
      '	<div class="input" np-upload-producer-template></div>',
      '</div>'
    ].join(' ')
  };
}
