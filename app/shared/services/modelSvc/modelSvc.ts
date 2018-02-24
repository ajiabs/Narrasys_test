// @npUpgrade-shared-false
/* Parses API data into player-acceptable format,
 and derives secondary data where necessary for performance/convenience/fun */

// ** Updated by Curve10 (JAB/EDD)
//    Feb 2018 
//

import { IAnnotators, Partial } from '../../../interfaces';
import { config } from '../../../config';
import {
  createInstance, IAsset, IContainer, ICustomer, IEpisode, ILayout, INarrative, IScene, IStyle, TTemplate,
  NEvent, IEvent, IPlugin,
} from '../../../models';
import { EventTemplates } from '../../../constants';
import { IQService } from 'angular';

export interface IDataCache {
  template: { [templateId: string]: TTemplate };
  layout: { [layoutId: string]: ILayout };
  style: { [styleId: string]: IStyle };
}

// note that in TS, 'keyof SomeUnionType' produces an intersection of keys in the union type
// https://github.com/Microsoft/TypeScript/issues/12948
export type TDataCacheItem = ILayout | IStyle | TTemplate;

export interface IModelSvc {
  episodes: { [episodeId: string]: IEpisode };
  assets: { [assetId: string]: IAsset };
  events: { [eventId: string]: NEvent };
  containers: { [containerId: string]: IContainer };
  narratives: { [narrativeId: string]: INarrative };
  customers: { [customerId: string]: ICustomer };
  dataCache: IDataCache;
  readDataCache<K extends keyof IDataCache, F extends keyof TDataCacheItem>(
    cache: K,
    field: F,
    val: TDataCacheItem[F]): TDataCacheItem;
  getNarrativeByPathOrId(pathOrId: string): INarrative;
  assocNarrativesWithCustomer(customer: ICustomer, narratives: INarrative[]): ICustomer;
  cachedNarrativesByCustomer(customer: any): any;
  getCustomersAsArray(): any[];
  getNarrativesAsArray(): any[];
  cache<T>(cacheType: string, item: T): T;
  deriveEpisode(episode: any): IEpisode;
  deriveAsset(asset: any): any;
  deriveContainer(container: any): any;
  deriveEvent<T extends IEvent>(event: Partial<T>): T;
  setLanguageStrings(): void;
  resolveEpisodeEvents(epId: string): IEpisode;
  resolveEpisodeContainers(epId: string): void;
  episode(epId: string): any;
  episodeEvents(epId: string): NEvent[];
  isOnExistingSceneStart(t: number): boolean;
  getEpisodeScenes(): IScene[];
  sceneAtEpisodeTime(epId: string, t: number): IScene;
  scene(sceneId: string): IScene;
  assocEventWithAsset(eventId: string, assetId: string): void;
  resolveEpisodeAssets(episodeId: string): void;
  addLandingScreen(episodeId: string): void;
  addEndingScreen(episodeId: string): void;
  isTranscoded(video: any): boolean;
  mainVideoNewWindowUrl(
    accessToken: string,
    entityId: string,
    timelineId?: string,
    startAt?: number,
    playerType?: 'episode' | 'editor' | 'producer'
  ): string;
}

export class ModelSvc implements IModelSvc {
  static Name = 'modelSvc';   // tslint: disable-line

 static $inject = ['$filter', '$location', 'appState', 'playbackService', 'urlService', 'ittUtils'];
 constructor(
   private $filter,
   private $location,
   private appState,
   private playbackService, 
  private urlService,
  private ittUtils) {

 }

  // const DEFAULT_EPISODE_TEMPLATE_URL = 'templates/episode/episode.html';
  // TODO ((((((((((((((( FIGURE THIS ONE OUT )))))))))))))))
  // var svc = IModelSvc = Object.create(null);

  episodes = {};
  assets = {};
  events = {}; // NOTE privat events contains scenes and items -- anything that happens during the episode timeline
  containers = {};
  narratives = {};
  customers = {};
  dataCache = {
    template: {},
    layout: {},
    style: {}
  } as IDataCache;

  // receives cacheTypes of episode, event, asset, and container.
  // splits event into scenes and items.  Not sure yet whether we care about containers, discarding them for now.

  // TODO? normalize items before cacheing: (annotation_image_id and link_image_id -> asset_id, etc)
  //^^ NP-1310
  // TODO discard unused fields before cacheing

  // use angular.extend if an object already exists, so we don't lose existing bindings


  
 readDataCache<K extends keyof IDataCache, F extends keyof TDataCacheItem>(
    cache: K,
    field: F,
    val: TDataCacheItem[F]): TDataCacheItem {
    const cacheType = this.dataCache[cache];
    for (const id in cacheType) {
      if (cacheType.hasOwnProperty(id) && cacheType[id][field] === val) {
        return cacheType[id];
      }
    }
    return null;
  }



 mainVideoNewWindowUrl(
    accessToken: string,
    entityId: string,
    timelineId?: string,
    startAt?: number,
    playerType: 'episode' | 'producer' | 'editor'  = 'episode'): string {

    const baseNewWindowEndpoint = config.apiDataBaseUrl + '/v1/new_window';
    // if second id is present, first ID must be from a narrative
    if (entityId && timelineId) {
      return baseNewWindowEndpoint +
        `?narrative=${entityId}&timeline=${timelineId}&access_token=${accessToken}&t=${startAt || 0}`;
    } else {
      return baseNewWindowEndpoint + `?${playerType}=${entityId}&access_token=${accessToken}&t=${startAt || 0}`;
    }
  }

