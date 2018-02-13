// @npUpgrade-inputFields-true
/**
 * Created by githop on 6/30/16.
 */
import { IModelSvc } from '../../../interfaces';
import { createInstance, IAnnotation, IEpisode, IEvent, IScene } from '../../../models';

const TEMPLATE = `
<div class="field" ng-if="$ctrl.isVisible">
	<div class="label">{{$ctrl.labelText}}</div>
	<div class="input" ng-class="{layouts: $ctrl.labelText === 'Template' && $ctrl.data.producerItemType === 'scene'}">
		<select
		  ng-if="$ctrl.context === 'event'"
		  ng-model="$ctrl.data.template_id"
		  ng-change="$ctrl.onSelectChange($ctrl.data, $ctrl.itemForm)"
		  ng-options="option.template_id as option.name disable when option.isDisabled for option in $ctrl.data.templateOpts">
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
  onUpdate: ($ev: { $componentName: string }) => string;
}


class TemplateSelectController implements ITemplateSelectBindings {
  data: IEvent | IEpisode;
  labelText: string = 'Template';
  isAnnotation: boolean;
  isEpisode: boolean;
  context: 'episode' | 'event' = 'event';
  onEpisodeEdit: (ev: any) => ({ $data: { episode: IEpisode, templateId: string } });
  onUpdate: ($ev: { $componentName: string }) => string;
  static $inject = ['selectService', 'modelSvc'];
  constructor(public selectService, public modelSvc: IModelSvc) {
    //
  }

  // $onChanges(changes: { data: ng.IChangesObject }) {
  //   console.log('changes!', changes);
  // }

  $onInit() {
    this.isAnnotation = this.data instanceof IAnnotation;
    this.isEpisode = this.data instanceof IEpisode;

    if (this.data instanceof IEpisode) {
      this.context = 'episode';
      this.labelText = 'Theme';
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
  }

  get isVisible() {
    return this.selectService.getVisibility('templateSelect');
  }

  onSelectChange(item: IEvent, form: ng.IFormController) {
    const newEvent = this.modelSvc.deriveEvent(createInstance(item._type, item));
    // send the newly selected component name to ItemEditor and allow it to
    // to handle the rest.
    this.onUpdate({ $componentName: newEvent.component_name });
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
    data: '<',
    itemForm: '<?',
    onEpisodeEdit: '&',
    onUpdate: '&'
  };
  template: string = TEMPLATE;
  controller = TemplateSelectController;
  static Name: string = 'npTemplateSelect'; // tslint:disable-line
}

