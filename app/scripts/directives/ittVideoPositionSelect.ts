/**
 *
 * Created by githop on 6/30/16.
 */
import {IEvent} from '../models';

const TEMPLATE = `
<div class="field" ng-if="$ctrl.selectService.getVisibility('videoPosition')">
  <div class="label">Video Postion</div>
  <div class="input">
    <select
      ng-model="$ctrl.data.layouts[0]"
      ng-options="option.value as option.name for option in $ctrl.selectService.getSelectOpts('video')">
    </select>
  </div>
</div>
`;

interface IVideoPositionSelectBindings {
  data: IEvent;
}

class VideoPositionSelectController implements IVideoPositionSelectBindings {
  data: IEvent;
  static $inject = ['$rootScope', '$timeout', 'selectService'];
  constructor(
    public $rootScope: ng.IRootScopeService,
    public $timeout: ng.ITimeoutService,
    public selectService) {
    //
  }
}

export class VideoPositionSelect implements ng.IComponentOptions {
  bindings: any = {
    data: '='
  };
  template: string = TEMPLATE;
  controller = VideoPositionSelectController;
  static Name: string = 'ittVideoPositionSelect'; // tslint:disable-line
}
