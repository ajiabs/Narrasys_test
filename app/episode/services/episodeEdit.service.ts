import {
  createInstance,
  IContainer,
  IEpisode,
  IEpisodeTemplate,
  IEvent,
  IScene,
  ITemplate
} from '../../scripts/models';
import { IDataSvc, IEpisodeTheme, IModelSvc, Partial, ITimelineSvc } from '../../scripts/interfaces';

export interface IEpisodeEditService {
  updateEpisodeTemplate(episode: IEpisode, templateId: string): ng.IPromise<IEpisode>;
  addEpisodeToContainer(newContainer: IContainer): ng.IPromise<IContainer>;
  setEpisodeToEdit(): void;
  saveEpisode(episode: IEpisode): void;
}

export class EpisodeEditService implements IEpisodeEditService {
  static Name = 'episodeEdit'; // tslint:disable-line
  static $inject = [
    '$timeout',
    'appState',
    'selectService',
    'modelSvc',
    'dataSvc',
    'episodeTheme',
    'playbackService',
    'timelineSvc'
  ];

  constructor(private $timeout: ng.ITimeoutService,
              private appState,
              private selectService,
              private modelSvc: IModelSvc,
              private dataSvc: IDataSvc,
              private episodeTheme: IEpisodeTheme,
              private playbackService,
              private timelineSvc: ITimelineSvc) {
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
    this.appState.videoControlsActive = true; // TODO see playerController showControls;
    this.appState.videoControlsLocked = true; // this may not be sufficient on touchscreens
  }

  saveEpisode($episode: IEpisode) {
    const toSave = angular.copy(this.appState.editEpisode);
    console.log('wtf?', toSave);

    this.dataSvc.storeEpisode(toSave)
      .then((data: any) => {
        this.modelSvc.cache('episode', this.dataSvc.resolveIDs(data));
        if (this.appState.editEpisode._master_asset_was_changed) {
          delete this.modelSvc.episodes[data._id]._master_asset_was_changed; // probably unnecessary
          const duration = this.modelSvc.assets[data.master_asset_id].duration;
          const endTime = duration - 0.01;
          this.modelSvc.episodes[this.appState.episodeId].masterAsset = this.modelSvc.assets[$episode.master_asset_id];
          this.modelSvc.episodes[this.appState.episodeId].master_asset_id = data.master_asset_id;

          /*
           iterate through episode.scenes.
           if start time > duration, delete the scene.
           if end time > duration, set end time to duration.
           iterate through episode.items.
           if start or end time > duration, set to duration.

           update ending scene
           resolveEpisode and resolveEpisodeEvents

           */
          const modifiedEvents = [];
          const deletedScenes = [];

          const episode = this.modelSvc.episodes[toSave._id];
          angular.forEach(episode.scenes, (scene) => {

            if (scene.start_time > duration) {
              deletedScenes.push(scene);
            } else if (scene.end_time > duration) {
              scene.end_time = endTime;
              modifiedEvents.push(scene);
            }
          });
          angular.forEach(episode.items, (item) => {
            if (item.start_time > duration) {
              item.start_time = endTime;
            }
            if (item.end_time > duration) {
              item.end_time = endTime;
            }
            modifiedEvents.push(item);
          });

          const endingScene = this.modelSvc.events['internal:endingscreen:' + toSave._id];
          if (endingScene) { // if episode was shortened, this might have been one that was deleted
            endingScene.start_time = endTime;
            endingScene.end_time = endTime;
          } else {
            this.modelSvc.addEndingScreen(toSave._id);
          }

          this.modelSvc.resolveEpisodeEvents(this.appState.episodeId);
          // modelSvc.resolveEpisodeContainers(appState.episodeId); // only needed for navigation_depth changes
          this.modelSvc.resolveEpisodeAssets(this.appState.episodeId); // TODO I suspect this is unnecessary...
          this.playbackService.setMetaProp('duration', duration);
          this.appState.editEpisode = false;
          this.appState.videoControlsLocked = false;
          this.timelineSvc.init(this.appState.episodeId);

          // push each of modifiedEvents to server (TODO combine these into one call!)
          angular.forEach(modifiedEvents, (event) => {
            if (event._id.indexOf('internal') < 0) {
              this.dataSvc.storeItem(event);
            }
          });
          // ditto for orphaned scenes
          angular.forEach(deletedScenes, (scene) => {
            if (scene._id.indexOf('internal') < 0) {
              this.dataSvc.deleteItem(scene._id);
            }
          });

          // HACK HACK HACK super brute force -- something is going screwy with the timeline and video here,
          // especially when we switch from youtube to native or vv.  Force it with a full reload.
          // (Note this makes a lot of the above re-init code redundant,
          // but I'm hopeful I'll someday have time to fix this prOH HA HA HA I COULDNT SAY IT WITH A STRAIGHT FACE)
          this.$timeout(
            () => {
              window.location.reload();
            },
            500
          );

        } else {
          // modelSvc.resolveEpisodeContainers(appState.episodeId); // only needed for navigation_depth changes
          this.modelSvc.resolveEpisodeEvents(this.appState.episodeId);
          this.modelSvc.resolveEpisodeAssets(this.appState.episodeId);
          this.appState.editEpisode = false;
          this.appState.videoControlsLocked = false;

        }
      })
      .catch((data) => {
        console.error('FAILED TO STORE EPISODE', data);
      });
  }

}
