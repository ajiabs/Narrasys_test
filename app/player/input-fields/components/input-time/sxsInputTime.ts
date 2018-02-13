// @npUpgrade-inputFields-true
/*For form fields: displays m:ss, sets model as number of seconds. accepts s or m:ss as input. */
import { IEvent, IScene } from '../../../../models';
import { IModelSvc } from '../../../../shared/services/modelSvc/modelSvc';
import { existy } from '../../../../shared/services/ittUtils';

const TEMPLATE = `
<span class="floaterContainer">
	<input
	  class="inputfield"
	  ng-model="$ctrl.model"
	  ng-change="$ctrl.handleUpdates()"
	  name="time"
	  ng-focus="$ctrl.showTools(true)"
	  ng-blur="$ctrl.showTools(false)"
	  ng-model-options="{ updateOn: 'blur' }"
	  style="max-width: 150px"
	  ng-class="{invalid: ($ctrl.fieldname == 'end_time' && $ctrl.item.invalid_end_time)}">
	<div class="floater" ng-if="$ctrl.tooltip">

		<ul style="list-style:none; white-space:nowrap">
			<li style="text-align:center; font-size: 150%">
				<a ng-click="$ctrl.nudge(-5)">«</a>
				<a ng-click="$ctrl.nudge(-1)">‹</a>
				<span> &nbsp;&nbsp; </span>
				<a ng-click="$ctrl.nudge(1)">›</a>
				<a ng-click="$ctrl.nudge(5)">»</a>
			</li>
			<li ng-click="$ctrl.setTime($ctrl.playbackService.getMetaProp('time'))">
				<a>Set to current time ({{::$ctrl.format($ctrl.playbackService.getMetaProp('time'))}})</a>
			</li>
			<span ng-if="$ctrl.item._type != 'Scene' && $ctrl.scene().start_time > 0">
				<li ng-if="$ctrl.fieldname=='start_time'" ng-click="$ctrl.setTime($ctrl.scene().start_time)">
					<a>Beginning of layout ({{$ctrl.format($ctrl.scene().start_time)}})</a>
				</li>
				<li ng-if="$ctrl.fieldname=='end_time'" ng-click="$ctrl.setTime($ctrl.scene().end_time)">
					<a>End of layout ({{$ctrl.format($ctrl.scene().end_time)}})</a>
				</li>
				<li ng-if="$ctrl.fieldname=='end_time' && $ctrl.isTranscript()" ng-click="TODO">
					<a>Auto (TODO)</a>
				</li>
			</span>
		</ul>
	</div>
</span>

`;

const validateStartTime = (t: number) => {
  return (existy(t) && t > 0.1);
};

interface IInputTimeBindings extends ng.IComponentController {
  item: IEvent;
  onFieldChange: () => void;
}

class InputTimeController implements IInputTimeBindings {
  item: IEvent;
  onFieldChange: () => void;
  //
  fieldname: string;
  realValue: any;
  model: any;
  ngForm: ng.IFormController;
  scene: any;
  tooltipHider: any;
  episodeDuration: number;
  tooltip: boolean;
  static $inject = [
    '$attrs',
    '$rootScope',
    '$timeout',
    'appState',
    'modelSvc',
    'timelineSvc',
    'playbackService',
    'ittUtils'
  ];

  constructor(
    private $attrs,
    private $rootScope: ng.IRootScopeService,
    private $timeout: ng.ITimeoutService,
    private appState,
    private modelSvc: IModelSvc,
    private timelineSvc,
    private playbackService) {
  }

  $onInit() {
    if (this.item instanceof IScene) {
      this.scene = () =>  {
        return this.item;
      };
    } else {
      this.scene = () => {
        return this.modelSvc.sceneAtEpisodeTime(this.item.cur_episode_id, this.playbackService.getMetaProp('time'));
      };
    }
    this.fieldname = angular.copy(this.$attrs.inputField);
    this.realValue = angular.copy(this.item[this.$attrs.inputField]);
    this.model = this.format(angular.copy(this.item[this.$attrs.inputField]));
    this.episodeDuration = this.modelSvc.episodes[this.item.cur_episode_id].masterAsset.duration;
  }

