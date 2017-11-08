// @npUpgrade-inputFields-true
/**
 * Created by githop on 6/30/16.
 */
import { IModelSvc } from '../../interfaces';
import { createInstance, IAnnotation, IEpisode, IEvent, IScene } from '../../models';

const TEMPLATE = `
<div class="field" ng-if="$ctrl.isVisible">
	<div class="label">{{$ctrl.labelText}}</div>
	<div class="input" ng-class="{layouts: $ctrl.labelText === 'Template' && $ctrl.data.producerItemType === 'scene'}">
		<select
		  ng-if="$ctrl.context === 'event'"
		  ng-model="$ctrl.data.templateUrl"
		  ng-change="$ctrl.onSelectChange($ctrl.data, $ctrl.itemForm)"
		  ng-options="option.url as option.name for option in $ctrl.data.templateOpts"
		  np-options-disabled="option.isDisabled for option in $ctrl.data.templateOpts">
    </select>
    
    <select
      ng-if="$ctrl.context === 'episode'"
		  ng-model="$ctrl.data.template_id"
		  ng-change="$ctrl.onEpisodeTemplateChange()"
		  ng-options="option.id as option.name for option in $ctrl.data.templateOpts">
    </select>
	</div>
</div>`;

interface ITemplateSelectBindings extends ng.IComponentController {
  data: IEvent | IEpisode;
  itemForm?: ng.IFormController;
  onEpisodeEdit: (ev: any) => ({ $data: { episode: IEpisode, templateId: string } });
}

class TemplateSelectController implements ITemplateSelectBindings {
  data: IEvent | IEpisode;
  labelText: string = 'Template';
  isAnnotation: boolean;
  isEpisode: boolean;
  context: 'episode' | 'event' = 'event';
  onEpisodeEdit: (ev: any) => ({ $data: { episode: IEpisode, templateId: string } });
  static $inject = ['selectService', 'modelSvc'];
  constructor(public selectService, public modelSvc: IModelSvc) {
    //
  }

  $onInit() {
    this.isAnnotation = this.data instanceof IAnnotation;
    this.isEpisode = this.data instanceof IEpisode;

    if (this.data instanceof IEpisode) {
      this.context = 'episode';
    }

    if (this.isAnnotation) {
      const currentScene = this.selectService.getSceneName(this.modelSvc.scene((this.data as IScene).scene_id));
      const isCenterVV = currentScene === 'centerVV';
      const isMondrian = currentScene === 'centerVVMondrian';
      //remove H1s for certain layouts - TS-1137
      if (isCenterVV || isMondrian) {
        (this.data as IEvent).templateOpts.forEach((tmpl: any) => {
          if (tmpl.name === 'Header 1') {
            tmpl.isDisabled = true;
          }
        });
      }
    }



    //for episodes, not items (aka events).
    //need a type of 'episode' for our selectSerivce
    //switch statement
    if (!this.data.hasOwnProperty('producerItemType')) {
      this.data.producerItemType = 'episode';
      this.labelText = 'Theme';
    }
  }

  get isVisible() {
    return this.selectService.getVisibility('templateSelect');
  }

  onSelectChange(item: IEvent, form: ng.IFormController) {
    this.selectService.onSelectChange(item, form);
  }

  onEpisodeTemplateChange() {
    const dataToEmit = {
      $data: {
        episode: this.data as IEpisode,
        templateId: this.data.template_id
      }
    };
    this.onEpisodeEdit(dataToEmit);
  }

}

export class TemplateSelect implements ng.IComponentOptions {
  bindings: any = {
    data: '=',
    itemForm: '=?',
    onEpisodeEdit: '&'
  };
  template: string = TEMPLATE;
  controller = TemplateSelectController;
  static Name: string = 'npTemplateSelect'; // tslint:disable-line
}

// export default function ittTemplateSelect() {
//   return {
//     restrict: 'EA',
//     scope: {
//       data: '=',
//       itemForm: '=?'
//     },
//     template: `
// <div class="field" ng-if="$ctrl.isVisible('templateSelect')">
// 	<div class="label">{{$ctrl.labelText}}</div>
// 	<div class="input" ng-class="{layouts: $ctrl.labelText === 'Template' && $ctrl.data.producerItemType === 'scene'}">
// 		<select
// 		  ng-model="$ctrl.data.templateUrl"
// 		  ng-change="$ctrl.onSelectChange($ctrl.data, $ctrl.itemForm)"
// 		  ng-options="option.url as option.name for option in $ctrl.data.templateOpts"
// 		  itt-options-disabled="option.isDisabled for option in $ctrl.data.templateOpts">
//     </select>
// 	</div>
// </div>
//       `,
//     controller: ['selectService', 'modelSvc', function (selectService, modelSvc) {
//       var ctrl = this;
//       ctrl.isVisible = selectService.getVisibility.bind(selectService);
//       ctrl.onSelectChange = selectService.onSelectChange.bind(selectService);
//       ctrl.getSelectOpts = selectService.getSelectOpts.bind(selectService);
//       ctrl.labelText = 'Template';
//
//       var isAnnotation = ctrl.data.producerItemType === 'annotation';
//       var currentScene, isCenterVV, isMondrian;
//       if (isAnnotation) {
//         currentScene = selectService.getSceneName(modelSvc.scene(ctrl.data.scene_id));
//         isCenterVV = currentScene === 'centerVV';
//         isMondrian = currentScene === 'centerVVMondrian';
//         //remove H1s for certain layouts - TS-1137
//         if (isCenterVV || isMondrian) {
//           angular.forEach(ctrl.data.templateOpts, function (tmpl) {
//             if (tmpl.name === 'Header 1') {
//               tmpl.isDisabled = true;
//             }
//           });
//         }
//       }
//
//
//       //for episodes, not items (aka events).
//       //need a type of 'episode' for our selectSerivce
//       //switch statement
//       if (!ctrl.data.hasOwnProperty('producerItemType')) {
//         ctrl.data.producerItemType = 'episode';
//         ctrl.labelText = 'Theme';
//       }
//     }],
//     controllerAs: '$ctrl',
//     bindToController: true
//
//   };
// }