 getNarrativeByPathOrId (pathOrId) {
    var isMongoId = /^[0-9a-fA-F]{24}$/.test(pathOrId);
    if (isMongoId) {
      return this.narratives[pathOrId];
    }
    //else loop and find the matching path slug passed in.
    var n;
    for (n in this.narratives) {
      if (this.narratives.hasOwnProperty(n)) {
        if (pathOrId === this.narratives[n].path_slug.en) {
          return this.narratives[n];
        }
      }

    }
  };

  //add subdomain to each narrative then cache
  //add narratives to customer object then cache customer.
  assocNarrativesWithCustomer(customer: ICustomer, narratives: INarrative[]): ICustomer {
  
    narratives.forEach( (narrative) => {
      this.cache('narrative', narrative);
    });

    customer.narratives = this.cachedNarrativesByCustomer(customer);
      this.cache('customer', customer);
    // //remove any old customer references if narrative was changed to a different customer
    // Object.keys(this.customers)
    //   .filter(function(key) {
    //   return customer._id !== key;
    // })
    //   .forEach(function(customerId) {
    //     var cust = this.customers[customerId];
    //     var custNarratives = cust.narratives;
    //     var found;
    //     if (this.ittUtils.existy(custNarratives) && custNarratives.length > 0 && narratives.length === 1) {
    //       var narrative = this.narratives[narratives[0]._id];
    //       found = custNarratives.indexOf(narrative);
    //       if (found !== -1) {
    //         cust.narratives.splice(found, 1);
    //         this.cache('customer', cust);
    //       }
    //     }
    //   });

    return customer;
  }

   cachedNarrativesByCustomer(customer: ICustomer): INarrative[] {
    return Object.keys(this.narratives).reduce( (narratives, key) => {
      if (this.narratives[key].customer_id === customer._id) {
        narratives.push(this.narratives[key]);
      }
      return narratives;
    }, []);
  }

  getCustomersAsArray() {

    return Object.keys(this.customers).map( (c) =>{
      return this.customers[c];
    });
  }

   getNarrativesAsArray() {
    return Object.keys(this.narratives).map( (n) => {
      return this.narratives[n];
    });
  }

 cache = function <T>(cacheType: string, item: T): T {
    if (cacheType === 'narrative') {
      // NOTE no deriveNarrative used here, not needed so far
      const instance = createInstance('Narrative', item) as INarrative;

      if (instance.timelines && instance.timelines.length > 0) {
        instance.timelines = instance.timelines.map(tl => createInstance('Timeline', tl));
      }

      if (this.narratives[item._id]) {
        angular.extend(this.narratives[item._id], instance);
      } else {
        this.narratives[item._id] = angular.copy(instance) as INarrative;
      }
    }
    if (cacheType === 'customer') {
      const instance = createInstance('Customer', item);
      // NOTE no deriveCustomer used here, not needed so far
      if (this.customers[item._id]) {
        angular.extend(this.customers[item._id], instance);
      } else {
        this.customers[item._id] = angular.copy(instance) as ICustomer;
      }
    }
    if (cacheType === 'episode') {
      const instance = createInstance('Episode', item);
      if (this.episodes[item._id]) {
        angular.extend(this.episodes[item._id], this.deriveEpisode(angular.copy(instance)));
      } else {
        this.episodes[item._id] = this.deriveEpisode(angular.copy(instance));
      }
    } else if (cacheType === 'event') {
      const instance = createInstance(item._type, item) as IEvent;
      // TEMP fix for events without titles:
      if (!instance.title) {
        instance.title = {};
      }
      if (this.events[item._id]) {
        angular.extend(this.events[item._id], this.deriveEvent(angular.copy(instance)));
      } else {
        this.events[item._id] = this.deriveEvent(angular.copy(instance));
      }
    } else if (cacheType === 'asset') {
      const instance = createInstance('Asset', item);
      if (this.assets[item._id]) {
        angular.extend(this.assets[item._id], this.deriveAsset(angular.copy(instance)));
      } else {
        this.assets[item._id] = this.deriveAsset(angular.copy(instance));
      }
    } else if (cacheType === 'container') {
      const instance = createInstance('Container', item);
      if (this.containers[item._id]) {
        angular.extend(this.containers[item._id], this.deriveContainer(angular.copy(instance)));
      } else {
        this.containers[item._id] = this.deriveContainer(angular.copy(instance));
      }

    }

    // no return value required!
    return this.dataCache
//    return [cacheType + 's'][item._id] as T;
  };

  // this.deriveFoo() are for efficiency precalculations.
  // Input API data, output API data plus clientside-only convenience variables.
  // Should call this after making any changes to the underlying data.

  deriveEpisode = function (episode) {
    // console.log("deriveEpisode:", episode);


    angular.forEach(episode.languages,  (lang) => {
      if (lang.default) {
        // console.log("FOUND DEFAULT LANGUAGE", lang.code, appState.lang);
        this.episode.defaultLanguage = lang.code;
      }
    });
    if (this.episode.defaultLanguage === false) {
      this.episode.defaultLanguage = 'en'; // last resort
    }
    this.setLanguageStrings();

    // For now, automatically add customer-specific styles to episode if there aren't other selections.
    // (TODO Producer should do this automatically; this is for legacy episodes):
    if (!episode.styles) {
      episode.styles = [];
    }

    if (episode.title && this.events['internal:landingscreen:' + episode._id]) {
      this.events['internal:landingscreen:' + episode._id].title = episode.title;
      this.events['internal:landingscreen:' + episode._id] = this.setLang(this.events['internal:landingscreen:' + episode._id]);
    }
    if (episode.template) {
      const doResizeIframe =
        episode.template.displayName === 'Career Playbook'
        || episode.template.displayName === 'Narrasys Professional';

      if (episode.template && doResizeIframe) {
        this.appState.resizeIframeReviewMode = true;
      }
    }

    episode = this.setLang(episode);
    return episode;
  };

