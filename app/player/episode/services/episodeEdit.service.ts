// @npUpgrade-episode-true
import { IDataSvc, IEpisodeTheme, IModelSvc, Partial, ITimelineSvc, TDataCacheItem, } from '../../../interfaces';
import { createInstance, IContainer, IEpisode, IEpisodeTemplate, IEvent, IScene } from '../../../models';
import { EventTemplates, MIMES } from '../../../constants';

const sortByStartTime = (a, b) => {
  return a.start_time - b.start_time;
};

const fixEndTimes = (scenes, duration) => {
  for (var i = 1, len = scenes.length; i < len; i++) {
    if (i === len - 1) {
      scenes[i].end_time = duration;
    } else {
      if (scenes[i].end_time !== scenes[i + 1].start_time) {
        scenes[i].end_time = scenes[i + 1].start_time;
      }
    }
  }
};

const pushScene = (scenes, scene) => {
  let exists = false;
  for (var i = 0, len = scenes.length; i < len; i++) {
    if (scenes[i]._id === scene._id) {
      exists = true;
      //do nothing, as already exists
      break;
    }
  }
  if (!exists) {
    scenes.push(scene);
  }
};

const removeScene = (scenes, id) => {
  for (var i = 0, len = scenes.length; i < len; i++) {
    if (scenes[i]._id === id) {
      scenes.splice(i, 1);
      break;
    }
  }
};

const resetScenes = (updatedScenes, originalScene) => {
  for (var i = 0; i < updatedScenes.length; i += 1) {
    if (typeof (updatedScenes[i]._id) === 'undefined' || updatedScenes[i]._id === 'internal:editing') {
      updatedScenes.splice(i, 1);
      break;
    }
    if (originalScene) {
      if (updatedScenes[i]._id === originalScene._id) {
        updatedScenes[i] = originalScene;
        break;
      }
    }
  }
  return updatedScenes;
};

const isTranscript = function (item: IEvent) {
  return item._type === 'Annotation' && item.component_name === EventTemplates.TRANSCRIPT_TEMPLATE;
};

const isInternal = (item: IEvent): boolean => {
  return (item._id && /internal/.test(item._id));
};

const getItemIndex = (items, item) => {
  var centerIndex = 0;
  for (var i = 0, len = items.length; i < len; i++) {
    if (items[i]._id === item._id) {
      centerIndex = i;
      break;
    }
  }
  return centerIndex;
};

const filterToItemBefore = (_items, centerItem) => {
  const items = _items.sort(sortByStartTime);
  const centerIndex = getItemIndex(items, centerItem);
  const itemBefore = [];
  if (centerIndex === 0) {
    return itemBefore;
  } else {
    if (centerIndex < items.length - 1) {
      if (centerIndex >= 1) {
        if (!isInternal(items[centerIndex - 1])) {
          itemBefore.push(items[centerIndex - 1]);
        }
      }
    }
  }
  return itemBefore;
};

const filterToBookends = (_items, centerItem) => {
  const items = _items.sort(sortByStartTime);
  const centerIndex = getItemIndex(items, centerItem);
  const itemsBeforeAndAfter = [];

  if (centerIndex === 0) {
    if (centerIndex < items.length - 1) {
      if (!isInternal(items[centerIndex + 1])) {
        itemsBeforeAndAfter.push(items[centerIndex + 1]);
      }
    }
  } else {
    if (centerIndex < items.length - 1) {
      if (!isInternal(items[centerIndex + 1])) {
        itemsBeforeAndAfter.push(items[centerIndex + 1]);
      }
      if (centerIndex >= 1) {
        if (!isInternal(items[centerIndex - 1])) {
          itemsBeforeAndAfter.push(items[centerIndex - 1]);
        }
      }
    }
  }
  return itemsBeforeAndAfter;
};

export interface ILangformFlags {
  en: boolean;
  es?: boolean;
  zh?: boolean;
  pt?: boolean;
  fr?: boolean;
  de?: boolean;
  it?: boolean;
}

export interface IEpisodeEditService {
  episodeLangForm: ILangformFlags;
  canAccess: boolean;
  userHasRole(role: string): boolean;
  updateEpisodeTemplate(episode: IEpisode, templateId: string): ng.IPromise<IEpisode>;
  addEpisodeToContainer(newContainer: IContainer): ng.IPromise<IContainer>;
  setEpisodeToEdit(): void;
  saveEpisode(episode: IEpisode): void;
  detatchMasterAsset(episode: IEpisode): any;
  cancelEpisodeEdit (originalEvent: IEpisode): void;
  cancelEventEdit(originalEvent: IEvent): void;
  addEvent(producerItemType: string): void;
  editEvent(event: IEvent): void;
  editCurrentScene(currentTime: number): void;
  saveEvent(toSave, unmodifiedEvent): ng.IPromise<void>;
  deleteEvent(eventId: string, unmodifiedScene): void;
  getTranscriptItems(): any;
}

