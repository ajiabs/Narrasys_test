// @npUpgrade-inputFields-true
/**
 *
 * Created by githop on 6/30/16.
 */
import { IEvent } from '../../../models';
import { IProducerInputFieldController } from '../input-fields.module';

const TEMPLATE = `
<div class="field" ng-if="$ctrl.selectService.getVisibility('videoPosition')">
  <div class="label">Video Position</div>
  <div class="input">
    <select
      ng-change="$ctrl.onUpdate()"
      ng-model="$ctrl.data.layouts[0]"
      ng-options="option.value as option.name for option in $ctrl.selectService.getSelectOpts('video')">
    </select>
  </div>
</div>
`;

interface IVideoPositionSelectBindings extends IProducerInputFieldController {
  data: IEvent;
  onUpdate: () => void;
}

class VideoPositionSelectController implements IVideoPositionSelectBindings {
  data: IEvent;
  onUpdate: () => void;
  static $inject = ['selectService'];

  constructor(public selectService) {
    //
  }
}

export class VideoPositionSelect implements ng.IComponentOptions {
  bindings: any = {
    data: '<',
    onUpdate: '&'
  };
  template: string = TEMPLATE;
  controller = VideoPositionSelectController;
  static Name: string = 'npVideoPositionSelect'; // tslint:disable-line
}
