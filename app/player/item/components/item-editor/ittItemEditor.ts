// @npUpgrade-item-false
/*
 TODO: right now we're re-building the episode structure on every keystroke.
 That's a tiny bit wasteful of cpu :)
  At the very least, debounce input to a more reasonable interval
 */

/**
 * @ngDoc directive
 * @name iTT.directive:ittItemEditor
 * @restrict 'A'
 * @scope
 * @description
 * Directive for editing items in the producer / editor interface
 * @requires $rootScope
 * @requires $timeOut
 * @requires errorSvc
 * @requires appState
 * @requires modelSvc
 * @requires timelineSvc
 * @requires awsSvc
 * @requires dataSvc
 * @param {Object} Item object representing an Event object from the DB to be edited.
 */

import itemHtml from './item.html';
import { EventTemplates, MIMES } from '../../../../constants';
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

    if (MIMES[this.item.producerItemType]) {
      this.mimes = MIMES[this.item.producerItemType];
    } else {
      this.mimes = MIMES.default;
    }
  }

  $onChanges(changes) {
    console.log('huh', changes);
  }

  onItemFormUpdates() {
    // this.item.styles = this.selectService.handleEventItemFormUpdate(this.itemForm);
    this.deriveEvent();
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

  assetUploaded(assetId: string) {
    this.item.asset = this.modelSvc.assets[assetId];
    // TODO Shouldn't need to be worrying about asset field names here, handle this in modelSvc?
    if (this.item._type === 'Link') {
      this.item.link_image_id = assetId;
    } else if (this.item._type === 'Annotation') {
      this.item.annotation_image_id = assetId;
    } else {
      this.item.asset_id = assetId;
    }
    this.showUploadButtons = false;
    this.showUploadField = false;
  }

  // replaceAsset() {
  //   console.log('replace asset!');
  //   this.showUploadButtons = true;
  //
  //   if (this.item.sxs) { // we will delete assets atached to editor items, not from producer items
  //     this.appState.editEvent.removedAssets = this.appState.editEvent.removedAssets || [];
  //     // removedAsset will be used by editController on save to delete the old asset (if we're in editor)
  //     if (this.appState.editEvent._type === 'Link') {
  //       this.appState.editEvent.removedAssets.push(this.appState.editEvent.link_image_id);
  //     } else if (this.appState.editEvent._type === 'Annotation') {
  //       this.appState.editEvent.removedAssets.push(this.appState.editEvent.annotation_image_id);
  //     } else {
  //       this.appState.editEvent.removedAssets.push(this.appState.editEvent.asset_id);
  //     }
  //   }
  // }

  detachAsset(): void {
    // console.log(
    // 	'item:', scope.item,
    // 	'asset:', scope.item.asset,
    // 	'link_image_id:', scope.item.link_image_id,
    // 	'asset_id:', scope.item.asset_id,
    // 	'annotation_image_id:', scope.item.annotation_image_id
    // );
    if (this.item.asset) {
      switch (this.item.producerItemType) {
        case 'link':
          this.item.asset = null;
          this.item.link_image_id = null;
          this.item.asset_id = null;
          this.item.annotation_image_id = null;
          break;
        case 'transcript':
          this.item.asset = null;
          this.item.annotation_image_id = null;
          break;
        case 'image':
        case 'question':
        case 'file':
          this.item.asset = null;
          this.item.asset_id = null;
          break;
      }
    }
  }

  attachChosenAsset(asset_id: string): void {
    // console.log(scope.item);
    const asset = this.modelSvc.assets[asset_id];
    if (this.item) {
      this.item.asset = asset;
      this.selectService.onSelectChange(this.item, this.itemForm);
      if (this.item._type === 'Upload' || this.item._type === 'Plugin') {
        this.item.asset_id = asset_id;
      } else if (this.item._type === 'Link') {
        this.item.link_image_id = asset_id;
        this.item.asset_id = asset_id;
      } else if (this.item._type === 'Annotation') {
        console.log('you are actually getting here!!');
        this.item.asset_id = asset_id;
        this.item.annotation_image_id = asset_id;
      } else {
        console.error('Tried to select asset for unknown item type', this.item);
      }
    }
  }

  toggleUpload(assetType = '') {
    this['showUploadField' + assetType] = !this['showUploadField' + assetType];
  }

  // chooseAsset() {
  //   this.showAssetPicker = true;
  // }

  // onAssetSelected(assetId) {
  //   this.attachChosenAsset(assetId);
  // }

  resolveEvents() {
    this.modelSvc.resolveEpisodeEvents(this.appState.episodeId);
  }

  deriveEvent(doResolveEvents: boolean = false) {
    const newEv = this.modelSvc.cache('event', this.appState.editEvent);
    newEv.styles = this.selectService.handleEventItemFormUpdate(this.itemForm);
    this.appState.editEvent = newEv;
    if (doResolveEvents) {
      this.resolveEvents();
    }
    console.log('derived!', this.appState.editEvent);
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
