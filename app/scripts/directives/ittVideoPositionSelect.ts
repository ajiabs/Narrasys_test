/**
 *
 * Created by githop on 6/30/16.
 */
import {UPDATE_MAGNET} from '../constants';

class VideoPositionSelectController {
  static $inject = ['$rootScope', '$timeout', 'selectService'];
  constructor(
    public $rootScope: ng.IRootScopeService,
    public $timeout: ng.ITimeoutService,
    public selectService) {
    //
  }

  repositionVideo() {
    // wait 100ms to allow css that flips the columns to settle
    this.$timeout(() => {
      this.$rootScope.$emit(UPDATE_MAGNET);
    }, 100);
  }
}

export default function ittVideoPositionSelect() {
  return {
    restrict: 'EA',
    scope: {
      data: '='
    },
    template: `
<div class="field" ng-if="$ctrl.selectService.getVisibility('videoPosition')">
  <div class="label">Video Postion</div>
  <div class="input">
    <select
      ng-model="$ctrl.data.layouts[0]"
      ng-change="$ctrl.repositionVideo()"
      ng-options="option.value as option.name for option in $ctrl.selectService.getSelectOpts('video')">
    </select>
  </div>
</div>
    `,
    controller: VideoPositionSelectController,
    controllerAs: '$ctrl',
    bindToController: true
  };
}
