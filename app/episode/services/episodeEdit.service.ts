
import { createInstance, IContainer, IEpisode, IEpisodeTemplate, IEvent, IScene, ITemplate } from '../../scripts/models';
import { IDataSvc, IEpisodeTheme, IModelSvc, Partial } from '../../scripts/interfaces';

export interface IEpisodeEditService {
  updateEpisodeTemplate(episode: IEpisode, templateId: string): ng.IPromise<IEpisode>;
  addEpisodeToContainer(newContainer: IContainer): ng.IPromise<IContainer>;
  setEpisodeToEdit(): void;
}

export class EpisodeEditService implements IEpisodeEditService{
  static Name = 'episodeEdit'; // tslint:disable-line
  static $inject = ['appState', 'selectService', 'modelSvc', 'dataSvc', 'episodeTheme'];
  constructor(
    private appState,
    private selectService,
    private modelSvc: IModelSvc,
    private dataSvc: IDataSvc,
    private episodeTheme: IEpisodeTheme) {
   //
  }

  updateEpisodeTemplate(episode: IEpisode, templateId: string): ng.IPromise<IEpisode> {
    const template = this.dataSvc.getTemplate(templateId) as IEpisodeTemplate;
    const copy = createInstance<IEpisode>('Episode', episode);
    copy.template = template;
    copy.template_id = template.id;
    const derived = this.modelSvc.deriveEpisode(copy);
    this.modelSvc.cache('episode', derived); // because resolveEpisodeEvents pulls from cache by ID
    const resolved = this.modelSvc.resolveEpisodeEvents(derived._id); // needed for template or style changes
    return this.episodeTheme.setTheme(template)
      .then(() => resolved);
  }

  addEpisodeToContainer(newContainer: IContainer): ng.IPromise<IContainer> {
    const newEpisode: Partial<IEpisode> = {
      'container_id': newContainer._id,
      'title': angular.copy(newContainer.name)
    };
    return this.dataSvc.fetchTemplates()
      .then(() => this.dataSvc.getEpisodeTemplatesByCustomerIds([newContainer.customer_id]))
      .then((templates: any) => {
        // do template stuff...
        // if the customer does not have a custom template, use the unbranded one
        if (templates.length === 1) {
          newEpisode.template_id = templates[0].id;
        } else {
          // if they have a custom template, use the first template (by their customer id) that
          // is not the unbranded one
          const customerTemplate = templates.filter(t => t.name !== 'Unbranded');
          newEpisode.template_id = customerTemplate[0].id;
        }
      })
      .then(() => {
        return this.dataSvc.createEpisode(newEpisode)
          .then((epResp: IEpisode) => {
            const newScene = {
              '_type': 'Scene',
              'title': {},
              'description': {},
              'templateUrl': 'templates/scene/1col.html',
              'start_time': 0,
              'end_time': 0,
              'episode_id': epResp._id
            } as IScene;
            return newScene;
          })
          .then((firstScene: IScene) => this.dataSvc.storeItem(firstScene))
          .then(() => newContainer);
      });
  }

  setEpisodeToEdit(): void {
    const episode = this.modelSvc.episodes[this.appState.episodeId];
    const customerId = this.modelSvc.containers[episode.container_id].customer_id;
    this.appState.editEpisode = episode;
    this.appState.editEpisode.templateOpts = this.selectService.getTemplates('episode', [customerId]);
    this.appState.videoControlsActive = true; // TODO see playerController showControls; this may not be sufficient on touchscreens
    this.appState.videoControlsLocked = true;
  }

}