  parse(data: any) {
    // console.log("Converting view ", data, " to model");
    let ret;
    if (data === undefined || data === '') {
      ret = this.playbackService.getMetaProp('time');
    } else if (isNaN(data)) {
      const mss = data.split(':');
      if (mss.length === 2) {
        if (isNaN(mss[0])) {
          mss[0] = 0;
        }
        if (isNaN(mss[1])) {
          mss[1] = 0;
        }
        ret = (Number(mss[0]) * 60 + Number(mss[1]));
      } else {
        ret = this.playbackService.getMetaProp('time');
      }
    } else {
      ret = data;
    }
    // HACK First scene is bumped a bit after the landing screen...
    if (ret < 0.01) {
      ret = 0.01;
    }
    this.$rootScope.$emit('searchReindexNeeded'); // HACK
    return ret;
  }

  format(data) {
    // convert model value to view value
    // in a way which is not completely borken, for a change
    // srsly how was that even working before
    const mins = Math.floor(data / 60);
    let secs = Math.round((data % 60) * 100) / 100;
    if (secs < 10) {
      secs = '0' + secs;
    }
    return mins + ':' + secs;
  }

  nudge(amt: any) {
    // keep the tooltip panel open:
    this.$timeout.cancel(this.tooltipHider);
    // elem.find('.inputfield').focus();

    // This ends up triggering setTime twice (it changes scope.model, which triggers the $watch)  Oh Well
    const diff = amt / 30; // pretend 1 frame is always 1/30s for now
    this.setTime(this.item[this.$attrs.inputField] + diff);
    if (this.$attrs.inputField === 'start_time') {
      this.timelineSvc.seek(this.item[this.$attrs.inputField] + diff);
    }
  }

  setTime(t: number) { // pass in parsed values only!

    if (this.handelValidation(t) === false) {
      return;
    }

    if (t > this.episodeDuration) {
      t = this.episodeDuration;
    }
    if (this.item.stop) {
      this.item.end_time = t;
    }
    this.realValue = t;
    this.item[this.$attrs.inputField] = this.realValue;
    this.model = this.format(t);
    this.item.invalid_end_time = (this.item.start_time > this.item.end_time);
    this.onFieldChange();
  }

  showTools(x: any) {
    if (x) {
      this.tooltip = true;
    } else {
      // allow time for clicks before we unload the thing being clicked on:
      this.tooltipHider = this.$timeout(
        () => {
          this.tooltip = false;
        },
        300
      );
    }
  }

  isTranscript() {
    // TODO
    return false;
  }

  private handleUpdates() {
    const parsedTime = this.parse(this.model);
    this.setTime(parsedTime);

    // Stop questions should always have the same start + end
    if (this.$attrs.inputField === 'start_time' && this.item.stop) {
      this.item.end_time = parsedTime;
    }

    this.onFieldChange();
  }

  private handelValidation(t: number) {
    this.item.validationMessage = null;
    this.ngForm.time.$setValidity('time', true);

    //these validations are specific to scenes.
    if (this.item._type !== 'Scene') {
      return true;
    }

    let isValidInput = false;
    const validStartTime = validateStartTime(t);
    const isOnExistingScene = this.validateSceneStartTime(t);

    isValidInput = validStartTime && isOnExistingScene;

    if (!isValidInput) {
      if (this.ngForm) {
        this.ngForm.time.$setValidity('time', false);
        this.ngForm.time.$setViewValue(this.format(t));
        this.ngForm.time.$render();


        if (!isOnExistingScene) {
          this.item.validationMessage = 'Scenes cannot share the same start time.';
        }

        if (!validStartTime) {
          this.item.validationMessage = 'For a start time <=0:00.1, please edit the first layout';
        }

      }
    }

    return isValidInput;
  }

  private validateSceneStartTime(t: number) {
    let isOnSameStartTime;
    let isValid = true;
    //don't check the current scene
    if (this.item.start_time !== t) {
      isOnSameStartTime = this.modelSvc.isOnExistingSceneStart(t);
      isValid = !isOnSameStartTime;
    }

    return isValid;
  }
}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class InputTime implements ng.IComponentOptions {
  require = {
    ngForm: '?^^form'
  };
  bindings: IComponentBindings = {
    item: '<',
    onFieldChange: '&'
  };
  template: string = TEMPLATE;
  controller = InputTimeController;
  static Name: string = 'npInputTime'; // tslint:disable-line
}
