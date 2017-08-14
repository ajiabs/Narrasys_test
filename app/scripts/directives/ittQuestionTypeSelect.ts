/**
 * Created by githop on 6/30/16.
 */
import {ISelectService} from '../interfaces';
import {IEvent} from '../models';

const TEMPLATE = `
<div class="field">
	<div class="label">Template</div>
	<div class="input">
	<select
	  ng-model="$ctrl.data.data._plugin.questiontype"
	  ng-options="option.value as option.name for option in $ctrl.selectService.getSelectOpts('questionType')"></select>
	</div>
</div>
`;

interface IQuestionTypeSelectBindings extends ng.IComponentController {
  data: IEvent;
}

class QuestionTypeSelectController implements IQuestionTypeSelectBindings {
  data: IEvent;
  static $inject = ['selectService'];

  constructor(public selectService: ISelectService) {
    //
  }

  $onInit() {
    this.selectService.onSelectChange(this.data, {});
  }
}

export class QuestionTypeSelect implements ng.IComponentOptions {
  bindings: any = {
    data: '='
  };
  template: string = TEMPLATE;
  controller = QuestionTypeSelectController;
  static Name: string = 'npQuestionTypeSelect'; // tslint:disable-line
}

// export default function ittQuestionTypeSelect() {
//   return {
//     restrict: 'EA',
//     scope: {
//       data: '='
//     },
//     template: `
// <div class="field">
// 	<div class="label">Template</div>
// 	<div class="input">
// 	<select ng-model="$ctrl.data.data._plugin.questiontype" ng-options="{{$ctrl.setNgOpts(\'questionType\')}}"></select>
// 	</div>
// </div>
//       `,
//
//     controller: ['selectService', 'ittUtils', function (selectService, ittUtils) {
//       var ctrl = this;
//       ctrl.setNgOpts = ittUtils.setNgOpts;
//       ctrl.getSelectOpts = selectService.getSelectOpts.bind(selectService);
//       onInit();
//
//       function onInit() {
//         //initialize layout data by forcing a pass through the select service.
//         selectService.onSelectChange(ctrl.data, {});
//       }
//
//     }],
//     controllerAs: '$ctrl',
//     bindToController: true
//   };
// }