export class EpisodeEditService implements IEpisodeEditService {
  episodeLangForm: ILangformFlags = {
    'en': true,
    'es': false,
    'zh': false,
    'pt': false,
    'fr': false,
    'de': false,
    'it': false
  };
  static Name = 'episodeEdit'; // tslint:disable-line
  static $inject = [
    '$timeout',
    '$rootScope',
    'appState',
    'authSvc',
    'selectService',
    'modelSvc',
    'dataSvc',
    'episodeTheme',
    'playbackService',
    'timelineSvc'
  ];

  constructor(private $timeout: ng.ITimeoutService,
              private $rootScope: ng.IRootScopeService,
              private appState,
              private authSvc,
              private selectService,
              private modelSvc: IModelSvc,
              private dataSvc: IDataSvc,
              private episodeTheme: IEpisodeTheme,
              private playbackService,
              private timelineSvc: ITimelineSvc) {
    //
  }

  get canAccess() {
    return this.userHasRole('admin') || this.authSvc.userHasRole('customer admin');
  }

  userHasRole(role: string) {
    return this.authSvc.userHasRole(role);
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
              'templateUrl': 'templates/scene/onecol.html',
              'component_name': EventTemplates.ONECOL_TEMPLATE,
              'start_time': 0,
              'end_time': 0,
              'episode_id': epResp._id
            } as Partial<IScene>;
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

  cancelEpisodeEdit(originalEvent: IEpisode): void {
    console.log('cancel edpisode edit?');
    this.modelSvc.episodes[this.appState.episodeId] = originalEvent;

    this.modelSvc.deriveEpisode(this.modelSvc.episodes[originalEvent._id]);
    this.modelSvc.resolveEpisodeContainers(originalEvent._id); // only needed for navigation_depth changes
    this.modelSvc.resolveEpisodeEvents(originalEvent._id); // needed for template or style changes
    // console.log("Episode StyleCss is now ", modelSvc.episodes[originalEvent._id].styleCss);
    this.episodeTheme.setTheme(originalEvent.template);
    this.appState.editEpisode = false;
    this.appState.videoControlsLocked = false;
  }

  detatchMasterAsset(episode: IEpisode) {
    this.dataSvc.detachMasterAsset(episode)
      .then((data) => {
        window.location.reload(); //?? not sure what to do next.
      });
  }

