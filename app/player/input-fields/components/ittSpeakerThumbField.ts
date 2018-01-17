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

interface ISpeakerThumbFieldBindings extends IProducerInputFieldController {
  data: IEvent;
}

class SpeakerThumbFieldController implements ISpeakerThumbFieldBindings {
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

export class SpeakerThumbField implements ng.IComponentOptions {
  bindings: IComponentBindings = {};
  template: string = TEMPLATE;
  controller = SpeakerThumbFieldController;
  static Name: string = 'npSpeakerThumbField'; // tslint:disable-line
}
