// @npUpgrade-episode-false
/*
 TODO: right now we're re-building the episode structure on every keystroke.
 That's a tiny bit wasteful of cpu :)  At the very least, debounce input to a more reasonable interval

 TODO: some redundancy with ittItemEditor, esp. in the 'styles'.
 I expect the episode styling to drift away from the event styling,
 though, so letting myself repeat myself repeat myself for now
 */
import {
  IModelSvc,
  IDataSvc,
  IItemForm,
  IEpisodeEditService,
  IEpisodeTheme,
  ILangformFlags
} from '../../../../interfaces';
import episodeHtml from './episode.html';
import { createInstance, IContainer, ICustomer, IEpisode, IEvent, IMasterAsset } from '../../../../models';

const isInternal = (item: IEvent): boolean => {
  return (item._id && /internal/.test(item._id));
};

const getItemsAfter = (items: IEvent[], after: number): IEvent[] => {
  const itemsAfter = [];
  for (let i = 0, len = items.length; i < len; i += 1) {
    if (!isInternal(items[i])) {
      if (after < items[i].start_time || after < items[i].end_time) {
        itemsAfter.push(items[i]);
      }
    }
  }
  return itemsAfter;
};

interface IEpisodeEditorBindings extends ng.IComponentController {
  episode: IEpisode;
  defaultLanguage: string;
}

class EpisodeEditorController implements IEpisodeEditorBindings {
  episode: IEpisode;
  defaultLanguage: string;
  //
  customer: ICustomer;
  itemForm: IItemForm;
  langForm: ILangformFlags;
  masterAsset: IMasterAsset;
  doCheckForTranslations: boolean;
  afterTranslationAttempt: string;
  episodeContainerId: string;
  uploadStatus: any[];
  uneditedEpisode: IEpisode;
  masterAssetType: 'WebUrl' | 'Video';
  dismissalWatcher: any;
  showmessage: string;
  showUploadButtons: boolean;
  showUploadField: boolean;
  showUploadButtonsPoster: boolean;
  showUploadFieldPoster: boolean;
  languageCount: number;
  showAssetPicker: boolean;
  private container: IContainer;
  static $inject = [
    '$timeout',
    'dataSvc',
    'modelSvc',
    'appState',
    'selectService',
    'authSvc',
    'playbackService',
    'urlService',
    'episodeEdit'
  ];

  constructor(
    private $timeout: ng.ITimeoutService,
    private dataSvc: IDataSvc,
    private modelSvc: IModelSvc,
    private appState,
    private selectService,
    private authSvc,
    private playbackService,
    private urlService,
    private episodeEdit: IEpisodeEditService) {
    //
  }

  get isAdmin() {
    return this.authSvc.userHasRole('admin');
  }

  get isCustomerAdmin() {
    return this.authSvc.userHasRole('customer admin');
  }

  $onInit() {
    this.episodeContainerId = this.modelSvc.episodes[this.appState.episodeId].container_id;
    this.container = this.modelSvc.containers[this.episodeContainerId];
    this.customer = this.modelSvc.customers[this.container.customer_id];

    if (this.episode.master_asset_id && this.episode.master_asset_id !== '') {
      this.masterAsset = createInstance('MasterAsset', this.modelSvc.assets[this.episode.master_asset_id]);
    }

    this.uneditedEpisode = angular.copy(this.episode);
    this.itemForm = this.selectService.setupItemForm(this.episode.styles, 'episode');
    this.langForm = this.episodeEdit.episodeLangForm;

    for (let j = 0; j < this.episode.languages.length; j += 1) {
      this.episodeEdit.episodeLangForm[this.episode.languages[j].code] = true;
    }
    this.onLangFlagChange();
    if (!this.authSvc.userHasRole('admin') || (this.masterAsset && /video\/x-/.test(this.masterAsset.content_type))) {
      this.masterAssetType = 'WebUrl';
    } else {
      this.masterAssetType = 'Video';
    }

    this.episode.description = {
      [this.episode.defaultLanguage as string || 'en' as string]: ''
    };
  }