  saveEpisode($episode: IEpisode) {
    const toSave = angular.copy(this.appState.editEpisode);

    this.dataSvc.storeEpisode(toSave)
      .then((data: any) => {
        this.modelSvc.cache('episode', this.dataSvc.resolveIDs(data));
        if (this.appState.editEpisode._master_asset_was_changed) {
          delete this.modelSvc.episodes[data._id]._master_asset_was_changed; // probably unnecessary
          const duration = this.modelSvc.assets[data.master_asset_id].duration;
          const endTime = duration - 0.01;
          this.modelSvc.episodes[this.appState.episodeId].masterAsset = createInstance(
            'MasterAsset',
            this.modelSvc.assets[$episode.master_asset_id]
          );
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

  addEvent(producerItemType: string): void {
    if (producerItemType === 'scene') {
      const t = Math.round(this.playbackService.getMetaProp('time') * 100) / 100;
      if (this.modelSvc.isOnExistingSceneStart(t)) {
        return this.editCurrentScene(t);
      }
    }
    // console.log("itemEditController.addEvent");
    const newEvent = this.generateEmptyItem(producerItemType);

    newEvent.cur_episode_id = this.appState.episodeId;
    newEvent.episode_id = this.appState.episodeId;
    if (this.appState.user && this.appState.user.avatar_id) {
      newEvent.avatar_id = this.appState.user.avatar_id;
    }
    this.modelSvc.cache('event', newEvent);

    this.appState.editEvent = this.modelSvc.events['internal:editing'];
    // TODO see playerController showControls; this may not be sufficient on touchscreens
    this.appState.videoControlsActive = true;
    this.appState.videoControlsLocked = true;

    this.modelSvc.resolveEpisodeEvents(this.appState.episodeId);
    this.timelineSvc.injectEvents([this.modelSvc.events['internal:editing']]);
    if (producerItemType === 'scene') {
      //to set the defaults on the first pass
      this.selectService.onSelectChange(this.appState.editEvent);
      this.timelineSvc.updateSceneTimes(this.appState.episodeId);
    }
    this.$rootScope.$emit('searchReindexNeeded'); // HACK
  }

  editEvent(event: IEvent) {
    this.appState.editEvent = event;
    this.appState.editEvent.templateOpts = this.selectService.getTemplates(event.producerItemType);
    //second arg to onSelectChange is the itemForm, which is created in ittItemEditor and
    //we do not have access here. Note that itemForm is only really used in background Images.
    //hack fix is to pass in an empty object, and selectService will add the necessary itemForm
    //props.

    const itemForm = this.selectService.setupItemForm(this.appState.editEvent.styles, 'item');

    this.selectService.onSelectChange(this.appState.editEvent, itemForm);
    //// TODO see playerController showControls; this may not be sufficient on touchscreens
    this.appState.videoControlsActive = true;
    this.appState.videoControlsLocked = true;
  }

  editCurrentScene(currentTime: number): void {
    const scene = this.modelSvc.sceneAtEpisodeTime(this.appState.episodeId, currentTime);
    this.appState.editEvent = this.modelSvc.events[scene._id];
    this.appState.editEvent.templateOpts = this.selectService.getTemplates('scene');
    this.appState.editEvent.cur_episode_id = this.appState.episodeId;
    this.appState.editEvent.episode_id = this.appState.episodeId;
    this.appState.editEvent = createInstance('Scene', this.appState.editEvent);
    // TODO see playerController showControls; this may not be sufficient on touchscreens
    this.appState.videoControlsActive = true;
    this.appState.videoControlsLocked = true;
    this.selectService.onSelectChange(this.appState.editEvent);
  }

  cancelEventEdit(originalEvent: IEvent): void {
    const episodeId = originalEvent.cur_episode_id ? originalEvent.cur_episode_id : originalEvent.episode_id;
    if (this.appState.editEvent._id === 'internal:editing') {
      delete(this.modelSvc.events['internal:editing']);
      this.timelineSvc.removeEvent('internal:editing');
    } else {
      console.log('og ev?', originalEvent);
      originalEvent.renderTemplate = true;
      this.modelSvc.events[this.appState.editEvent._id] = originalEvent;
    }
    this.modelSvc.resolveEpisodeEvents(episodeId);

    if (originalEvent._type === 'Scene') {
      this.timelineSvc.updateSceneTimes(episodeId);
    } else {
      this.timelineSvc.updateEventTimes(originalEvent);
    }

    this.appState.editEvent = false;
    this.appState.videoControlsLocked = false;
  }

  saveEvent(toSave, unmodifiedEvent) {
    //assign current episode_id
    toSave.cur_episode_id = this.appState.episodeId;
    if (toSave._type === 'Scene') {
      const adjusted = this.adjustScenes(toSave, false, unmodifiedEvent);
      angular.forEach(adjusted, (scene) => {
        this.dataSvc.storeItem(scene)
          .then(
            () => {
              // console.log("scene end_time updated");
            },
            (data) => {
              console.error('FAILED TO STORE EVENT', data);
            }
          );
      });
    }

    return this.dataSvc.storeItem(toSave)
      .then(
        (data: any) => {
          data.cur_episode_id = this.appState.episodeId;

          let saveOperation = 'update';
          if (this.appState.editEvent._id === 'internal:editing') {
            // update the new item with its real ID (and remove the temp version)
            this.timelineSvc.removeEvent('internal:editing');
            delete (this.modelSvc.events['internal:editing']);
            this.modelSvc.cache('event', this.dataSvc.resolveIDs(data));
            this.modelSvc.resolveEpisodeEvents(this.appState.episodeId);
            saveOperation = 'create';
            const assetId = data.asset_id || data.link_image_id || data.annotation_image_id;
            if (assetId && toSave.asset && toSave.asset._id === assetId) {
              this.modelSvc.assocEventWithAsset(data._id, assetId);
            }
          }

          if (data._type === 'Scene') {
            this.timelineSvc.timelineEvents = [];
            this.timelineSvc.injectEvents(this.modelSvc.episodeEvents(this.appState.episodeId), 0);
            // sometimes the scene prior to the new onne being created is set to be the current scene
            this.modelSvc.episodes[this.appState.episodeId].setCurrentScene(this.modelSvc.events[data._id] as IScene);
          } else {
            this.modelSvc.resolveEpisodeEvents(this.appState.episodeId);
            this.timelineSvc.updateEventTimes(this.modelSvc.events[data._id]);
          }

          // currently only runs on transcript items
          this.saveAdjustedEvents(data, saveOperation);

          // Delete attached asset(s)  (this should only occur for sxs items, for now)
          // yes we could combine these into one call I suppose but there will almost always only be one
          // unless the user was very indecisive and uploaded/detached a bunch of assets to the same event.
          // It was probably already a premature optimization to use an array here in the first place

          // see ittItemEditor to see where toSave.removedAssets is setup as below is the only
          // reference in this file.
          angular.forEach(toSave.removedAssets, (id) => {
            this.dataSvc.deleteAsset(id);
          });
          this.appState.editEvent = false;
          this.$rootScope.$emit('searchReindexNeeded'); // HACK
        },
        (data) => {
          console.error('FAILED TO STORE EVENT', data);
        }
      );
  }

  deleteEvent(eventId: string, unmodifiedScene) {
    if (window.confirm('Are you sure you wish to delete this item?')) {
      //fabricate scene event
      const event = Object.create(null);
      event._id = eventId;
      const eventType = this.modelSvc.events[eventId]._type;
      if (eventType === 'Scene') {
        const adjusted = this.adjustScenes(event, true, unmodifiedScene);
        angular.forEach(adjusted, (scene) => {
          this.dataSvc.storeItem(scene)
            .then(
              () => {
                // console.log("scene end_time updated");
              },
              (data) => {
                console.error('FAILED TO STORE EVENT', data);
              }
            );
        });
      }

      this.dataSvc.deleteItem(eventId)
        .then(
          () => {
            if (this.appState.product === 'sxs' && this.modelSvc.events[eventId].asset) {
              this.dataSvc.deleteAsset(this.modelSvc.events[eventId].asset._id);
            }
            this.timelineSvc.removeEvent(eventId);
            delete this.modelSvc.events[eventId];
            this.modelSvc.resolveEpisodeEvents(this.appState.episodeId);

            if (eventType === 'Scene' || eventType === 'Chapter') {
              this.timelineSvc.updateSceneTimes(this.appState.episodeId);
            }
            this.saveAdjustedEvents(event, 'delete');
            this.appState.editEvent = false;
            this.appState.videoControlsLocked = false;
          },
          (data) => {
            console.warn('failed to delete:', data);
          }
        );
    }
  }

  getTranscriptItems() {
    const episode = this.modelSvc.episodes[this.appState.episodeId];
    return episode.items.filter(isTranscript);
  }

  // Editing some events has side effects on other events; this stores those side effects.
// assuming that this is called after a resolve and that we are dealing with events that have been adjusted already
  private saveAdjustedEvents(item, operation, original?) {
    if (isTranscript(item)) {
      let itemsToSave = [];
      const transcriptItems = this.getTranscriptItems();
      switch (operation) {
        case 'create':
          itemsToSave = filterToBookends(transcriptItems, item);
          console.log('adjust for create');
          break;
        case 'delete':
          itemsToSave = filterToItemBefore(transcriptItems, item);
          console.log('adjust for delete');
          break;
        case 'update':
          // TODO this should be updating the adjusted events, not delete-and-create.
          if (original) {
            this.saveAdjustedEvents(original, 'delete');
          }
          this.saveAdjustedEvents(item, 'create');
          console.log('adjust for update');
          break;
      }
      angular.forEach(itemsToSave, (item) => {
        this.dataSvc.storeItem(item)
          .then(() => {
            console.log('updated transcript item', item);
          }, (data) => {
            console.error('FAILED TO STORE EVENT', data);
          });
      });
    }
  }

  private adjustScenes(modifiedScene, isDelete, unmodifiedScene) {
    const duration = this.playbackService.getMetaProp('duration');
    let scenes = angular.copy(this.modelSvc.getEpisodeScenes());
    const adjusted = [];
    // get scenes back into original state (before editing,adding,deleting)
    if (isDelete) {
      pushScene(scenes, unmodifiedScene);
    } else {
      resetScenes(scenes, unmodifiedScene);
    }
    scenes = scenes.sort(sortByStartTime);
    fixEndTimes(scenes, duration);

    // now scenes is back to pre edit state.
    // let's drop in our new scene and then see what is impacted (and needs updating)
    removeScene(scenes, modifiedScene._id);
    if (!isDelete) {
      scenes.push(modifiedScene);
    }
    scenes = scenes.sort(sortByStartTime);

    for (var i = 1, len = scenes.length; i < len; i++) {
      if (i === len - 1) {
        if (scenes[i].end_time !== duration) {
          scenes[i].end_time = duration;
          adjusted.push(scenes[i]);
        }
      } else {
        if (scenes[i].end_time !== scenes[i + 1].start_time) {
          scenes[i].end_time = scenes[i + 1].start_time;
          adjusted.push(scenes[i]);
        }
      }

    }
    return adjusted;
  }

  private generateEmptyItem(type: string): Partial<IEvent> {
    const base = {
      '_id': 'internal:editing',
      'start_time': this.playbackService.getMetaProp('time'),
      'episode_id': this.appState.episodeId,
      // "type": type,  <-- NOPE that's a bug.  Confusing, so I'm leaving in this comment:
      // API types are Plugin, Scene, Upload, Link; these producer item types are different
      'isCurrent': true,
      'layouts': ['inline'],
      'styles': []
    };
    /*
     Item types:

     producer only
     scene
     transcript
     annotation

     sxs only
     comment

     sxs and producer
     image
     file
     link
     question
     video (injected episode) TODO
     */

    let stub = Object.create(null);
    if (type === 'scene') {
      stub = {
        '_type': 'Scene',
        'title': {},
        'description': {}
      };
    }
    if (type === 'chapter') {
      stub = {
        '_type': 'Chapter',
        'title': {},
        'description': {}
      };
    }
    if (type === 'video') {
      // TODO: this should be an injected episode with the linked/uploaded video as its master asset.
      // For now we're faking it as a link item.
      stub = {
        '_type': 'Link',
        'link_image_id': '',
        'url': '',
        'title': {},
        'description': {}
      };
    }

    if (type === 'comment' || type === 'transcript' || type === 'annotation') {
      stub = {
        '_type': 'Annotation',
        'annotation': {},
        'annotator': {},
        'annotation_image_id': ''
      };
    }

    if (type === 'file' || type === 'image') {
      stub = {
        '_type': 'Upload',
        'asset_id': '',
        'title': {},
        'description': {}
      };
    }

    if (type === 'link') {
      stub = {
        '_type': 'Link',
        'link_image_id': '',
        'url': 'https://',
        'title': {},
        'target': '_self',
        'description': {},
        'url_status': {}
      };
    }

    if (type === 'question') {
      // TODO i18n
      stub = {
        '_type': 'Plugin',
        'title': {},
        'data': {
          '_pluginType': 'question',
          '_version': 2,
          '_plugin': {
            'questiontext': '',
            'questiontype': 'mc-formative',
            'distractors': [{
              'index': 1,
              'text': ''
            }, {
              'index': 2,
              'text': ''
            }, {
              'index': 3,
              'text': ''
            }, {
              'index': 4,
              'text': ''
            }],
            'correctfeedback': '',
            'incorrectfeedback': ''
          }
        }
      };
      stub.plugin = stub.data._plugin;
    }

    if (this.appState.product === 'sxs') {
      // SxS overrides a lot of the item options:
      stub.sxs = true; // temporary?
      stub.annotator = {
        en: this.appState.user.name
      };
      stub.layouts = ['windowFg'];
      stub.end_time = this.appState.time;
      stub.stop = true;
    } else {
      const defaultTemplateNames = {
        'scene': EventTemplates.CENTERED_TEMPLATE,
        'transcript': EventTemplates.TRANSCRIPT_TEMPLATE,
        'annotation': EventTemplates.HEADER_TWO_TEMPLATE,
        'link': EventTemplates.LINK_TEMPLATE,
        'image': EventTemplates.IMAGE_PLAIN_TEMPLATE,
        'file': EventTemplates.FILE_TEMPLATE,
        'question': EventTemplates.QUESTION_TEMPLATE,
        'video': 'TODO:VIDEO'
      };
      const templateObj = this.modelSvc.readDataCache(
        'template',
        ('component_name' as keyof TDataCacheItem),
        defaultTemplateNames[type]
      );
      stub.templateOpts = this.selectService.getTemplates(type);
      stub.template_id = templateObj.id;
      stub.component_name = defaultTemplateNames[type];
    }
    angular.extend(base, stub);
    return createInstance(stub._type, base);
  }

}