  deriveAsset = function (asset) {
    let _asset = Object.assign({}, asset);
    if (_asset._type === 'Asset::Video') {
      _asset = this.urlService.resolveVideo(_asset);
    }
    if (_asset.url) {
      // escape URLs for css background-image https://stackoverflow.com/q/25613552
      _asset.cssBgUrl = _asset.url.replace(/\"/g, '\\"');
    }
    _asset = this.setLang(_asset);
    return _asset;
  };

  // TODO there are some hacky dependencies on existing templateUrls which really ought to become
  // separate data fields in their own right:
  //      isTranscript (for Annotations)
  //      allowEmbed, noExternalLink, and targetTop (for Links)

  /* TODO also we should merge the Link and Upload types, split those templates by file type instead of source,
   and make all these data fields consistent:

   Upload/link
   title: Link text
   (category)
   required
   description: Description
   displayTime: Timestamp
   allowEmbed: is/isn't frameable
   targetTop: link should point to window.top (for end-of-episode links back to LTI host)
   url: primary URL
   url_type: file type
   (?) secondary image URL (icon, thumbnail, etc)

   Annotation
   Speaker
   text
   secondary image URL (speaker icon)
   */

  deriveContainer (container) {

    // console.log("deriving container", container);

    container.haveNotLoadedChildData = false; // not sure yet if this is necessary
    // first sort the children:
    if (container.children && container.children.length > 0) {
      // When we populate sort_order, we can remove this:
      container.children = container.children.sort( (a, b)  => {
        return (a.name.en > b.name.en) ? 1 : -1; // WARN always sorted by english
      });
      // This is the real one (for now sort_order always is zero, so this sort will have no effect):
      container.children = container.children.sort( (a, b) => {
        return a.sort_order - b.sort_order;
      });

      var childRefs = [];
   
      angular.forEach(container.children,  (child) => {
        const instance = createInstance('Container', child);
        if (this.containers[child._id]) {
          childRefs.push(this.containers[child._id]);
        } else {
          instance.haveNotLoadedChildData = true; // not sure yet if this is necessary
          this.containers[child._id] = angular.copy(this.setLang(instance));
        }

      });

      container.loadedChildData = true;
    } else {
      container.children = [];
    }
    return this.setLang(container);
  };

  isTranscript (item) {
    if (typeof (item) !== 'undefined') {
      if (item._type === 'Annotation' && item.component_name === EventTemplates.TRANSCRIPT_TEMPLATE) {
        return true;
      } else {
        return false;
      }
    }
  };

  deriveEvent = function deriveEvent<T extends IEvent>(_event: Partial<T>): T {
    let event = _event;
    const cmpTemplate = this.readDataCache('template', 'id', event.template_id);
    if (cmpTemplate != null) {
      event.component_name = cmpTemplate.component_name;
    }

    event = this.setLang(event);
    if (event._type !== 'Scene') {

      event.searchableText = (event.display_annotation || event.display_description) + ' ' + (event.display_title || event.display_annotator);
      if (!event.cosmetic) {
        event.cosmetic = false; // search needs this to be explicit
      }
      if (event.sxs) { // HACK can probably be safely removed?
        event.cosmetic = false;
      }

      if (event.avatar_id) {
        if (!this.assets[event.avatar_id]) { // not sure if necessary here.  Should move this into a getter function for assets anyway
          this.assets[event.avatar_id] = {};
        }
        event.avatar = this.assets[event.avatar_id];
      }


      if (this.episodes[event.cur_episode_id] && this.episodes[event.cur_episode_id].template.displayName === 'University of Southern California') {
        // HACKS AHOY
        // USC made a bunch of change requests post-release; this was the most expedient way
        // to deal with them. Sorry!
        if (event instanceof IPlugin && event.data && event.data._pluginType === 'credlyBadge') {
          event.component_name = EventTemplates.USC_BADGES_TEMPLATE;
        }
        if (event._type === 'Link') {
          if (event.display_title.match(/ACTIVITY/)) {
            // Unnecessary explanatory text
            event.display_description = event.display_description + '<div class="uscWindowFgOnly">Remember! You need to complete this activity to earn a Friends of USC Scholars badge. (When you’re finished - Come back to this page and click <b>Continue</b>).<br><br>If you’d rather <b>not</b> do the activity, clicking Continue will take you back to the micro-lesson and you can decide where you want to go from there.</div>';
          }
          if (event.display_title.match(/Haven't Registered/)) {
            // hide this event for non-guest users
            event.styles = event.styles ? event.styles : [];
            event.styles.push('uscHackOnlyGuests'); // will be used in discover mode (so we don't have to explicitly include it in the scene templates)
            event.uscReviewModeHack = 'uscHackOnlyGuests'; // ...except the review mode template, because item styles don't show up there
          }
          if (event.display_title.match(/Connect with/)) {
            // hide this event unless episode badge is achieved
            event.styles = event.styles ? event.styles : [];
            event.styles.push('uscHackOnlyBadge'); // will be used in discover mode (so we don't have to explicitly include it in the scene templates)
            event.uscReviewModeHack = 'uscHackOnlyBadge'; // ...except the review mode template, because item styles don't show up there
          }
        }
        // END of USC hacks
      }

      //items

      // clear derived flags before re-setting them (in case we're editing an existing item):
      event.isContent = false;
      event.isTranscript = false;
      // event.noEmbed = event.noEmbed === undefined ? false : event.noEmbed;
      event.mixedContent = false;
      event.targetTop = false;
      event.isVideoUrl = false;

      // determine whether the item is in a regular content pane.
      // items only have one layout (scenes may have more than one...)
      if (event.layouts) {
        event.layoutCss = event.layouts[0];
        if (event.layouts[0] === 'inline' || event.layouts[0].match(/sidebar/) || event.layouts[0].match(/burst/)) {
          event.isContent = true;
        }
      } else {
        // no layout, therefore inline content
        event.isContent = true;
      }

      // Old templates which (TODO) should have been database fields instead:
      if (this.isTranscript(event)) {
        event.isTranscript = true;
      }

      var isHttps = $location.protocol() === 'https';
      if (event._type === 'Link' && event.url && event.url.match(/^http:\/\//) && isHttps) {
        event.mixedContent = true;
        event.showInlineDetail = false;
      }

      if (event._type === 'Link') {
        if (urlService.isVideoUrl(event.url)) {
          event.isVideoUrl = true;
        }
      }

      if (event._type === 'Link' && event.url && /mailto/.test(event.url)) {
        // event.noEmbed = true;
        event.target = '_blank';
      }

      if (event.producerItemType === 'annotation' && appState.product === 'producer' && !event.cosmetic) {
        event.showAsHeader = !(
          event.component_name === EventTemplates.TEXT_DEFINITION_TEMPLATE ||
          event.component_name === EventTemplates.TEXT_TRANSMEDIA_TEMPLATE
        );
      }
    }

    //it is helpful for UI purposes to know what type of annotation an event is
    //the IF statement above only runs if producerItemType has not be set.
    //when creating a new event, generateEmptyItem (in EditCtrl) will set producerItemType
    //this code handles the case AFTER producerItemType has been set, and the event is
    //an annotation, and the user switched the annotation type.
    switch (event.producerItemType) {
      case 'chapter':
        event.isContent = false;
        break;
      case 'annotation':
        //set to false off the bat, then flip to true for each case
        event.isPq = event.isHeader = event.isLongText = event.isDef = false;
        if (event.component_name === EventTemplates.PULLQUOTE_TEMPLATE) {
          event.isPq = true;
        }
        if (/header-two|header-one/.test(event.component_name)) {
          event.isHeader = true;
        }

        if (event.component_name === EventTemplates.TEXT_TRANSMEDIA_TEMPLATE) {
          event.isLongText = true;
        }

        if (event.component_name === EventTemplates.TEXT_DEFINITION_TEMPLATE) {
          event.isDef = true;
        }
        break;
    }

    event.displayStartTime = $filter('asTime')(event.start_time);
    return event as T;
  };

  private setLang (obj) {
    // TODO: keywords, customers/oauth2_message
    // TODO use episode default language instead of 'en'
    var langToSet = (this.appState.lang) ? this.appState.lang : 'en';
    angular.forEach(['title', 'annotator', 'annotation', 'description', 'name'],  (field) => {
      if (obj[field]) {
        if (typeof (obj[field]) === 'string') {
          // TODO can delete this after all data has been migrated to object form
          obj['display_' + field] = obj[field];
        } else {
          if (obj[field][langToSet]) {
            obj['display_' + field] = obj[field][langToSet];
          } else {
            obj['display_' + field] = obj[field].en; // TODO use episode default language instead of 'en'
          }
        }
      }
    });
    return obj;
  };

  setLanguageStrings = function () {
 
    angular.forEach(this.events,  (evt) => {
      evt = this.setLang(evt);
    });
    angular.forEach(this.episodes,  (ep) => {
      ep = this.setLang(ep);
    });
    angular.forEach(this.containers,  (container) => {
      container = this.setLang(container);
    });
    // todo:  containers
  };

  //for items with the same time, ensure hierarchy of items
  //in the following order:
  // 1. Annotations:
  //  	- H1 > H2 > isTranscript
  // 3. Links
  // 4. Uploads
  //		- Document > Image
  //5. all other annotations
  _sortItems(items) {
    return items.sort( (a, b) => {
      if (a.start_time === b.start_time) {
        if (a.producerItemType === 'chapter') {
          return -1;
        } else if (b.producerItemType === 'chapter') {
          return 1;
        } else if (a.chapter_marker === true) {
          return -1;
        } else if (b.chapter_marker === true) {
          return 1;
        } else if (a.component_name === EventTemplates.HEADER_ONE_TEMPLATE) {
          return -1;
        } else if (b.component_name === EventTemplates.HEADER_ONE_TEMPLATE) {
          return 1;
        } else if (a.component_name === EventTemplates.HEADER_TWO_TEMPLATE) {
          return -1;
        } else if (b.component_name === EventTemplates.HEADER_TWO_TEMPLATE) {
          return 1;
        } else if (a.isTranscript) {
          return -1;
        } else if (b.isTranscript) {
          return 1;
        } else if (a._type === 'Link') {
          return -1;
        } else if (b._type === 'Link') {
          return 1;
        } else if (a._type === 'Upload') {
          if (a.producerItemType === 'file' || b._type === 'Annotation') {
            return -1;
          } else {
            return 1;
          }
        } else if (b._type === 'Upload') {
          return 1;
        } else {
          return -1;
        }
      }
      else {
        return a.start_time - b.start_time;
      }
    });
  }

  /*  Any changes to any scene or item data must call this.resolveEpisodeEvents afterwards. It sets:
   - episode.scenes
   - episode.items
   - scene.items
   - item.scene_id
   - episode.annotators (for use in producer)

   NOTE: this currently calls cascadeStyles on episodes and events as a side effect.
   deriveEvent() and deriveEpisode() would be a theoretically more consistent place for that, but
   cascadeStyles depends on the episode structure we're building here, so it feels dangerous to separate them.

   // HACK magic numbers galore:
   endingscene cuts the duration of the last scene by 0.1 seconds
   startingscreen extends from below zero to 0.01s

   */
 resolveEpisodeEvents = function (epId: string): IEpisode {
    // console.log("resolveEpisodeEvents");
    //Build up child arrays: episode->scene->item
    var scenes = [];
    var items = [];
    var chapters = [];
    var episode = this.episodes[epId];
    angular.forEach(this.events,  (event) => {
      if (event.cur_episode_id !== epId) {
        return;
      }

      if (event._type === 'Scene') {
        scenes.push(event);
      } else if (event._type === 'Chapter') {
        chapters.push(event);
        items.push(event);
      } else {
        items.push(event);
      }

    });

    // collect a list of all the speakers/annotators in the episode.
    // Try to merge partially-translated annotator names into the more fully-translated versions.
    // This is imperfect -- a few will slip through if there is a missing translation in the default language -- but good enough for now
    // TODO replace all of this, have the API keep track of each annotator as a real, separate entity
    var annotators: IAnnotators = {};
    angular.forEach(items,  (event) => {
      if (event._type === 'Annotation' && event.chapter_marker === true) {
        chapters.push(event);
      }

      if (event._type === 'Annotation' && event.annotator) {
        // This is kind of a mess
        // Use the default language as the key; merge any other languages into that key
        var defaultLanguage = episode.defaultLanguage || 'en';
        var key = event.annotator[defaultLanguage];

        if (key === undefined) {
          // this annotator doesn't have a translation in the default language, so use its first language instead
          key = event.annotator[Object.keys(event.annotator)
            .sort()[0]];
        }

        if (annotators[key]) {
          // merge other translations of the same name into this one
          annotators[key].name = angular.extend(annotators[key].name, event.annotator);
          if (!annotators[key].annotation_image_id) {
            annotators[key].annotation_image_id = event.annotation_image_id;
          }
        } else {
          annotators[key] = {
            'name': event.annotator,
            'annotation_image_id': event.annotation_image_id
          };
        }

        // construct a description containing all languages, starting with the default
        var langs = Object.keys(annotators[key].name)
          .sort();
        var longKey = annotators[key].name[defaultLanguage] || '(untranslated)';
        for (var i = 0; i < langs.length; i++) {
          if (langs[i] !== defaultLanguage) {
            longKey = longKey + ' / ' + annotators[key].name[langs[i]];
          }
        }
        annotators[key].key = longKey;
      }
    });
    episode.annotators = annotators;
    episode.chapters = chapters;

    // WARN Chrome doesn't stable sort!   Don't depend on simultaneous events staying in the same order
    // attach array of scenes to the episode.
    // Note these are references to objects in this.events[]; to change item data, do it in this.events[] instead of here.
    var duration = 0;
    if (episode.masterAsset) {
      duration = episode.masterAsset.duration;
      angular.forEach(episode.scenes,  (scene) => {
        if (scene.start_time > duration) {
          scene.start_time = duration - 0.2; // last resort HACK to catch bad scene data
        }
      });
    }

    episode.scenes = scenes.sort( (a, b) =>{
      if (a._id.indexOf('internal:start') > -1 || b._id.indexOf('internal:end') > -1) {
        return -1;
      }
      if (b._id.indexOf('internal:start') > -1 || a._id.indexOf('internal:end') > -1) {
        return 1;
      }
      return a.start_time - b.start_time;
    });

    // and a redundant array of child items to the episode for convenience (they're just references, so it's not like we're wasting a lot of space)

    episode.chapters = chapters.sort( (a, b) => {
      return a.start_time - b.start_time;
    });

    // Fix bad event timing data.  (see also this.deriveEvent())
    angular.forEach(items,  (event)  => {

      // We have some events whose start time is beyond the episode duration; they were winding up attached to the endingscene (and therefore invisible)
      // HACK just shove those into the end of the last (real) scene with a short duration
      if (duration > 0) {
        if (event.start_time > duration - 0.11) { // the -0.11 ensures they don't get attached to the ending screen
          event.start_time = duration - 0.2;
          event.end_time = duration - 0.1;
        }
      }

      // HACK keep events from being attached to landing screen if there is one
      if (event.start_time < 0.01) {
        event.start_time = 0.01;
        if (event.end_time < 0.01) {
          event.end_time = 0.01;
        }
      }

      // Some events have been stored with end times before their start times.
      if (event.start_time > event.end_time) {
        event.end_time = event.start_time;
      }
    });

    episode.items = this._sortItems(items);
    // console.log('after sort \n', items);
    // ensure scenes are contiguous. Including the ending scene as end_times are relied on in producer in any editable scene.
    // Note that this means we explicitly ignore scenes' declared end_time; instead we force it to the next scene's start (or the video end)
    for (var i = 1, len = episode.scenes.length; i < len; i++) {
      if (i === len - 1) {
        if (duration !== 0) {
          episode.scenes[i].end_time = duration;
        }
      } else {
        episode.scenes[i].end_time = episode.scenes[i + 1].start_time;
      }
    }

    var itemsIndex = 0;
    // assign items to scenes (give them a scene_id and attach references to the scene's items[]:
    //angular.forEach(scenes, function (scene) {
    for (var y = 0, scenesLength = scenes.length; y < scenesLength; y++) {
      var scene = scenes[y];
      var sceneItems = [];
      var previousTranscript = {};
      for (var x = itemsIndex, itemsLength = items.length; x < itemsLength; x++) {
        var event = items[x];

        //angular.forEach(items, function (event) {
        /* possible cases:
         start and end are within the scene: put it in this scene
         start is within this scene, end is after this scene:
         if item start is close to the scene end, change item start to next scene start time. The next loop will assign it to that scene
         if item start is not close to the scene end, change item end to scene end, assign it to this scene.
         start is before this scene, end is within this scene: will have already been fixed by a previous loop
         start is after this scene: let the next loop take care of it
         */
        if (event.start_time >= scene.start_time && event.start_time < scene.end_time) {
          if (this.isTranscript(event)) {
            // console.log('transcript event', event);
            //the current event is a transcript and we have a transcript (in this scene) before it that has incorrectly set its end_time to the scene end_time.
            if (previousTranscript.end_time === scene.end_time) {
              // console.log('adjusting according to previousTranscript');
              //end_time may have been empty before the last itter of loop
              previousTranscript.end_time = event.start_time;
            }
            previousTranscript = event;
          }

          if (event.end_time <= scene.end_time) {
            // entirely within scene
            this.events[event._id].scene_id = scene._id;
            sceneItems.push(event);
          } else {

            // end time is in next scene.  Check if start time is close to scene end, if so bump to next scene, otherwise truncate the item to fit in this one
            if (scene.end_time - 0.25 < event.start_time) {
              if (y !== scenesLength - 1) {
                // bump to next scene
                event.start_time = scene.end_time;
              } else {
                //in last scene
                event.end_time = scene.end_time;
                event.scene_id = scene._id;
                sceneItems.push(event);
              }
            } else {
              // truncate and add to this one
              event.end_time = scene.end_time;
              event.scene_id = scene._id;
              sceneItems.push(event);
            }
          }
        }
        // This optimization was dropping some events:
        // if (event.start_time > scene.end_time) {
        // 	itemsIndex = x; //set the current index to i, no need to loop through things we've already seen
        // 	break; // no need to continue checking events after this point as no events will be added to this scene after this point
        // }

      }
      // attach array of items to the scene event:
      // Note these items are references to objects in this.events[]; to change item data, do it in this.events[] instead of here.
      this.events[scene._id].items = this._sortItems(sceneItems);
    }
    // Now that we have the structure, calculate event styles (for scenes and items:)
    episode.styleCss = this.cascadeStyles(episode);
    // the professional css class only should be applied on the ittEpisode template div
    // episode.styleCss is used elsewhere and with the professional class it causes issues in some cases
    episode.templateCss = episode.styleCss;
    if (episode instanceof IEpisode && episode.template.pro_episode_template) {
      episode.templateCss = 'professional ' + episode.templateCss;
    }

    if (episode.template && episode.template.displayName === 'Wiley') {
      episode.templateCss += ' wiley-endscreentext ';
    }

    angular.forEach(this.events,  (event) => {
      if (event.cur_episode_id !== epId) {
        return;
      }
      event.styleCss = this.cascadeStyles(event);
      var isImgPlain = event.component_name === EventTemplates.IMAGE_PLAIN_TEMPLATE ;
      var isInlineImgWText = event.component_name === EventTemplates.IMAGE_INLINE_WITHTEXT_TEMPLATE;
      var isImgCap = event.component_name === EventTemplates.SLIDING_CAPTION;
      var isImgThumb = event.component_name === EventTemplates.IMAGE_THUMBNAIL_TEMPLATE;
      var isBgImage = event.component_name === EventTemplates.IMAGE_FILL_TEMPLATE;

      var isLongText = event.component_name === EventTemplates.TEXT_TRANSMEDIA_TEMPLATE;
      var isDef = event.component_name === EventTemplates.TEXT_DEFINITION_TEMPLATE;
      var isH1 = event.component_name === EventTemplates.HEADER_ONE_TEMPLATE;
      var isH2 = event.component_name === EventTemplates.HEADER_TWO_TEMPLATE;
      var isPq = event.component_name === EventTemplates.PULLQUOTE_TEMPLATE;
      var potentialHighlight = ['highlightSolid', 'highlightBorder', 'highlightSide', 'highlightBloom', 'highlightTilt', 'highlightNone'];
      var potentialTransitions = ['transitionFade', 'transitionPop', 'transitionNone', 'transitionSlideL', 'transitionSlideR'];
      var currentScene;

      if (event._type !== 'Scene') {
        currentScene = this.scene(event.scene_id);
        if (episode.styles.indexOf('timestampNone') === -1 && episode.styles.indexOf('timestampInline') === -1 &&
          (!this.ittUtils.existy(currentScene) || !this.ittUtils.existy(currentScene.styles) || (currentScene.styles.indexOf('timestampNone') === -1 && currentScene.styles.indexOf('timestampInline') === -1) )) {
          if (isImgPlain || isLongText || isDef) {
            if (!this.ittUtils.existy(event.styles) || (event.styles.indexOf('timestampInline') === -1 && event.styles.indexOf('timestampNone') === -1)) {
              event.styleCss += ' timestampNone';
            }
          }
        }
        if (isH1 || isH2 || isPq) {
          event.styleCss += ' timestampNone';
        }

        if ((!this.ittUtils.existy(event.layouts) || event.layouts.indexOf('showCurrent') === -1) &&
        this.ittUtils.intersection(episode.styles, potentialHighlight).length === 0 &&
          (!this.ittUtils.existy(currentScene) || !this.ittUtils.existy(currentScene.styles) || this.ittUtils.intersection(currentScene.styles, potentialHighlight).length === 0) &&
          (!this.ittUtils.existy(event.styles) || this.ittUtils.intersection(event.styles, potentialHighlight).length === 0)) {
          event.styleCss += ' highlightSolid';
        }

        if (this.ittUtils.intersection(episode.styles, potentialTransitions).length === 0 &&
          (!this.ittUtils.existy(currentScene) || !this.ittUtils.existy(currentScene.styles) || this.ittUtils.intersection(currentScene.styles, potentialTransitions).length === 0) &&
          (!this.ittUtils.existy(event.styles) || this.ittUtils.intersection(event.styles, potentialTransitions).length === 0)) {
          if (isImgPlain || isInlineImgWText || isImgCap || isImgThumb || isPq || isBgImage) {
            if (!this.ittUtils.existy(event.layouts) || event.layouts.indexOf('videoOverlay') !== -1) {
              event.styleCss += ' transitionFade';
            } else {
              event.styleCss += ' transitionPop';
            }
          } else {
            event.styleCss += ' transitionSlideL';
          }
        }

      }

      if (event.layouts) {
        event.styleCss = event.styleCss + ' ' + event.layouts.join(' ');
      }

      event.styleCss = event.styleCss.replace(/timestampInline/, '');
    });

    return episode;
  };

  resolveEpisodeContainers = function (epId) {
    // Constructs the episode's parents[] array, up to its navigation depth plus (skipping the episode container itself)
    // Also sets the episode's nextEpisodeContainer and prevEpisodeContainer

    // all parent containers should have been loaded by the time this is called, so we don't need to worry about asynch at each step
    // console.log("resolveEpisodeContainers", epId);
    var episode = this.episodes[epId];
    episode.parents = [];
    delete episode.previousEpisodeContainer;
    delete episode.nextEpisodeContainer;
    // if (episode.navigation_depth > 0) {
    // 	setParents(Number(episode.navigation_depth) + 1, epId, episode.container_id);
    // } else {
    episode.navigation_depth = 0;
    // }
  };

  /*
   var setParents = function (depth, epId, containerId) {


   // console.log("setParents", depth, epId, containerId);
   var episode = this.episodes[epId];

   // THis will build up the parents array backwards, starting at the end
   if (depth <= episode.navigation_depth) { // skip the episode container
   episode.parents[depth - 1] = this.containers[containerId];
   }

   if (depth === episode.navigation_depth) {
   // as long as we're at the sibling level, get the next and previous episodes
   // (But only within the session: this won't let us find e.g. the previous episode from S4E1; that's TODO)
   for (var i = 0; i < this.containers[containerId].children.length; i++) {
   var c = this.containers[containerId].children[i];
   if (c.episodes[0] === epId) {
   if (i > 0) {
   // find the previous 'Published' episode
   for (var j = i - 1; j > -1; j--) {
   if (this.containers[this.containers[containerId].children[j]._id].status === 'Published') {
   episode.previousEpisodeContainer = this.containers[this.containers[containerId].children[j]._id];
   break;
   }
   }
   }
   if (i < this.containers[containerId].children.length - 1) {
   for (var k = i + 1; k < this.containers[containerId].children.length; k++) {
   if (this.containers[this.containers[containerId].children[k]._id].status === 'Published') {
   episode.nextEpisodeContainer = this.containers[this.containers[containerId].children[k]._id];
   break;
   }
   }
   }
   }
   }
   }

   // iterate
   if (depth > 1) {
   setParents(depth - 1, epId, this.containers[containerId].parent_id);
   }

   };
   */

  episode = function (epId) {
    if (!this.episodes[epId]) {
      // console.warn('called modelSvc.episode for a nonexistent ID', epId);
    }
    return this.episodes[epId];
  };

  // returns all scenes and items for a given episode
  episodeEvents = function (epId) {
    // console.log("modelSvc.episodeEvents");
    var ret = [];
    angular.forEach(this.events,  (event) => {
      if (event.cur_episode_id !== epId) {
        return;
      }
      ret.push(event);
    });
    return ret;
  };

  isOnExistingSceneStart(t) {
    return this.getEpisodeScenes().some( (scene) =>{
      return scene.start_time === this.ittUtils.parseTime(t);
    });
  }

  getEpisodeScenes() {
    return Object.keys(this.events).reduce( (scenes, key) => {
      if (this.events[key]._type === 'Scene' && this.events[key].episode_id === this.appState.episodeId) {
        scenes.push(this.events[key]);
      }
      return scenes;
    }, []);
  };

  // returns whichever scene is current for the given time.
  sceneAtEpisodeTime = function (epId, t) {
    t = t || this.playbackService.getMetaProp('time');
    var scenes = this.episodes[epId].scenes;
    for (var i = 0; i < scenes.length; i++) {
      if (scenes[i].start_time <= t && scenes[i].end_time > t) {
        return scenes[i];
      }
    }
  };

  scene = function (sceneId) {
    // console.log("modelthis.scene: ", sceneId);
    if (!this.events[sceneId]) {
      // console.warn('called modelSvc.scene for a nonexistent ID', sceneId);
    }
    return this.events[sceneId];
  };

  // Squish an episode, scene or item's episode styles, scene styles, and styles into a single styleCss string.
  // Styles with these prefixes are the only ones that get passed down to children, and only if there isn't
  // one with the same prefix on the child.
  // typography, color, highlight, timestamp, transition
  cascadeStyles (thing) {
    var styleCategories = { // used to keep track of what categories the thing is already using:
      'typography': false,
      'color': false,
      'highlight': false,
      'timestamp': false,
      'transition': false
    };
    var cssArr = [];

    // start with the thing's own styles

    angular.forEach(thing.styles,  (style) => {
      cssArr.push(style); // keep all styles; not just the ones in a styleCategory
      angular.forEach(styleCategories,  (categoryValue, categoryName) => {
        if (style.indexOf(categoryName) === 0) {
          styleCategories[categoryName] = style;
        }
      });
    });

    // add each sceneStyle, only if it is in a styleCategory the thing isn't already using
    if (thing.scene_id) {
      var sceneStyles = this.events[thing.scene_id].styles;
      angular.forEach(sceneStyles,  (style) => {
        angular.forEach(styleCategories,  (categoryValue, categoryName) => {
          if (!styleCategories[categoryName] && style.indexOf(categoryName) === 0) {
            cssArr.push(style);
            styleCategories[categoryName] = style;
          }
        });
      });
    }


    // if (thing instanceof IEpisode) {
    //   // TODO: add episode namespace until db work is implemented
    //   cssArr.push(thing.template_data.cssClass);
    // }

    // add each episodeStyle, only if it is in a styleCategory the thing isn't already using
    if (thing.cur_episode_id) {
      var episodeStyles = this.episodes[thing.cur_episode_id].styles;
      angular.forEach(episodeStyles,  (style) => {
        angular.forEach(styleCategories,  (categoryValue, categoryName) => {
          if (!styleCategories[categoryName] && style.indexOf(categoryName) === 0) {
            cssArr.push(style);
          }
        });
      });
    }

    // TEMPORARY: force bg items to transitionFade
    if ((thing._type !== 'Scene') && !thing.isContent && thing.layouts && thing.layouts[0].match(/Bg/)) {
      for (var i = 0; i < cssArr.length; i++) {
        if (cssArr[i].match(/transition/) && cssArr[i] !== 'transitionNone') {
          cssArr[i] = 'transitionFade';
        }
      }
    }

    return cssArr.join(' ');
  };

  assocEventWithAsset(eventId, assetId) {
    if (this.events[eventId] && this.assets[assetId]) {
      this.events[eventId].asset = this.assets[assetId];
    }
  }

  resolveEpisodeAssets = function (episodeId) {
    // console.log("resolveEpisodeAssets");
    // attaches assets to this.events
 
    
    angular.forEach(this.events,  (item) => {
      if (item.cur_episode_id !== episodeId) {
        return;
      }
      var assetId = item.asset_id || item.link_image_id || item.annotation_image_id;
      if (!assetId) {
        return;
      }
      if (this.assets[assetId]) {
        this.events[item._id].asset = this.assets[assetId];
      }
    });
    // Do episode's master asset and poster, too.  If they're not here, do nothing; this will get called again after assets load
    if (this.episodes[episodeId]) {
      var master_asset_id = this.episodes[episodeId].master_asset_id;
      if (master_asset_id) {
        if (this.assets[master_asset_id]) {
          this.episodes[episodeId].masterAsset = createInstance('MasterAsset',this.assets[master_asset_id]);
        }
      }
      var poster_frame_id = this.episodes[episodeId].poster_frame_id;
      if (poster_frame_id) {
        if (this.assets[poster_frame_id]) {
          this.episodes[episodeId].poster = this.assets[poster_frame_id];
        }
      }
    }
  };

  // TODO: Future episodes should have this as an available scene template instead
  addLandingScreen = function (episodeId) {
    // console.log("add landing screen", episodeId);
    // create a new scene event for this episod
    this.events['internal:landingscreen:' + episodeId] = createInstance('Scene', {
      '_id': 'internal:landingscreen:' + episodeId,
      '_type': 'Scene',
      '_internal': true,
      'cur_episode_id': episodeId,
      'episode_id': episodeId,
      'start_time': -0.01,
      // enforce its firstness; a start time of zero might sort after the first scene which also starts at zero
      'end_time': 0.01,
      'component_name': EventTemplates.LANDINGSCREEN_TEMPLATE
    });
  };

  // Don't call this until the master asset exists and episode events have loaded!
  addEndingScreen = function (episodeId) {
    // console.log("addEndingScreen", this.episodes[episodeId].scenes);
    var episode = this.episodes[episodeId];

    if (!episode || !episode.scenes) {
      // console.warn('addEndingScreen called on an episode without scenes');
      return;
    }

    if (!episode.masterAsset) {
      console.warn('No master asset in episode...');
      return;
    }

    //may not be sorted... so sort them
    episode.scenes = episode.scenes.sort( (a, b) => {
      return a.start_time - b.start_time;
    });
    var lastScene = episode.scenes[episode.scenes.length - 1];
    if (lastScene._id.match(/internal:endingscreen/)) {
      // console.error('Attempted to add an ending screen twice');
      return;
    }

    var duration = parseFloat(episode.masterAsset.duration); // HACK

    //coerce end of last scene (and its items) to match video duration:
    lastScene.end_time = duration - 0.1;
    angular.forEach(lastScene.items,  (item) => {
      if (item.end_time > duration - 0.1) {
        item.end_time = duration - 0.1;
      }
    });
    
    // create a new scene event for this episode
    this.events['internal:endingscreen:' + episodeId] = createInstance('Scene',{
      '_id': 'internal:endingscreen:' + episodeId,
      '_type': 'Scene',
      '_internal': true,
      'cur_episode_id': episodeId,
      'start_time': duration - 0.1,
      'end_time': duration,
      'component_name': EventTemplates.ENDINGSCREEN_TEMPLATE
    });
    this.events['internal:endingscreen:' + episodeId] = this.setLang(this.events['internal:endingscreen:' + episodeId]);
    this.resolveEpisodeEvents(episodeId);
  };

  // TODO get rid of this; really wasteful to be checking this constantly, it's only useful
  //  right after a master asset upload  (put it in ittVideo pollInterval() instead)
  isTranscoded = function (video) {
    if (video.mediaSrcArr.length > 0) {
      return true;
    }
    return false;
  };

 /*
 if ( config.debugInBrowser) {
    console.log('Event cache:', this.events);
    console.log('Asset cache:', this.assets);
    console.log('Container cache:', this.containers);
    console.log('Episode cache:', this.episodes);
    console.log('Narrative cache:', this.narratives);
    console.log('Customer cache:', this.customers);
  }
  */
 }