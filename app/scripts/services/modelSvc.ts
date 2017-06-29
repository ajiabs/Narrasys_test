/* Parses API data into player-acceptable format,
 and derives secondary data where necessary for performance/convenience/fun */

import {IAnnotators, Partial} from '../interfaces';
import {createInstance, ICustomer, INarrative, IScene, NEvent} from '../models';

export interface IModelSvc {
  episodes: { [episodeId: string]: any };
  assets: { [assetId: string]: any };
  events: { [eventId: string]: NEvent };
  containers: { [containerId: string]: any };
  narratives: { [narrativeId: string]: any };
  customers: { [customerId: string]: any };
  getNarrativeByPathOrId(pathOrId: string): any;
  assocNarrativesWithCustomer(customer: ICustomer, narratives: INarrative[]): ICustomer;
  cachedNarrativesByCustomer(customer: any): any;
  getCustomersAsArray(): any[];
  getNarrativesAsArray(): any[];
  cache(cacheType: string, item: any): void;
  deriveEpisode(episode: any): void;
  deriveAsset(asset: any): any;
  deriveContainer(container: any): any;
  deriveEvent(event: Partial<NEvent>): NEvent;
  setLanguageStrings(): void;
  resolveEpisodeEvents(epId: string): void;
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
}

modelSvc.$inject = ['$filter', '$location', 'ittUtils', 'config', 'appState', 'playbackService', 'urlService'];