  forcePreview() {
    // defined in ittItemEditor, wtf?
  }


  toggleUpload(assetType = '') {
    this[`showUploadField${assetType}`] = !this[`showUploadField${assetType}`];
  }

  translationMessage(langArr: any[]) {
    let prefix = '';
    const langs = langArr
      .filter((l) => {
        if (l.default == undefined) { //jshint ignore:line
          return true;
        } else {
          prefix = 'Translate from ' + l.code + ' to: ';
          return false;
        }
      }).map(l => l.code)
      .join(', ');
    return prefix + langs;
  }

  beginBackgroundTranslations(episodeId: string) {

    const handleSuccess = (resp) => {
      console.log('resp from translations!', resp);
      if (resp.status === 'Request for translations queued') {
        this.afterTranslationAttempt = resp.status + ', check back later!';
      } else {
        this.afterTranslationAttempt = 'Something went wrong...';
      }
      this.doCheckForTranslations = true;
    };

    const handleError = (e) => {
      console.log('error:', e);
    };

    this.dataSvc.beginBackgroundTranslations(episodeId)
      .then(handleSuccess)
      .catch(handleError);
  }

  updateItemForm() {
    this.episode.styles = this.selectService.handleEpisodeItemFormUpdates(this.itemForm);
    this.modelSvc.deriveEpisode(this.episode);
    this.modelSvc.resolveEpisodeEvents(this.episode._id); // needed for template or style changes
  }

  attachChosenAsset(asset_id: string) {
    this.episode.replacingMasterAsset = false;
    const asset = this.modelSvc.assets[asset_id];
    const previousAsset = this.modelSvc.assets[this.episode.master_asset_id];
    this.showmessage = 'New video attached.';
    if (previousAsset && (asset.duration < previousAsset.duration)) {
      // getItemAfter IN EDIT CONTROLLER
      const orphans = getItemsAfter(this.episode.items.concat(this.episode.scenes), asset.duration);
      if (orphans.length) {
        // TODO i18n
        this.showmessage = `Warning: this new video is shorter than the current video and we've detected that some 
        existing content items will be impacted. If you save this edit, these events will have their start and end 
        times adjusted to the new episode end. (If this isn't what you want, choose a different video or hit 'cancel'.)
        `;
      }
    }
    this.episode._master_asset_was_changed = true;
    this.episode.master_asset_id = asset._id;
    this.masterAsset = asset;
    this.episode.masterAsset = createInstance('MasterAsset',asset);
    this.modelSvc.deriveEpisode(this.episode);
  }

  attachPosterAsset(assetId: string) {
    const asset = this.modelSvc.assets[assetId];
    this.episode.poster_frame_id = assetId;
    this.episode.poster = asset;
    this.modelSvc.deriveEpisode(this.episode);
    this.showAssetPicker = false;
    this.showUploadButtonsPoster = false;
  }

  assetUploaded(assetId) {
    this.showUploadButtons = false;
    this.showUploadField = false;
    this.attachChosenAsset(assetId); // on EditController
  }

  posterUploaded(assetId: string) {
    this.showUploadButtonsPoster = false;
    this.showUploadFieldPoster = false;
    this.attachPosterAsset(assetId); // on EditController
  }

  attachMediaSrc(urlOrEmbedCode) {
    let contentType;
    const pmTypeAndMimeType = this.urlService.checkUrl(urlOrEmbedCode);
    const type = pmTypeAndMimeType.type;

    if (type === 'wistia' && !this.authSvc.userHasRole('admin')) {
      return;
    }

    if (type.length > 0) {
      contentType = pmTypeAndMimeType.mimeType;
      this.episode.replacingMasterAsset = true;
      this.showmessage = 'Getting ' + type + ' video...';
      const mediaSrcUrl = this.urlService.parseInput(urlOrEmbedCode);

      this.episode.swap = {
        _id: 'replaceMe',
        mediaSrcArr: [mediaSrcUrl]
      };

      const afterReady = this.waitForDuration(this.createAssetFromTmp.bind(this), mediaSrcUrl, contentType);
      this.playbackService.registerStateChangeListener(afterReady);
    }
  }

