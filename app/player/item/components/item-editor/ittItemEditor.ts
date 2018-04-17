// @npUpgrade-item-true


import itemHtml from './item.html';
import { EventTemplates } from '../../../../constants';
import { IModelSvc, ITimelineSvc } from '../../../../interfaces';
import { IEvent, IScene } from '../../../../models';

const isTranscript = function (item: IEvent) {
  return item._type === 'Annotation' && item.component_name === EventTemplates.TRANSCRIPT_TEMPLATE;
};

const sortByStartTime = function (a, b) {
  return a.start_time - b.start_time;
};

const getNextStartTime = (currentScene, currentItem, _items) => {
  if (currentItem._type === 'Chapter') {
    return false;
  }
  //HACK to work around TS-412
  if (!currentScene) {
    console.warn(
      "getNextStartTime called with no scene (because it's being called for a scene event?)",
      currentItem,
      _items);
    return false;
  }
  let nextItem;
  let nextStartTime = currentScene.end_time;
  const items = _items.sort(sortByStartTime);
  for (let i = 0, len = items.length; i < len; i += 1) {
    if (items[i]._id === currentItem._id) {
      //the next item start_time if less than scen end time
      nextItem = items[i + 1];
      break;
    }
  }
  if (nextItem) {
    if (nextItem.start_time < currentScene.end_time) {
      nextStartTime = nextItem.start_time;
    }
  }
  return nextStartTime;
};


interface IItemEditorBindings extends ng.IComponentController {
  item: IEvent;
}

class ItemEditorController implements IItemEditorBindings {
  item: IEvent;
  //
  sxsItemComponentFieldName: string;
  uploadStatus = [];
  uneditedItem: IEvent;
  annotators: any;
  episodeContainerId: string;
  languages: any;
  itemForm: any;
  dismissalWatcher: any;
  showUploadButtons: boolean;
  showUploadField: boolean;
  blockDoubleClicks: boolean;
  showAssetPicker: boolean;
  mimes: any;
  static $inject = [
    '$rootScope',
    '$timeout',
    'errorSvc',
    'appState',
    'modelSvc',
    'timelineSvc',
    'selectService',
    'episodeEdit',
    'authSvc'
  ];
  constructor(
    private $rootScope,
    private $timeout: ng.ITimeoutService,
    private errorSvc,
    private appState,
    private modelSvc: IModelSvc,
    private timelineSvc: ITimelineSvc,
    private selectService,
    private episodeEdit,
    private authSvc) {
    //
  }

  get customEndTime() {
    return this.isAutoEndTime();
  }

  get canAccess() {
    return this.authSvc.userHasRole('admin') || this.authSvc.userHasRole('customer admin');
  }

  $onInit() {
    this.timelineSvc.pause();
    this.timelineSvc.seek(this.item.start_time);
    this.uploadStatus = [];
    const ep = this.modelSvc.episodes[this.appState.episodeId];
    this.annotators = ep.annotators;
    this.episodeContainerId = ep.container_id;
    this.languages = ep.languages;
    this.itemForm = this.selectService.setupItemForm(this.item.styles, 'item');

    if (!this.item.layouts) {
      this.item.layouts = ['inline'];
    }

    this.dismissalWatcher = this.$rootScope.$on('player.dismissAllPanels', this.cancelEdit.bind(this));

    this.sxsItemComponentFieldName = `${this.appState.product}-${this.item.producerItemType}-field`;
    this.uneditedItem = angular.copy(this.item);
  }

  userHasRole(role: string) {
    return this.authSvc.userHasRole(role);
  }

  forcePreview() {
    this.appState.editEvent.fnord = (this.appState.editEvent.fnord) ? '' : 'fnord';
  }

  isAutoEndTime(): boolean {
    const items = isTranscript(this.item) ? this.episodeEdit.getTranscriptItems() : [];
    const nextStartTime = getNextStartTime(this.getCurrentScene(this.item), this.item, items);
    if (this.item.end_time === nextStartTime) {
      return true;
    } else {
      return false;
    }
  }

  cancelEdit() {
    this.episodeEdit.cancelEventEdit(this.uneditedItem);
  }

  saveEvent() {
    this.blockDoubleClicks = true;
    const toSave = angular.copy(this.appState.editEvent);
    const unmodifiedEvent = this.uneditedItem;

    this.episodeEdit.saveEvent(toSave, unmodifiedEvent)
      .finally(() => this.blockDoubleClicks = false);
  }

  resolveEvents() {
    this.modelSvc.resolveEpisodeEvents(this.appState.episodeId);
  }

  deriveEvent(doResolveEvents?: boolean | IEvent) {
    let _newEv;
    if (doResolveEvents != null && typeof doResolveEvents !== 'boolean') {
      _newEv = doResolveEvents;
    } else {
      _newEv = this.appState.editEvent;
    }
    const newEv = this.modelSvc.cache('event', _newEv);
    newEv.styles = this.selectService.handleEventItemFormUpdate(this.itemForm);
    if (doResolveEvents != null) {
      // if we are 'true' or an object (typeof null === 'object' but we already null checked above)
      if ((typeof doResolveEvents === 'boolean' && doResolveEvents === true) || (typeof doResolveEvents === 'object')) {
        this.resolveEvents();
      }
    }
    return newEv;
  }

  onTemplateChange(componentName: string) {
    this.item.component_name = componentName;
    this.selectService.onSelectChange(this.item, this.itemForm);
    this.updateEventTemplate(this.deriveEvent(this.item));
  }

  onName(name: string) {
    this.textAreaName = name;
  }

  dispatchUpdate($field) {
    // $field is the value emitted from InputI18n
    this.item.annotation = $field;
  }

  private updateEventTemplate(newEv: any) {
    if (this.item instanceof IScene) {
      this.updateLayoutTemplate(newEv);
      this.updateItemTemplate();
    } else {
      this.updateItemTemplate();
    }
  }

  private updateItemTemplate() {
    this.item.renderTemplate = false;
    this.$timeout(() => {
      this.item.renderTemplate = true;
    });
  }

  private updateLayoutTemplate(layout: any) {
    this.appState.editEvent = layout;
    this.appState.editEvent.renderTemplate = false;
    this.$timeout(
      () => {
        this.appState.editEvent.renderTemplate = true;
        this.appState.editEvent = angular.copy(layout);
      },
      10);
  }


  private getCurrentScene(item: IEvent) {
    if (item._type === 'Scene') {
      return item;
    } else {
      return this.modelSvc.events[(this.item as IScene).scene_id];
    }
  }

}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class ItemEditor implements ng.IComponentOptions {
  bindings: IComponentBindings = {
    item: '<'
  };
  template: string = itemHtml;
  controller = ItemEditorController;
  static Name: string = 'npItemEditor'; // tslint:disable-line
}
