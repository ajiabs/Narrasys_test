// @npUpgrade-inputFields-true
import { IProducerInputFieldController } from '../input-fields.module';
import { IEvent } from '../../../models';

/**
 * Created by githop on 6/30/16.
 */

const TEMPLATE = `
<div class="field">
	<div class="label">Speaker thumbnail</div>
	<div class="input" np-upload-producer-template></div>
</div>
`;

interface ISpeakerFieldBindings extends IProducerInputFieldController {
  data: IEvent;
}

class SpeakerFieldController implements ISpeakerFieldBindings {
  data: IEvent;
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

export class SpeakerField implements ng.IComponentOptions {
  bindings: IComponentBindings = {};
  template: string = TEMPLATE;
  controller = SpeakerFieldController;
  static Name: string = 'npSpeakerField'; // tslint:disable-line
}

export default function ittSpeakerThumbField() {
  return {
    restrict: 'EA',
    template: [
      '<div class="field">',
      '	<div class="label">Speaker thumbnail</div>',
      '	<div class="input" np-upload-producer-template></div>',
      '</div>'
    ].join(' ')
  };
}