  replaceAsset(_assetType: string) {
    const assetType = _assetType || '';
    this['showUploadButtons' + assetType] = true;
    this['showUploadField' + assetType] = false;
  }

  detachMasterAsset() {
    this.episode.masterAsset = null;
    this.appState.editEpisode.masterAsset = null;
    this.appState.editEpisode._master_asset_was_changed = true;
    this.episodeEdit.detatchMasterAsset(this.episode);
  }

  saveEpisode() {
    this.episodeEdit.saveEpisode(this.episode);
  }

  selectText(event: any) {
    event.target.select(); // convenience for selecting the episode url
  }

  updateEpisodeTemplate($data: { episode: IEpisode, templateId: string }) {
    this.episodeEdit.updateEpisodeTemplate($data.episode, $data.templateId)
      .then((episode: IEpisode) => this.episode = episode);
  }

  cancelEpisodeEdit(originalEvent: IEpisode) {
    this.episodeEdit.cancelEpisodeEdit(this.uneditedEpisode);
  }

  onTitleOrDescriptionChange() {
    this.modelSvc.deriveEpisode(this.episode);
    // modelSvc.resolveEpisodeContainers(scope.episode._id); // only needed for navigation_depth changes
    this.modelSvc.resolveEpisodeEvents(this.episode._id); // needed for template or style changes
  }

  onLangFlagChange() {
    let languageCount = 0; // not sure if necessary -- can use languages.length instead?
    let lastSelectedLanguage; // convenience to stuff into default if the old default is no longer valid
    const newLanguages = []; // will replace the existing episode languages array
    for (const lang in this.langForm) {
      if (this.langForm[lang]) {
        languageCount += 1;
        lastSelectedLanguage = lang;
        newLanguages.push({
          'code': lang
        });
      } else {
        // language not selected; remove it as default if it was one
        if (this.episode.defaultLanguage === lang) {
          this.episode.defaultLanguage = false;
        }
      }
    }
    this.languageCount = languageCount;

    // ensure there is a valid default selection:
    if (this.episode.defaultLanguage === false) {
      this.episode.defaultLanguage = lastSelectedLanguage;
    }

    // set the default inside in the languages structure:
    angular.forEach(newLanguages, (lang) => {
      if (lang.code === this.episode.defaultLanguage) {
        lang.default = true;
      }
    });

    this.episode.languages = angular.copy(newLanguages);
    console.log('default?', this.episode.defaultLanguage);
  }

  private waitForDuration(onDone: (a: any) => any, url: string, type: string) {
    return (state: string) => {
      if (state === 'player ready') {
        this.playbackService.unregisterStateChangeListener(this.waitForDuration);
        //push to end of event loop.
        this.$timeout(
          () => {
            onDone({
              url,
              type,
              duration: this.playbackService.getMetaProp('duration', 'replaceMe')
            });
            //remove temp
            this.episode.swap = {};
          },
          0
        );
      }
    };
  }

  private createAssetFromTmp(tmpAsset: any) {
    const asset = Object.create(null);
    asset.content_type = tmpAsset.type;
    asset.duration = tmpAsset.duration;
    asset.url = tmpAsset.url;
    asset.name = this.episode.title;
    asset.description = this.episode.description;
    this.dataSvc.createAsset(this.episodeContainerId, asset).then((data: any) => {
      this.modelSvc.cache('asset', data);
      this.playbackService.renamePid('replaceMe', data._id);
      this.attachChosenAsset(data._id);
    }).catch((e) => {
      console.log('errr', e);
    });
  }

}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class EpisodeEditor implements ng.IComponentOptions {
  bindings: IComponentBindings = {
    episode: '<',
    langForm: '<',
    defaultLanguage: '<'
  };
  template: string = episodeHtml;
  controller = EpisodeEditorController;
  static Name: string = 'npEpisodeEditor'; // tslint:disable-line
}