export default function modelSvc($filter, $location, ittUtils, config, appState, playbackService, urlService) {
  const DEFAULT_EPISODE_TEMPLATE_URL = 'templates/episode/episode.html';
  var svc: IModelSvc = Object.create(null);

  svc.episodes = {};
  svc.assets = {};
  svc.events = {}; // NOTE svc.events contains scenes and items -- anything that happens during the episode timeline
  svc.containers = {};
  svc.narratives = {};
  svc.customers = {};

  // receives cacheTypes of episode, event, asset, and container.
  // splits event into scenes and items.  Not sure yet whether we care about containers, discarding them for now.

  // TODO? normalize items before cacheing: (annotation_image_id and link_image_id -> asset_id, etc)
  //^^ NP-1310
  // TODO discard unused fields before cacheing

  // use angular.extend if an object already exists, so we don't lose existing bindings

  svc.getNarrativeByPathOrId = function (pathOrId) {
    var isMongoId = /^[0-9a-fA-F]{24}$/.test(pathOrId);
    if (isMongoId) {
      return svc.narratives[pathOrId];
    }
    //else loop and find the matching path slug passed in.
    var n;
    for (n in svc.narratives) {
      if (svc.narratives.hasOwnProperty(n)) {
        if (pathOrId === svc.narratives[n].path_slug.en) {
          return svc.narratives[n];
        }
      }

    }
  };
  //add subdomain to each narrative then cache
  //add narratives to customer object then cache customer.
  svc.assocNarrativesWithCustomer = assocNarrativesWithCustomer;
  function assocNarrativesWithCustomer(customer: ICustomer, narratives: INarrative[]): ICustomer {
    narratives.forEach(function (narrative) {
      svc.cache('narrative', narrative);
    });
    customer.narratives = cachedNarrativesByCustomer(customer);
    svc.cache('customer', customer);
    // //remove any old customer references if narrative was changed to a different customer
    // Object.keys(svc.customers)
    //   .filter(function(key) {
    //   return customer._id !== key;
    // })
    //   .forEach(function(customerId) {
    //     var cust = svc.customers[customerId];
    //     var custNarratives = cust.narratives;
    //     var found;
    //     if (ittUtils.existy(custNarratives) && custNarratives.length > 0 && narratives.length === 1) {
    //       var narrative = svc.narratives[narratives[0]._id];
    //       found = custNarratives.indexOf(narrative);
    //       if (found !== -1) {
    //         cust.narratives.splice(found, 1);
    //         svc.cache('customer', cust);
    //       }
    //     }
    //   });

    return customer;
  }

  svc.cachedNarrativesByCustomer = cachedNarrativesByCustomer;
  function cachedNarrativesByCustomer(customer: ICustomer): INarrative[] {
    return Object.keys(svc.narratives).reduce(function (narratives, key) {
      if (svc.narratives[key].customer_id === customer._id) {
        narratives.push(svc.narratives[key]);
      }
      return narratives;
    }, []);
  }

  svc.getCustomersAsArray = getCustomersAsArray;
  function getCustomersAsArray() {
    return Object.keys(svc.customers).map(function (c) {
      return svc.customers[c];
    });
  }

  svc.getNarrativesAsArray = getNarrativesAsArray;
  function getNarrativesAsArray() {
    return Object.keys(svc.narratives).map(function (n) {
      return svc.narratives[n];
    });
  }


  svc.cache = function (cacheType, item) {
    if (cacheType === 'narrative') {
      // NOTE no deriveNarrative used here, not needed so far

      if (svc.narratives[item._id]) {
        angular.extend(svc.narratives[item._id], item);
      } else {
        svc.narratives[item._id] = angular.copy(item);
      }
    }
    if (cacheType === 'customer') {
      // NOTE no deriveCustomer used here, not needed so far
      if (svc.customers[item._id]) {
        angular.extend(svc.customers[item._id], item);
      } else {
        svc.customers[item._id] = angular.copy(item);
      }
    }
    if (cacheType === 'episode') {
      if (svc.episodes[item._id]) {
        angular.extend(svc.episodes[item._id], svc.deriveEpisode(angular.copy(item)));
      } else {
        svc.episodes[item._id] = svc.deriveEpisode(angular.copy(item));
      }
    } else if (cacheType === 'event') {
      // TEMP fix for events without titles:
      if (!item.title) {
        item.title = {};
      }
      if (svc.events[item._id]) {
        angular.extend(svc.events[item._id], svc.deriveEvent(angular.copy(item)));
      } else {
        svc.events[item._id] = svc.deriveEvent(angular.copy(item));
      }
    } else if (cacheType === 'asset') {
      if (svc.assets[item._id]) {
        angular.extend(svc.assets[item._id], svc.deriveAsset(angular.copy(item)));
      } else {
        svc.assets[item._id] = svc.deriveAsset(angular.copy(item));
      }
    } else if (cacheType === 'container') {
      if (svc.containers[item._id]) {
        angular.extend(svc.containers[item._id], svc.deriveContainer(angular.copy(item)));
      } else {
        svc.containers[item._id] = svc.deriveContainer(angular.copy(item));
      }

    }
  };

  // update template paths from v1.  This is temporary until I have the set of new templates nailed down
  // and have figured out which can be merged or etc; then we can update the values in the database
  var updateTemplates = {
    'templates/episode-default.html': 'templates/episode/episode.html',
    'templates/episode-eliterate.html': 'templates/episode/eliterate.html',
    'templates/episode-ewb.html': 'templates/episode/ewb.html',
    'templates/episode-gw.html': 'templates/episode/gw.html',
    'templates/episode-purdue.html': 'templates/episode/purdue.html',
    'templates/episode-tellingstory.html': 'templates/episode/story.html',

    'templates/scene-1col.html': 'templates/scene/1col.html',
    'templates/scene-2colL.html': 'templates/scene/2colL.html',
    'templates/scene-2colR.html': 'templates/scene/2colR.html',
    'templates/scene-centered.html': 'templates/scene/centered.html',
    'templates/scene-cornerH.html': 'templates/scene/cornerH.html',
    'templates/scene-cornerV.html': 'templates/scene/cornerV.html',

    //annotation:
    'templates/transcript-default.html': 'templates/item/transcript.html',
    'templates/transcript-withthumbnail.html': 'templates/item/transcript-withthumbnail.html',
    'templates/transcript-withthumbnail-alt.html': 'templates/item/transcript-withthumbnail-alt.html',
    'templates/text-h1.html': 'templates/item/text-h1.html',
    'templates/text-h2.html': 'templates/item/text-h2.html',
    'templates/text-pullquote-noattrib.html': 'templates/item/pullquote-noattrib.html',
    'templates/text-pullquote.html': 'templates/item/pullquote.html',

    // upload
    'templates/transmedia-caption.html': 'templates/item/image-caption.html',
    'templates/transmedia-image-default.html': 'templates/item/image.html',
    'templates/transmedia-slidingcaption.html': 'templates/item/image-caption-sliding.html',
    'templates/transmedia-image-fill.html': 'templates/item/image-fill.html',
    'templates/transmedia-image-plain.html': 'templates/item/image-plain.html',
    'templates/transmedia-linkonly.html': 'templates/item/image-linkonly.html',
    'templates/transmedia-thumbnail.html': 'templates/item/image-thumbnail.html',

    //link
    'templates/transmedia-link-default.html': 'templates/item/link.html',
    'templates/transmedia-link-frameicide.html': 'templates/item/link.html',
    'templates/transmedia-link-noembed.html': 'templates/item/link.html',
    'templates/transmedia-link-embed.html': 'templates/item/link-embed.html',
    'templates/transmedia-link-youtube.html': 'templates/item/link.html',
    'templates/transmedia-embed-youtube.html': 'templates/item/link-embed.html',

    // was used internally in v3 player, never exposed to authors so shouldn't appear BUT YOU NEVER KNOW:
    'templates/transmedia-link-icon.html': 'templates/item/link.html',

    // (from old sxs demo; can delete later)
    // "templates/upload-demo-inline.html": "templates/item/debug.html",
    // "templates/upload-demo.html": "templates/item/debug.html",

    //questions
    'templates/question-mc-formative.html': 'templates/item/question-mc-formative.html',
    'templates/question-mc-poll.html': 'templates/item/question-mc-poll.html',

    'templates/question-mc.html': 'templates/item/question-mc.html',
    'templates/question-mc-image-left.html': 'templates/item/question-mc-image-left.html',
    'templates/question-mc-image-right.html': 'templates/item/question-mc-image-right.html',

    'templates/sxs-question.html': 'templates/item/sxs-question.html'
  };

  // svc.deriveFoo() are for efficiency precalculations.
  // Input API data, output API data plus clientside-only convenience variables.
  // Should call this after making any changes to the underlying data.

  svc.deriveEpisode = function (episode) {
    // console.log("deriveEpisode:", episode);

    //If the episode doesn't have a template then assign it the default template
    if (!episode.templateUrl) {
      episode.templateUrl = DEFAULT_EPISODE_TEMPLATE_URL;
    }

    if (updateTemplates[episode.templateUrl]) {
      episode.origTemplateUrl = episode.templateUrl;
      episode.templateUrl = updateTemplates[episode.templateUrl];
    }

    // unpack languages
    angular.forEach(episode.languages, function (lang) {
      if (lang.default) {
        // console.log("FOUND DEFAULT LANGUAGE", lang.code, appState.lang);
        episode.defaultLanguage = lang.code;
      }
    });
    if (episode.defaultLanguage === false) {
      episode.defaultLanguage = 'en'; // last resort
    }
    svc.setLanguageStrings();

    // For now, automatically add customer-specific styles to episode if there aren't other selections.
    // (TODO Producer should do this automatically; this is for legacy episodes):
    if (!episode.styles) {
      episode.styles = [];
    }
    angular.forEach(['eliterate', 'gw', 'gwsb', 'purdue', 'usc', 'columbia', 'columbiabusiness'], function (customer) {
      if (episode.templateUrl === 'templates/episode/' + customer + '.html') {
        angular.forEach(['color', 'typography'], function (styleType) {
          // if the episode doesn't already have styletypeFoo, add styletypeCustomer
          var found = false;
          angular.forEach(episode.styles, function (style) {
            if (style.match(styleType)) {
              found = true;
            }
          });
          if (!found) {
            episode.styles.push(styleType + customer[0].toUpperCase() + customer.substring(1));
          }
        });
      }
    });

    if (episode.title && svc.events['internal:landingscreen:' + episode._id]) {
      svc.events['internal:landingscreen:' + episode._id].title = episode.title;
      svc.events['internal:landingscreen:' + episode._id] = setLang(svc.events['internal:landingscreen:' + episode._id]);
    }

    episode = setLang(episode);
    return episode;
  };

  svc.deriveAsset = function (asset) {
    // console.log("deriveAsset:", asset);
    if (asset._type === 'Asset::Video') {
      asset = urlService.resolveVideo(asset);
    }
    asset = setLang(asset);
    return asset;
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

  svc.deriveContainer = function (container) {

    // console.log("deriving container", container);

    container.haveNotLoadedChildData = false; // not sure yet if this is necessary
    // first sort the children:
    if (container.children && container.children.length > 0) {
      // When we populate sort_order, we can remove this:
      container.children = container.children.sort(function (a, b) {
        return (a.name.en > b.name.en) ? 1 : -1; // WARN always sorted by english
      });
      // This is the real one (for now sort_order always is zero, so this sort will have no effect):
      container.children = container.children.sort(function (a, b) {
        return a.sort_order - b.sort_order;
      });

      var childRefs = [];
      angular.forEach(container.children, function (child) {
        if (svc.containers[child._id]) {
          childRefs.push(svc.containers[child._id]);
        } else {
          child.haveNotLoadedChildData = true; // not sure yet if this is necessary
          svc.containers[child._id] = angular.copy(setLang(child));
        }

      });

      container.loadedChildData = true;
    } else {
      container.children = [];
    }
    return setLang(container);
  };

  var isTranscript = function (item) {
    if (typeof (item) !== 'undefined') {
      if (item._type === 'Annotation' && item.templateUrl.match(/transcript/)) {
        return true;
      } else {
        return false;
      }
    }
  };

  svc.deriveEvent = function (event: Partial<NEvent>): NEvent {
    event = setLang(event);
    if (event._type !== 'Scene') {

      event.searchableText = (event.display_annotation || event.display_description) + ' ' + (event.display_title || event.display_annotator);
      if (!event.cosmetic) {
        event.cosmetic = false; // search needs this to be explicit
      }
      if (event.sxs) { // HACK can probably be safely removed?
        event.cosmetic = false;
      }
      if (!event.templateUrl) {
        event.templateUrl = '';
      }

      if (event.avatar_id) {
        if (!svc.assets[event.avatar_id]) { // not sure if necessary here.  Should move this into a getter function for assets anyway
          svc.assets[event.avatar_id] = {};
        }
        event.avatar = svc.assets[event.avatar_id];
      }

      if (svc.episodes[event.cur_episode_id] && svc.episodes[event.cur_episode_id].templateUrl === 'templates/episode/usc.html') {
        // HACKS AHOY
        // USC made a bunch of change requests post-release; this was the most expedient way
        // to deal with them. Sorry!

        // I don't know why this situation occurs, but it does:
        if (event.templateUrl === '') {
          event.templateUrl = 'templates/item/usc-badges.html';
        }

        if (event._type === 'Link') {
          if (event.templateUrl === 'templates/transmedia-link-default.html') {
            // they don't want any embedded links (shrug)
            event.templateUrl = 'templates/transmedia-link-noembed.html';
          }
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
      event.noExternalLink = false;
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
      if (isTranscript(event)) {
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

      if (event.templateUrl.match(/-embed/)) {
        event.noExternalLink = true;
      }

      if (event.templateUrl.match(/frameicide/)) {
        event.targetTop = true;
      }
    }

    // both scenes and items.  Do this last for now, since we're doing some ugly string matching against the old templateUrl:
    if (updateTemplates[event.templateUrl]) {
      event.origTemplateUrl = event.templateUrl;
      event.templateUrl = updateTemplates[event.templateUrl];

      // coerce old image-plain background images into image-fill:
      if (!event.isContent && event.templateUrl === 'templates/item/image-plain.html') {
        event.templateUrl = 'templates/item/image-fill.html';
      }
      // hack for old authoring tool quirk:
      // if (event.templateUrl === "templates/item/image-plain.html") {
      // 	console.log('adding timestamp none!!');
      // 	if (event.styles) {
      // 		event.styles.push("timestampNone");
      // 	} else {
      // 		event.styles = ["timestampNone"];
      // 	}
      // }
    } else {
      // console.log("Keeping same templateUrl:", event.templateUrl);
      event.origTemplateUrl = event.templateUrl;
    }

    // Finally one more super-fragile HACK for producer:
    if (!event.producerItemType) {
      if (event._type === 'Scene') {
        event.producerItemType = 'scene';
      } else if (event._type === 'Annotation') {
        if (event.templateUrl.match(/transcript/)) {
          event.producerItemType = 'transcript';
        } else {
          event.producerItemType = 'annotation';
        }
      } else if (event._type === 'Upload') {
        if (event.templateUrl.match(/file/)) { // HACK
          event.producerItemType = 'file';
        } else {
          event.producerItemType = 'image';
        }
      } else if (event._type === 'Link') {
        if (event.templateUrl.match(/video/)) {
          event.producerItemType = 'video';
        } else {
          event.producerItemType = 'link';
        }
      } else if (event._type === 'Plugin') {
        if (event.templateUrl.match(/question/)) {
          event.producerItemType = 'question';
        }
      } else if (event._type === 'Chapter') {
        event.producerItemType = 'chapter';
      }
      if (!event.producerItemType) {
        console.warn('Couldn\'t determine a producerItemType for ', event.templateUrl);
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
        if (/pullquote/.test(event.templateUrl)) {
          event.isPq = true;
        }
        if (/text-h1|text-h2/.test(event.templateUrl)) {
          console.log('setting header!!');
          event.isHeader = true;
        }

        if (/text-transmedia/.test(event.templateUrl)) {
          event.isLongText = true;
        }

        if (/text-definition/) {
          event.isDef = true;
        }
        break;
    }

    event.displayStartTime = $filter('asTime')(event.start_time);
    return event;
  };

  var setLang = function (obj) {
    // TODO: keywords, customers/oauth2_message
    // TODO use episode default language instead of 'en'
    var langToSet = (appState.lang) ? appState.lang : 'en';
    angular.forEach(['title', 'annotator', 'annotation', 'description', 'name'], function (field) {
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

  svc.setLanguageStrings = function () {
    angular.forEach(svc.events, function (evt) {
      evt = setLang(evt);
    });
    angular.forEach(svc.episodes, function (ep) {
      ep = setLang(ep);
    });
    angular.forEach(svc.containers, function (container) {
      container = setLang(container);
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
  function _sortItems(items) {
    return items.sort(function (a, b) {
      if (a.start_time === b.start_time) {
        if (a.producerItemType === 'chapter') {
          return -1;
        } else if (b.producerItemType === 'chapter') {
          return 1;
        } else if (a.chapter_marker === true) {
          return -1;
        } else if (b.chapter_marker === true) {
          return 1;
        } else if (a.templateUrl === 'templates/item/text-h1.html') {
          return -1;
        } else if (b.templateUrl === 'templates/item/text-h1.html') {
          return 1;
        } else if (a.templateUrl === 'templates/item/text-h2.html') {
          return -1;
        } else if (b.templateUrl === 'templates/item/text-h2.html') {
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

  /*  Any changes to any scene or item data must call svc.resolveEpisodeEvents afterwards. It sets:
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
  svc.resolveEpisodeEvents = function (epId) {
    // console.log("resolveEpisodeEvents");
    //Build up child arrays: episode->scene->item
    var scenes = [];
    var items = [];
    var chapters = [];
    var episode = svc.episodes[epId];
    angular.forEach(svc.events, function (event) {
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
    angular.forEach(items, function (event) {
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
    // Note these are references to objects in svc.events[]; to change item data, do it in svc.events[] instead of here.
    var duration = 0;
    if (episode.masterAsset) {
      duration = episode.masterAsset.duration;
      angular.forEach(episode.scenes, function (scene) {
        if (scene.start_time > duration) {
          scene.start_time = duration - 0.2; // last resort HACK to catch bad scene data
        }
      });
    }

    episode.scenes = scenes.sort(function (a, b) {
      if (a._id.indexOf('internal:start') > -1 || b._id.indexOf('internal:end') > -1) {
        return -1;
      }
      if (b._id.indexOf('internal:start') > -1 || a._id.indexOf('internal:end') > -1) {
        return 1;
      }
      return a.start_time - b.start_time;
    });

    // and a redundant array of child items to the episode for convenience (they're just references, so it's not like we're wasting a lot of space)

    episode.chapters = chapters.sort(function (a, b) {
      return a.start_time - b.start_time;
    });

    // Fix bad event timing data.  (see also svc.deriveEvent())
    angular.forEach(items, function (event) {

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

    episode.items = _sortItems(items);
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
          if (isTranscript(event)) {
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
            svc.events[event._id].scene_id = scene._id;
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
      // Note these items are references to objects in svc.events[]; to change item data, do it in svc.events[] instead of here.
      svc.events[scene._id].items = _sortItems(sceneItems);
    }
    // Now that we have the structure, calculate event styles (for scenes and items:)
    episode.styleCss = cascadeStyles(episode);
    angular.forEach(svc.events, function (event) {
      if (event.cur_episode_id !== epId) {
        return;
      }
      event.styleCss = cascadeStyles(event);
      var isImgPlain = event.templateUrl === 'templates/item/image-plain.html';
      var isInlineImgWText = event.templateUrl === 'templates/item/image-inline-withtext.html';
      var isImgCap = event.templateUrl === 'templates/item/image-caption-sliding.html';
      var isImgThumb = event.templateUrl === 'templates/item/image-thumbnail.html';
      var isBgImage = event.templateUrl === 'templates/item/image-fill.html';

      var isLongText = event.templateUrl === 'templates/item/text-transmedia.html';
      var isDef = event.templateUrl === 'templates/item/text-definition.html';
      var isH1 = event.templateUrl === 'templates/item/text-h1.html';
      var isH2 = event.templateUrl === 'templates/item/text-h2.html';
      var isPq = event.templateUrl === 'templates/item/pullquote-noattrib.html' || event.templateUrl === 'templates/item/pullquote.html';
      var potentialHighlight = ['highlightSolid', 'highlightBorder', 'highlightSide', 'highlightBloom', 'highlightTilt', 'highlightNone'];
      var potentialTransitions = ['transitionFade', 'transitionPop', 'transitionNone', 'transitionSlideL', 'transitionSlideR'];
      var currentScene;

      if (event._type !== 'Scene') {
        currentScene = svc.scene(event.scene_id);
        if (episode.styles.indexOf('timestampNone') === -1 && episode.styles.indexOf('timestampInline') === -1 &&
          (!ittUtils.existy(currentScene) || !ittUtils.existy(currentScene.styles) || (currentScene.styles.indexOf('timestampNone') === -1 && currentScene.styles.indexOf('timestampInline') === -1) )) {
          if (isImgPlain || isLongText || isDef) {
            if (!ittUtils.existy(event.styles) || (event.styles.indexOf('timestampInline') === -1 && event.styles.indexOf('timestampNone') === -1)) {
              event.styleCss += ' timestampNone';
            }
          }
        }
        if (isH1 || isH2 || isPq) {
          event.styleCss += ' timestampNone';
        }

        if ((!ittUtils.existy(event.layouts) || event.layouts.indexOf('showCurrent') === -1) &&
          ittUtils.intersection(episode.styles, potentialHighlight).length === 0 &&
          (!ittUtils.existy(currentScene) || !ittUtils.existy(currentScene.styles) || ittUtils.intersection(currentScene.styles, potentialHighlight).length === 0) &&
          (!ittUtils.existy(event.styles) || ittUtils.intersection(event.styles, potentialHighlight).length === 0)) {
          event.styleCss += ' highlightSolid';
        }

        if (ittUtils.intersection(episode.styles, potentialTransitions).length === 0 &&
          (!ittUtils.existy(currentScene) || !ittUtils.existy(currentScene.styles) || ittUtils.intersection(currentScene.styles, potentialTransitions).length === 0) &&
          (!ittUtils.existy(event.styles) || ittUtils.intersection(event.styles, potentialTransitions).length === 0)) {
          if (isImgPlain || isInlineImgWText || isImgCap || isImgThumb || isPq || isBgImage) {
            if (!ittUtils.existy(event.layouts) || event.layouts.indexOf('videoOverlay') !== -1) {
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
  };

  svc.resolveEpisodeContainers = function (epId) {
    // Constructs the episode's parents[] array, up to its navigation depth plus (skipping the episode container itself)
    // Also sets the episode's nextEpisodeContainer and prevEpisodeContainer

    // all parent containers should have been loaded by the time this is called, so we don't need to worry about asynch at each step
    // console.log("resolveEpisodeContainers", epId);
    var episode = svc.episodes[epId];
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
   var episode = svc.episodes[epId];

   // THis will build up the parents array backwards, starting at the end
   if (depth <= episode.navigation_depth) { // skip the episode container
   episode.parents[depth - 1] = svc.containers[containerId];
   }

   if (depth === episode.navigation_depth) {
   // as long as we're at the sibling level, get the next and previous episodes
   // (But only within the session: this won't let us find e.g. the previous episode from S4E1; that's TODO)
   for (var i = 0; i < svc.containers[containerId].children.length; i++) {
   var c = svc.containers[containerId].children[i];
   if (c.episodes[0] === epId) {
   if (i > 0) {
   // find the previous 'Published' episode
   for (var j = i - 1; j > -1; j--) {
   if (svc.containers[svc.containers[containerId].children[j]._id].status === 'Published') {
   episode.previousEpisodeContainer = svc.containers[svc.containers[containerId].children[j]._id];
   break;
   }
   }
   }
   if (i < svc.containers[containerId].children.length - 1) {
   for (var k = i + 1; k < svc.containers[containerId].children.length; k++) {
   if (svc.containers[svc.containers[containerId].children[k]._id].status === 'Published') {
   episode.nextEpisodeContainer = svc.containers[svc.containers[containerId].children[k]._id];
   break;
   }
   }
   }
   }
   }
   }

   // iterate
   if (depth > 1) {
   setParents(depth - 1, epId, svc.containers[containerId].parent_id);
   }

   };
   */

  svc.episode = function (epId) {
    if (!svc.episodes[epId]) {
      console.warn('called modelSvc.episode for a nonexistent ID', epId);
    }
    return svc.episodes[epId];
  };

  // returns all scenes and items for a given episode
  svc.episodeEvents = function (epId) {
    // console.log("modelSvc.episodeEvents");
    var ret = [];
    angular.forEach(svc.events, function (event) {
      if (event.cur_episode_id !== epId) {
        return;
      }
      ret.push(event);
    });
    return ret;
  };

  svc.isOnExistingSceneStart = isOnExistingSceneStart;
  function isOnExistingSceneStart(t) {
    return getEpisodeScenes().some(function (scene) {
      return scene.start_time === ittUtils.parseTime(t);
    });
  }

  svc.getEpisodeScenes = getEpisodeScenes;
  function getEpisodeScenes() {
    return Object.keys(svc.events).reduce(function (scenes, key) {
      if (svc.events[key]._type === 'Scene' && svc.events[key].episode_id === appState.episodeId) {
        scenes.push(svc.events[key]);
      }
      return scenes;
    }, []);
  }

  // returns whichever scene is current for the given time.
  svc.sceneAtEpisodeTime = function (epId, t) {
    t = t || playbackService.getMetaProp('time');
    var scenes = svc.episodes[epId].scenes;
    for (var i = 0; i < scenes.length; i++) {
      if (scenes[i].start_time <= t && scenes[i].end_time > t) {
        return scenes[i];
      }
    }
  };

  svc.scene = function (sceneId) {
    // console.log("modelsvc.scene: ", sceneId);
    if (!svc.events[sceneId]) {
      console.warn('called modelSvc.scene for a nonexistent ID', sceneId);
    }
    return svc.events[sceneId];
  };

  // Squish an episode, scene or item's episode styles, scene styles, and styles into a single styleCss string.
  // Styles with these prefixes are the only ones that get passed down to children, and only if there isn't
  // one with the same prefix on the child.
  // typography, color, highlight, timestamp, transition
  var cascadeStyles = function (thing) {
    var styleCategories = { // used to keep track of what categories the thing is already using:
      'typography': false,
      'color': false,
      'highlight': false,
      'timestamp': false,
      'transition': false
    };
    var cssArr = [];

    // start with the thing's own styles

    angular.forEach(thing.styles, function (style) {
      cssArr.push(style); // keep all styles; not just the ones in a styleCategory
      angular.forEach(styleCategories, function (categoryValue, categoryName) {
        if (style.indexOf(categoryName) === 0) {
          styleCategories[categoryName] = style;
        }
      });
    });

    // add each sceneStyle, only if it is in a styleCategory the thing isn't already using
    if (thing.scene_id) {
      var sceneStyles = svc.events[thing.scene_id].styles;
      angular.forEach(sceneStyles, function (style) {
        angular.forEach(styleCategories, function (categoryValue, categoryName) {
          if (!styleCategories[categoryName] && style.indexOf(categoryName) === 0) {
            cssArr.push(style);
            styleCategories[categoryName] = style;
          }
        });
      });
    }

    // add each episodeStyle, only if it is in a styleCategory the thing isn't already using
    if (thing.cur_episode_id) {
      var episodeStyles = svc.episodes[thing.cur_episode_id].styles;
      angular.forEach(episodeStyles, function (style) {
        angular.forEach(styleCategories, function (categoryValue, categoryName) {
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

  svc.assocEventWithAsset = assocEventWithAsset;
  function assocEventWithAsset(eventId, assetId) {
    if (svc.events[eventId] && svc.assets[assetId]) {
      svc.events[eventId].asset = svc.assets[assetId];
    }
  }

  svc.resolveEpisodeAssets = function (episodeId) {
    // console.log("resolveEpisodeAssets");
    // attaches assets to svc.events
    angular.forEach(svc.events, function (item) {
      if (item.cur_episode_id !== episodeId) {
        return;
      }
      var assetId = item.asset_id || item.link_image_id || item.annotation_image_id;
      if (!assetId) {
        return;
      }
      if (svc.assets[assetId]) {
        svc.events[item._id].asset = svc.assets[assetId];
      }
    });
    // Do episode's master asset and poster, too.  If they're not here, do nothing; this will get called again after assets load
    if (svc.episodes[episodeId]) {
      var master_asset_id = svc.episodes[episodeId].master_asset_id;
      if (master_asset_id) {
        if (svc.assets[master_asset_id]) {
          svc.episodes[episodeId].masterAsset = svc.assets[master_asset_id];
        }
      }
      var poster_frame_id = svc.episodes[episodeId].poster_frame_id;
      if (poster_frame_id) {
        if (svc.assets[poster_frame_id]) {
          svc.episodes[episodeId].poster = svc.assets[poster_frame_id];
        }
      }
    }
  };

  // TODO: Future episodes should have this as an available scene template instead
  svc.addLandingScreen = function (episodeId) {
    // console.log("add landing screen", episodeId);
    // create a new scene event for this episod
    svc.events['internal:landingscreen:' + episodeId] = createInstance('Scene', {
      '_id': 'internal:landingscreen:' + episodeId,
      '_type': 'Scene',
      '_internal': true,
      'templateUrl': 'templates/scene/landingscreen.html',
      'cur_episode_id': episodeId,
      'episode_id': episodeId,
      'start_time': -0.01,
      // enforce its firstness; a start time of zero might sort after the first scene which also starts at zero
      'end_time': 0.01
    });
  };

  // Don't call this until the master asset exists and episode events have loaded!
  svc.addEndingScreen = function (episodeId) {
    // console.log("addEndingScreen", svc.episodes[episodeId].scenes);
    var episode = svc.episodes[episodeId];

    if (!episode || !episode.scenes) {
      console.warn('addEndingScreen called on an episode without scenes');
      return;
    }

    if (!episode.masterAsset) {
      console.warn('No master asset in episode...');
      return;
    }

    //may not be sorted... so sort them
    episode.scenes = episode.scenes.sort(function (a, b) {
      return a.start_time - b.start_time;
    });
    var lastScene = episode.scenes[episode.scenes.length - 1];
    if (lastScene._id.match(/internal:endingscreen/)) {
      console.error('Attempted to add an ending screen twice');
      return;
    }

    var duration = parseFloat(episode.masterAsset.duration); // HACK

    //coerce end of last scene (and its items) to match video duration:
    lastScene.end_time = duration - 0.1;
    angular.forEach(lastScene.items, function (item) {
      if (item.end_time > duration - 0.1) {
        item.end_time = duration - 0.1;
      }
    });
    // create a new scene event for this episode
    svc.events['internal:endingscreen:' + episodeId] = createInstance('Scene',{
      '_id': 'internal:endingscreen:' + episodeId,
      '_type': 'Scene',
      '_internal': true,
      'templateUrl': 'templates/scene/endingscreen.html',
      'cur_episode_id': episodeId,
      'start_time': duration - 0.1,
      'end_time': duration
    });
    svc.events['internal:endingscreen:' + episodeId] = setLang(svc.events['internal:endingscreen:' + episodeId]);
    svc.resolveEpisodeEvents(episodeId);
  };

  // TODO get rid of this; really wasteful to be checking this constantly, it's only useful
  //  right after a master asset upload  (put it in ittVideo pollInterval() instead)
  svc.isTranscoded = function (video) {
    if (video.mediaSrcArr.length > 0) {
      return true;
    }
    return false;
  };

  if (config.debugInBrowser) {
    console.log('Event cache:', svc.events);
    console.log('Asset cache:', svc.assets);
    console.log('Container cache:', svc.containers);
    console.log('Episode cache:', svc.episodes);
    console.log('Narrative cache:', svc.narratives);
    console.log('Customer cache:', svc.customers);
  }
  return svc;

}
