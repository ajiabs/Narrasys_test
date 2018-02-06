// @npUpgrade-shared-false
// TODO: load and resolve categories


import {
  createInstance, IAsset, IEpisode, IEpisodeTemplate, IEvent,  ILayout,  IStyle,
  ITemplate
} from '../../../models';
import { IEmailFields, IEpisodeTheme, Partial, IDataCache, TDataCacheItem } from '../../../interfaces';
import { existy, intersection, pick } from '../ittUtils';
import { config } from '../../../config';

/**
 * @ngdoc service
 * @name iTT.service:dataSvc
 * @description
 * Service for hitting API endpoints
 * prior code comments:
 * Cache here is for things we never need to expose to the rest of the app (style, layout, template IDs)
 * the rest gets passed to modelSvc
 * use PUT to update, POST to create new
 * for assets, DELETE then POST
 * to store -- must wrap events in 'event: {}'  same for other things?  template didn't seem to need it
 * @requires $q
 * @requires $http
 * @requires $routeParams
 * @requires $rootScope
 * @requires config
 * @requires authSvc
 * @requires appState
 * @requires modelSvc
 * @requires errorSvc
 * @requires mockSvc
 * @requires questionAnswersSvc
 */

interface ITemplateSelect {
  id: string;
  name: string;
  customer_ids: string[];
}

export interface IDataSvc {
  beginBackgroundTranslations(episodeId: string): any;
  batchUploadTranscripts(episodeId: string, formData: any, params: any): ng.IPromise<{}>;
  generateNewNarrative(containerId, postData): ng.IPromise<{}>;
  getNarrative(narrativeId): ng.IPromise<{}>;
  getNarrativeOverview(narrativeId): ng.IPromise<{}>;
  getNarrativeExportAsSpreadsheet(nId: string): void;
  getCustomerLinkStatusReportSpreadsheet(customerId): void;
  getUserNarratives(userId): ng.IPromise<{}>;
  getCustomerList(): any;
  getCustomer(customerId: string, retrieve: boolean): ng.IPromise<any>;
  getEpisode(epId, segmentId): void;
  getEpisodeOverview(epId): ng.IPromise<{}>;
  getNarrativeList(customer): ng.IPromise<{}>;
  createUserGroup(groupName): ng.IPromise<{}>;
  createNarrative(narrativeData): ng.IPromise<{}>;
  updateNarrative(narrativeData): ng.IPromise<{}>;
  createChildEpisode(childData): ng.IPromise<{}>;
  createEpisodeSegment(narrativeId, segmentData): ng.IPromise<{}>;
  storeTimeline(narrativeId, origTimeline): ng.IPromise<{}>;
  deleteTimeline(tlId): ng.IPromise<{}>;
  getSingleAsset(assetId): ng.IPromise<IAsset>;
  getCommon(): ng.IPromise<{}>;
  cache(cacheType, dataList): void;
  createTemplate(templateData): ng.IPromise<{}>;
  resolveIDs(obj): object;
  getAssetsByAssetIds(assetIds: string[]): ng.IPromise<IAsset[]>;
  fetchAndCacheAssetsByIds(assetIds: string[]): ng.IPromise<IAsset[]>;
  getContainerAncestry(containerId, episodeId, defer): ng.IPromise<{}>;
  getContainerRoot(): string[];
  getContainer(id, episodeId?): ng.IPromise<{}>;
  getContainerAssets(containerId, episodeId?): ng.IPromise<{}>;
  createContainer(container): ng.IPromise<{}>;
  updateContainer(container): ng.IPromise<{}>;
  deleteContainer(containerId): ng.IPromise<{}>;
  createEpisode(episode): ng.IPromise<{}>;
  storeEpisode(epData): ng.IPromise<{} | boolean>;
  deleteItem(evtId): ng.IPromise<{}>;
  createAsset(containerId, asset): ng.IPromise<{}>;
  deleteAsset(assetId): ng.IPromise<{}>;
  storeItem(evt: IEvent): ng.IPromise<IEvent | boolean>;
  prepItemForStorage(evt): any;
  detachMasterAsset(epData: IEpisode): ng.IPromise<void | boolean>;
  readCache<K extends keyof IDataCache, F extends keyof TDataCacheItem>(
    cache: K,
    field: F,
    val: TDataCacheItem[F]): TDataCacheItem;
  getTemplates(): ITemplate[];
  getTemplate(id: string): ITemplate;
  sendSocialshareEmail(tlId:string, email: IEmailFields): ng.IPromise<void>;
  fetchTemplates(): ng.IPromise<ITemplate[]>;
  getEpisodeTemplatesAdmin(): ITemplateSelect[];
  getEpisodeTemplatesByCustomerIds(custids: string[]): ITemplateSelect[];
}
dataSvc.$inject = ['$q', '$http', '$routeParams', '$rootScope', '$location', 'ittUtils', 'authSvc', 'appState', 'modelSvc', 'errorSvc', 'mockSvc', 'questionAnswersSvc', 'episodeTheme'];
export default function dataSvc($q, $http, $routeParams, $rootScope, $location, ittUtils, authSvc, appState, modelSvc, errorSvc, mockSvc, questionAnswersSvc, episodeTheme: IEpisodeTheme) {
  var svc: IDataSvc = Object.create(null);

  /* ------------------------------------------------------------------------------ */

  svc.sendSocialshareEmail = sendSocialshareEmail;
  function sendSocialshareEmail(tlId: string, email: IEmailFields): ng.IPromise<void> {
    return SANE_POST(`/v3/timelines/${tlId}/share_via_email`, email);
  }

  svc.beginBackgroundTranslations = beginBackgroundTranslations;
  function beginBackgroundTranslations(episodeId) {
    return SANE_GET('/v3/episodes/' + episodeId + '/update_translations');
  }
  //NEED to find impl with params arg
  svc.batchUploadTranscripts = batchUploadTranscripts;
  function batchUploadTranscripts(episodeId, formData, params) {
    var config = {
      transformRequest: angular.identity,
      headers: {'Content-type': undefined}
    };

    if (ittUtils.existy(params) && Object.keys(params).length > 0) {
      Object.assign(config, {params:params});
    }

    // return $q(function(resolve){return resolve(formData)});
    return SANE_POST('/v3/episodes/' + episodeId + '/events/import_subtitles', formData, config);
  }

  //used in ittContainer
  svc.generateNewNarrative = generateNewNarrative;
  function generateNewNarrative(containerId, postData) {
    return SANE_POST('/v3/containers/' + containerId + '/narratives', postData)
      .then(function (resp) {
        return resp.data;
      })
      .catch(function (e) {
        console.error('Error generating new narrative:', e);
      });
  }

  // WARN ittNarrative and ittNarrativeTimeline call dataSvc directly, bad practice. At least put modelSvc in between
  svc.getNarrative = function (narrativeId) {
    // Special case here, since it needs to call getNonce differently:
    var defer = $q.defer();
    var cachedNarrative = modelSvc.narratives[narrativeId];
    var subdomain = ittUtils.getSubdomain($location.host());
    var urlParams = '';

    if (ittUtils.existy(cachedNarrative) && ittUtils.existy(cachedNarrative.narrative_subdomain) && subdomain !== cachedNarrative.narrative_subdomain) {
      urlParams = '?customer=' + cachedNarrative.narrative_subdomain;
    }

    authSvc.authenticate('narrative=' + narrativeId).then(function () {
      $http.get(config.apiDataBaseUrl + '/v3/narratives/' + narrativeId + '/resolve' + urlParams)
        .then(function (response) {

          response.data.timelines.sort(function (a, b) {
            return a.sort_order - b.sort_order;
          });
          modelSvc.cache('narrative', svc.resolveIDs(response.data));
          defer.resolve(modelSvc.narratives[response.data._id]);
        });
    });
    return defer.promise;
  };

  svc.getNarrativeOverview = function (narrativeId) {
    return GET('/v3/narratives/' + narrativeId);
  };

  svc.getNarrativeExportAsSpreadsheet = function (nId) {
    var url = '/v3/narratives/' + nId + '.xlsx';
    window.open(url);
  };

  svc.getCustomerLinkStatusReportSpreadsheet = getCustomerLinkStatusReportSpreadsheet;
  function getCustomerLinkStatusReportSpreadsheet(customerId) {
    var url = '/v3/customers/' + customerId + '/link_status.xlsx';
    window.open(url);
  }

  var cachedPurchases = false;
  svc.getUserNarratives = function (userId) {
    if (cachedPurchases) {
      var defer = $q.defer();
      defer.resolve(cachedPurchases);
      return defer.promise;
    } else {
      return GET('/v3/users/' + userId + '/narrative_purchases', function (data) {
        cachedPurchases = data;
        return data;
      });

    }
  };

  svc.getCustomerList = function () {
    return GET('/v3/customers/', function (customers) {
      angular.forEach(customers, function (customer) {
        modelSvc.cache('customer', customer);
      });
      return customers;
    });

  };

  svc.getCustomer = function (customerId, retrieve) {
    if (!(authSvc.userHasRole('admin') || authSvc.userHasRole('customer admin'))) {
      return $q(function (resolve) {
        resolve({});
      });
    }
    if (modelSvc.customers[customerId]) {

      if (retrieve) {
        return $q(function (resolve) {
          resolve(modelSvc.customers[customerId]);
        });
      }
      // have it already, or at least already getting it
    } else {
      return SANE_GET('/v3/customers/' + customerId)
        .then(customer => {
          modelSvc.cache('customer', customer); // the real thing
          return modelSvc.customers[customer._id];
        })
        .catch(e => console.log('wtf mate?', e));
    }
  };

  // getEpisode just needs to retrieve all episode data from the API, and pass it on
  // to modelSvc.  No promises needed, let the $digest do the work
  svc.getEpisode = function (epId, segmentId) {
    if (!epId) {
      throw ('no episode ID supplied to dataSvc.getEpisode');
    }

    // Removing this as it caused race conditions: sometimes the asset and event data has already been loaded, sometimes not.
    // This will cause epsiode data to be requested from the api every time the page loads, instead of trying to recycle the cache, but that's probably safer anyway
    // if (modelSvc.episodes[epId]) {
    // 	console.log("have episode: ", modelSvc.episodes[epId]);
    // 	$rootScope.$emit("dataSvc.getEpisode.done");
    // 	return; // already requested
    // }
    modelSvc.cache('episode', {
      _id: epId
    }); // init with empty object to be filled by asynch process

    if ($routeParams.local) {
      mockSvc.mockEpisode(epId);
      // console.log("Got all events");
      $rootScope.$emit('dataSvc.getEpisode.done');
    } else {
      authSvc.authenticate()
        .then(function () {
          return getCommon();
        })
        .then(function () {
          return getEpisode(epId, segmentId);
        });
    }
  };
  svc.getEpisodeOverview = function (epId) {
    return GET('/v3/episodes/' + epId);
  };

  svc.getNarrativeList = function (customer) {
    if (!ittUtils.existy(customer)) {
      return GET('/v3/narratives/');
    }

    return GET('/v3/narratives?customer_id=' + customer._id)
      .then(function (narratives) {
        modelSvc.assocNarrativesWithCustomer(customer, narratives);
      });
  };

  svc.createUserGroup = function (groupName) {
    return POST('/v3/groups', {
      'group': {
        'name': groupName
      }
    });
  };

  svc.createNarrative = function (narrativeData) {
    return SANE_POST('/v3/narratives', narrativeData);
  };
  svc.updateNarrative = function (narrativeData) {
    return SANE_PUT('/v3/narratives/' + narrativeData._id, narrativeData);
  };

  svc.createChildEpisode = function (childData) {
    // console.log("about to create child epsiode", childData);
    return POST('/v3/episodes', {
      'episode': childData
    });
  };

  svc.createEpisodeSegment = function (narrativeId, segmentData) {
    return POST('/v3/timelines/' + narrativeId + '/episode_segments', segmentData);
  };

  svc.storeTimeline = function (narrativeId, origTimeline) {

    var permitted = [
      'sort_order',
      'path_slug',
      'name',
      'description',
      'hidden',
      'timeline_image_ids',
      'narrative_id',
      '_id'
    ];
    var timeline = ittUtils.pick(origTimeline, permitted);

    if (timeline._id) {
      return PUT('/v3/timelines/' + timeline._id, timeline, function (ret) {
        // TEMPORARY until api stops doing this
        if (typeof ret.name === 'string') {
          ret.name = {
            en: ret.name
          };
        }
        if (typeof ret.description === 'string') {
          ret.description = {
            en: ret.description
          };
        }
        return ret;
      });
    } else {
      return POST('/v3/narratives/' + narrativeId + '/timelines', timeline, function (ret) {
        // TEMPORARY until api stops doing this
        if (typeof ret.name === 'string') {
          ret.name = {
            en: ret.name
          };
        }
        if (typeof ret.description === 'string') {
          ret.description = {
            en: ret.description
          };
        }
        return ret;
      });
    }
  };

  // /v3/timelines/:id
  svc.deleteTimeline = function (tlId) {
    return PDELETE('/v3/timelines/' + tlId).then(function (resp) {
      return resp;
    });
  };

  svc.getSingleAsset = function (assetId: string): ng.IPromise<IAsset> {
    if (assetId) {
      return GET('/v1/assets/' + assetId);
    } else {
      return $q(function (resolve) {
        resolve(undefined);
      });
    }
  };

  // Gets all layouts, styles, and templates
  var gettingCommon = false;
  var getCommonDefer = $q.defer();
  var getCommon = function () {
    // console.log("dataSvc.getCommon");
    if (gettingCommon) {
      return getCommonDefer.promise;

    } else {
      gettingCommon = true;
      $q.all([
        $http.get(config.apiDataBaseUrl + '/v1/templates'),
        $http.get(config.apiDataBaseUrl + '/v1/layouts'),
        $http.get(config.apiDataBaseUrl + '/v1/styles')
      ])
        .then(function (responses) {
          svc.cache('templates', responses[0].data);
          svc.cache('layouts', responses[1].data);
          svc.cache('styles', responses[2].data);

          gettingCommon = true;
          getCommonDefer.resolve();
        }, function () {
          // console.error("getCommon failed", failure);
          gettingCommon = false;
          getCommonDefer.reject();
        });
    }
    return getCommonDefer.promise;
  };

  svc.getCommon = getCommon; // TEMPORARY for ittContainer, so it can get the scene template ID.  After template refactor none of this id stuff will be necessary
  svc.cache = function (cacheType, dataList) {
    // console.log("dataSvc.cache", cacheType, dataList);
    angular.forEach(dataList, function (item) {
      if (cacheType === 'templates') {
        /* API format:
         _id									"528d17ebba4f65e578000007"
         applies_to_episodes	false  (if true, event_types is empty)
         created_at					"2013-11-20T20:13:31Z"
         event_types					["Scene"]    (or Annotation, Link, Upload)
         name								"Scene 2 columns right"
         updated_at					"2013-11-20T20:13:31Z"
         url									"templates/scene-centered.html"
         type: string
         */
        if (item.applies_to_episodes) {
          modelSvc.dataCache.template[item._id] = createInstance('EpisodeTemplate', {
            id: item._id,
            url: item.url,
            type: 'Episode',
            displayName: item.name,
            customer_ids: item.customer_ids,
            css_configuration: item.css_configuration,
            fonts: item.fonts,
            pro_episode_template: item.pro_episode_template
          });
        } else if (item.event_types && item.event_types && item.event_types[0] === 'Scene') {
          modelSvc.dataCache.template[item._id] = createInstance('LayoutTemplate', {
            id: item._id,
            url: item.url,
            type: 'Scene',
            displayName: item.name,
            component_name: item.component_name
          });
        } else {
          modelSvc.dataCache.template[item._id] = createInstance('ItemTemplate', {
            id: item._id,
            url: item.url,
            type: item.event_types && item.event_types[0],
            displayName: item.name,
            component_name: item.component_name
          });
        }
        // console.log('template?', dataCache.template[item._id]);
      } else if (cacheType === 'layouts') {
        /* API format:
         _id									"528d17ebba4f65e57800000a"
         created_at					"2013-11-20T20:13:31Z"
         css_name						"videoLeft"
         description					"The video is on the left"
         display_name				"Video Left"
         updated_at					"2013-11-20T20:13:31Z"
         */
        modelSvc.dataCache.layout[item._id] = createInstance('Layout', {
          id: item._id,
          css_name: item.css_name,
          displayName: item.display_name
        });

      } else if (cacheType === 'styles') {
        /* API format:
         _id						"528d17f1ba4f65e578000036"
         created_at		"2013-11-20T20:13:37Z"
         css_name			"typographySerif"
         description		"Controls the fonts and relative text sizes"
         display_name	"Typography Serif"
         updated_at		"2013-11-20T20:13:37Z"
         */
        modelSvc.dataCache.style[item._id] = createInstance('Style', {
          id: item._id,
          css_name: item.css_name,
          displayName: item.display_name
        });
      }
    });
  };

  // TODO more template management: add/delete/edit
  svc.createTemplate = function (templateData) {
    // TEMPORARY.  Doesn't check to see if it's adding a duplicate, or do any other sort of data prophylaxis
    /*  sample:
     {
     url: 'templates/item/foo.html',
     name: 'foo',
     event_types: ['Upload'], // Upload, Scene, Plugin, Annotation, Link
     applies_to_episode: false,
     applies_to_narrative: false
     }
     */
    return POST('/v1/templates', templateData);
  };
  // svc.createStyle = function (styleData) {
  // 	// ALSO TEMPORARY, UNSAFE
  // 	return POST("/v1/styles", styleData);
  // };

  // transform API common IDs into real values
  svc.resolveIDs = function (obj) {
    // console.log("resolving IDs", obj);
    if (obj.layout_id) {
      var layouts = [];
      if (obj.type === 'Scene') {
        layouts = ['', ''];
      }
      angular.forEach(obj.layout_id, function (id) {
        if (modelSvc.dataCache.layout[id]) {
          if (obj.type === 'Scene') {
            //conditions outside of 'showCurrent' necessary for USC scholar
            if (modelSvc.dataCache.layout[id].css_name === 'showCurrent') {
              layouts[1] = modelSvc.dataCache.layout[id].css_name;
            } else if (modelSvc.dataCache.layout[id].css_name === 'splitRequired') {
              layouts[2] = modelSvc.dataCache.layout[id].css_name;
            } else {
              layouts[0] = modelSvc.dataCache.layout[id].css_name;
            }
          } else {
            layouts.push(modelSvc.dataCache.layout[id].css_name);
          }
        } else {
          errorSvc.error({
            data: 'Couldn\'t get layout for id ' + id
          });
        }
      });
      if (layouts.length > 0) {
        obj.layouts = layouts;
      }
      //delete obj.layout_id;
    }
    if (obj.style_id) {
      var styles = [];
      angular.forEach(obj.style_id, function (id) {
        if (modelSvc.dataCache.style[id]) {
          styles.push(modelSvc.dataCache.style[id].css_name);
        } else {
          errorSvc.error({
            data: 'Couldn\'t get style for id ' + id
          });
        }
      });
      if (styles.length > 0) {
        obj.styles = styles;
      }
      //delete obj.style_id;
    }
    return obj;
  };

  var getAssetIdFromEvent = function (event) {
    if (event.hasOwnProperty('asset_id')) {
      if (event.asset_id) {
        return event.asset_id;
      }
    }
    if (event.hasOwnProperty('annotation_image_id')) {
      if (event.annotation_image_id) {
        return event.annotation_image_id;
      }
    }
    if (event.hasOwnProperty('link_image_id')) {
      if (event.link_image_id) {
        return event.link_image_id;
      }
    }
    if (event.hasOwnProperty('avatar_id')) {
      if (event.avatar_id) {
        return event.avatar_id;
      }
    }
  };

  var getAssetIdsFromEvents = function (events) {
    //asset_id,
    //annotation_image_id
    //link_image_id
    var idsobject = {}; //object is way faster to prevent duplicates
    for (var i = 0, length = events.length; i < length; i++) {
      var id = getAssetIdFromEvent(events[i]);
      if (id) {
        if (!(id in idsobject)) {
          idsobject[id] = 0;
        }
      }
    }
    //now make an array instead of an object
    var ids = Object.keys(idsobject);
    return ids;
  };

  svc.getAssetsByAssetIds = getAssetsByAssetIds;
  function getAssetsByAssetIds(assetIds: string[]): ng.IPromise<IAsset[]> {
    const assetIdsObj = Object.create(null);
    assetIdsObj.asset_ids = assetIds;
    return SANE_POST('/v1/assets', assetIdsObj)
      .then(resp => resp.data.files);
  }

  svc.fetchAndCacheAssetsByIds = fetchAndCacheAssetsByIds;
  function fetchAndCacheAssetsByIds(assetIds: string[]): ng.IPromise<IAsset[]> {
    return getAssetsByAssetIds(assetIds)
      .then((assets: IAsset[]) => {
        assets.forEach((asset) => {
          modelSvc.cache('asset', asset);
        });
        //return cached assets
        return assetIds.reduce((asx, id) => {
            asx.push(modelSvc.assets[id]);
            return asx;
        }, []);

      });
  }

  // auth and common are already done before this is called.  Batches all necessary API calls to construct an episode
  var getEpisode = function (epId, segmentId) {
    // The url and return data differ depending on whether we're getting a (resolved) segment or a normal episode:
    // console.log("dataSvc.getEpisode");
    var url = (segmentId) ? '/v3/episode_segments/' + segmentId + '/resolve' : '/v3/episodes/' + epId;
    $http.get(config.apiDataBaseUrl + url)
      .success(function (ret) {
        var episodeData = Object.create(null);
        if (ret) {
          episodeData = (ret.episode ? ret.episode : ret); // segment has the episode data in ret.episode; that's all we care about at this point
        }
        if (episodeData.status === 'Published' || authSvc.userHasRole('admin') || authSvc.userHasRole('customer admin')) {
          const episodeTemplate = modelSvc.dataCache.template[episodeData.template_id];
          episodeData.template = episodeTemplate;
          modelSvc.cache('episode', svc.resolveIDs(episodeData));
          if (episodeTemplate) {
            episodeTheme.setTheme(episodeTemplate);
          }

          getEvents(epId, segmentId)
            .success(function (events) {
              events = events || [];
              getEventActivityDataForUser(events, 'Plugin', epId);
              angular.forEach(events, function (eventData) {
                eventData.cur_episode_id = epId; // So the player doesn't need to care whether it's a child or parent episode
                modelSvc.cache('event', svc.resolveIDs(eventData));
              });
              modelSvc.resolveEpisodeEvents(epId);
              const assetIds = getAssetIdsFromEvents(events);
              assetIds = (typeof assetIds !== 'undefined' && assetIds.length > 0) ? assetIds : [];
              // we need to also get the master asset and poster, while we are at it
              assetIds.push(episodeData.master_asset_id);
              //add template assets - more to come.

              if (episodeData.poster_frame_id) {
                assetIds.push(episodeData.poster_frame_id);
              }

              //add template assets
              // if (episodeTemplate.css_configuration) {
              //   const templateLogoImgId = episodeTemplate.css_configuration.image_logo_bottom_right_id;
              //   assetIds.push(templateLogoImgId);
              // }

              //batch get assets
              getAssetsByAssetIds(assetIds)
                .then((assets: IAsset[]) => {
                  assets.forEach((asset) => {
                    modelSvc.cache('asset', asset);
                  });
                  modelSvc.resolveEpisodeAssets(epId);
                  $rootScope.$emit('dataSvc.getEpisode.done');
                });
            })
            .error(function () {
              errorSvc.error({
                data: 'API call to get events failed.'
              });
            });

        } else {
          errorSvc.error({
            data: 'This episode has not yet been published.'
          });
        }
      })
      .error(function () {
        errorSvc.error({
          data: 'API call to /v3/episodes/' + epId + ' failed (bad episode ID?)'
        });
      });
  };

  // calls getContainer, iterates to all parents before finally resolving
  svc.getContainerAncestry = function (containerId, episodeId, defer) {
    defer = defer || $q.defer();
    svc.getContainer(containerId, episodeId)
      .then(function (id) {
        var container = modelSvc.containers[id];
        if (container.parent_id) {
          svc.getContainerAncestry(container.parent_id, episodeId, defer);
        } else {
          defer.resolve(id);
        }
      });
    return defer.promise;
  };

  //getEvents returns the data via a promise, instead of just setting modelSvc
  var getEvents = function (epId, segmentId) {
    var endpoint = (segmentId) ? '/v3/episode_segments/' + segmentId + '/events' : '/v3/episodes/' + epId + '/events';
    return $http.get(config.apiDataBaseUrl + endpoint);
  };

  var getEventActivityDataForUser = function (events, activityType, epId) {
    angular.forEach(events, function (eventData) {
      if (eventData.type === 'Plugin') {
        (function (evData) {
          questionAnswersSvc.getUserAnswer(evData._id, appState.user._id)
            .then(function (userAnswer) {

              if (userAnswer.data) {
                evData.data._plugin.hasBeenAnswered = true;
                var i = 0;
                var angularContinue = true;
                angular.forEach(evData.data._plugin.distractors, function (distractor) {
                  if (angularContinue) {
                    if (distractor.index === userAnswer.data.index) {
                      distractor.selected = true;
                      evData.data._plugin.selectedDistractor = distractor.index;
                      angularContinue = false;
                    }
                    i++;
                  }
                });
                modelSvc.cache('event', svc.resolveIDs(evData));
              } else {
                console.error('Got no user data from getUserAnswer:', userAnswer);
              }
            });
        }(eventData));
      }
    });
    modelSvc.resolveEpisodeEvents(epId);
  };

  /* ------------------------------------------------------------------------------ */

  // PRODUCER
  // a different idiom here, let's see if this is easier to conceptualize.

  // to use GET(), pass in the API endpoint, and an optional callback for post-processing of the results
  var GET = function (path, postprocessCallback?) {
    // console.log("GET", path);
    var defer = $q.defer();
    authSvc.authenticate()
      .then(function () {
        $http.get(config.apiDataBaseUrl + path)
          .then(function (response) {
            var ret = response.data;
            if (postprocessCallback) {
              ret = postprocessCallback(ret);
            }
            return defer.resolve(ret);
          });
      });
    return defer.promise;
  };

  var SANE_GET = function (path) {
    //wrapping a method in a promises that is already using functions that return promises
    //is an anti-pattern.
    //simply return this promise
    return authSvc.authenticate()
      .then(function () {
        //then return this promise
        return $http.get(config.apiDataBaseUrl + path)
          .then(function (resp) {
            //SANE_GET will resolve to this
            return resp.data;
          });
      });
  };

  var SANE_POST = function (_path, data, _config?) {
    const path = config.apiDataBaseUrl + _path;
    if (_config) {
      return $http.post(path, data, _config);
    }
    return $http.post(path, data);
  };

  var SANE_PUT = function (path, data) {
    return $http.put(config.apiDataBaseUrl + path, data);
  };

  var PUT = function (path, putData, postprocessCallback?) {
    var defer = $q.defer();
    $http({
      method: 'PUT',
      url: config.apiDataBaseUrl + path,
      data: putData
    })
      .success(function (response) {
        var ret = response;
        if (postprocessCallback) {
          ret = postprocessCallback(ret);
        }
        defer.resolve(ret);
      });
    return defer.promise;
  };

  var POST = function (path, postData, postprocessCallback?) {
    var defer = $q.defer();
    $http({
      method: 'POST',
      url: config.apiDataBaseUrl + path,
      data: postData
    })
      .success(function (response) {
        var ret = response;
        if (postprocessCallback) {
          ret = postprocessCallback(ret);
        }
        defer.resolve(ret);
      });
    return defer.promise;
  };

  var DELETE = function (path) {
    var defer = $q.defer();
    $http({
      method: 'DELETE',
      url: config.apiDataBaseUrl + path,
    })
      .success(function (data) {
        // console.log("Deleted:", data);
        return defer.resolve(data);
      });
    return defer.promise;
  };

  const PDELETE = (path: string): ng.IPromise<any> => {
    return $http({
      method: 'DELETE',
      url: config.apiDataBaseUrl + path
    }).then((resp) => {
      return resp;
    });
  };

  /*
   Circumstances in which we need containers:
   - start at root, climb down on demand
   - start at episode, need all ancestors

   loading any container should
   - cache its own (complete) data
   - cache its (incomplete) children
   load all of its ancestors if not already present (datasvc will need to keep a list of container_ids it's already requested, to avoid circular refs to modelSvc)

   */

  svc.getContainerRoot = function () {
    // This is only used by episodelist.  Loads root container, returns a list of root-level container IDs
    return GET('/v3/containers', function (containers) {
      var customerIDs = [];
      angular.forEach(containers, function (customer) {
        // cache the customer data:
        modelSvc.cache('container', customer);
        customerIDs.push(customer._id);
      });
      return customerIDs;
    });
  };

  svc.getContainer = function (id, episodeId?) {
    return GET('/v3/containers/' + id, function (containers) {
      modelSvc.cache('container', containers[0]);
      var container = modelSvc.containers[containers[0]._id];

      // Get the container' asset list:
      svc.getContainerAssets(id, episodeId);

      // Ensure container.children refers to items in modelSvc cache:
      if (container.children) {
        for (var i = 0; i < container.children.length; i++) {
          container.children[i] = modelSvc.containers[container.children[i]._id];
        }

        // QUICK HACK to get episode status for inter-episode nav; stuffing it into the container data
        // Wasteful of API calls, discards useful data
        var getSiblings = false;
        if (!episodeId) {
          getSiblings = true; // we're in a container list
        }
        // if (episodeId && modelSvc.episodes[episodeId].navigation_depth > 0) {
        // 	getSiblings = true;
        // }
        if (getSiblings) {
          angular.forEach(container.children, function (child) {
            if (child.episodes[0]) {
              svc.getEpisodeOverview(child.episodes[0])
                .then(function (overview) {
                  if (overview) {
                    child.status = overview.status;
                    child.title = overview.title; // name == container, title == episode
                    modelSvc.cache('container', child); // trigger setLang
                  } else {
                    // This shouldn't ever happen, but apparently it does.
                    // (Is this a permissions error? adding warning to help track it down)
                    console.error('Got no episode data for ', child.episodes[0]);
                  }
                });
            }
          });

        }
      }
      return containers[0]._id;
    });

  };

  svc.getContainerAssets = function (containerId, episodeId?) {
    return $http.get(config.apiDataBaseUrl + '/v1/containers/' + containerId + '/assets')
      .success(function (containerAssets) {
        modelSvc.containers[containerId].assetsHaveLoaded = true;
        angular.forEach(containerAssets.files, function (asset) {
          modelSvc.cache('asset', asset);
        });
        modelSvc.resolveEpisodeAssets(episodeId);
      });
  };

  svc.createContainer = function (container) {
    var defer = $q.defer();

    // TODO sanitize
    var newContainer = {
      container: {
        customer_id: container.customer_id,
        name: container.name,
        parent_id: container.parent_id
        // keywords: [] // for now
      }
    };
    // store in API and resolve with results instead of container

    POST('/v3/containers', newContainer)
      .then(function (data) {
        // console.log("CREATED CONTAINER", data);
        modelSvc.cache('container', data);
        const newContainer = modelSvc.containers[data._id];
        const parentId = newContainer.parent_id;

        // add it to the parent's child list (WARN I'm mucking around in modelSvc inappropriately here I think)
        // console.log(modelSvc.containers[parentId]);
        modelSvc.containers[parentId].children.push(newContainer);

        defer.resolve(newContainer);
      });
    return defer.promise;
  };

  svc.updateContainer = function (container) {
    //TODO sanitize
    var defer = $q.defer();
    if (!container._id) {
      console.error('Tried to update a container with no id', container);
      defer.reject();
    }
    PUT('/v3/containers/' + container._id, container, function (data) {
      modelSvc.cache('container', data);
      defer.resolve(data);
    });
    return defer.promise;
  };

  svc.deleteContainer = deleteContainer;
  function deleteContainer(containerId: string): ng.IPromise<any> {
    // DANGER WILL ROBINSON incomplete and unsafe.
    // only for deleting test data for now, don't expose this to the production team.
    return PDELETE('/v3/containers/' + containerId);
  }

  // Create new episodes, c.f. storeEpisode.   TODO mild cruft
  svc.createEpisode = function (episode) {

    //Default the status of the episode to 'Unpublished'
    episode.status = 'Unpublished';

    var defer = $q.defer();
    // console.log("Attempting to create ", episode);
    POST('/v3/episodes', episode)
      .then(function (data) {
        // console.log("Created episode: ", data);
        // muck around in modelSvc.containers again:
        modelSvc.containers[data.container_id].episodes = [data._id];
        modelSvc.containers[data.container_id].status = data.status;
        defer.resolve(data);
      });
    return defer.promise;
  };

  // Update existing episodes, c.f. createEpisode TODO mild cruft
  svc.storeEpisode = function (epData) {
    const preppedData = prepEpisodeForStorage(epData);
    console.log('prepped for storage:', preppedData);
    if (preppedData != null) {
      return PUT('/v3/episodes/' + preppedData._id, preppedData);
    } else {
      return $q.reject(false);
    }
  };

  svc.deleteItem = function (evtId) {
    return DELETE('/v3/events/' + evtId);
  };
  svc.createAsset = function (containerId, asset) {
    var createAssetDefer = $q.defer();

    asset.container_id = containerId;
    if (asset._id && asset._id.match(/internal/)) {
      delete asset._id;
    }

    asset = modelSvc.deriveAsset(asset);
    console.log('Attempting to create asset ', asset);
    POST('/v1/containers/' + containerId + '/assets', asset)
      .then(function (data) {
        modelSvc.containers[data.file.container_id].episodes = [data.file._id];
        modelSvc.cache('asset', data.file);
        createAssetDefer.resolve(data.file);
        //modelSvc.resolveEpisodeAssets(episodeId);
      });
    return createAssetDefer.promise;
  };

  svc.deleteAsset = function (assetId) {
    return DELETE('/v1/assets/' + assetId);
  };

  // TODO need safety checking here
  svc.storeItem = function (evt: IEvent): ng.IPromise<IEvent> {
    evt = prepItemForStorage(evt) as IEvent;
    if (!evt) {
      return $q.reject({});
    }
    if (evt && evt._id && !evt._id.match(/internal/)) {
      // update
      return PUT('/v3/events/' + evt._id, {
        event: evt
      });
    } else {
      // create
      return POST('/v3/episodes/' + evt.episode_id + '/events', {
        event: evt
      });
    }
  };

  var prepItemForStorage = function (evt): IEvent | false {
    // Events, that is
    var prepped = {};
    if (evt._id && evt._id.match(/internal/)) {
      delete evt._id;
    }

    //  The data we want to store:
    var fields = [
      '_id',
      //				"producerItemType", // Nope
      'start_time',
      'end_time',
      'episode_id',
      'chapter_marker',
      'template_id',
      'stop',
      'required',
      'cosmetic',
      'sxs', // for demos, for now
      'title',
      'url',
      'target',
      'url_status',
      'annotator',
      'annotation',
      'description',
      'data',
      'asset_id',
      'link_image_id',
      'annotation_image_id',
      'avatar_id'
    ];

    prepped.type = evt._type;
    for (var i = 0; i < fields.length; i++) {
      if (evt[fields[i]] !== undefined) {
        prepped[fields[i]] = angular.copy(evt[fields[i]]);
      }
    }

    // check that end_time is greater than start time
    if (prepped.start_time && prepped.end_time) {
      var startFloat = parseFloat(prepped.start_time);
      var endFloat = parseFloat(prepped.end_time);
      if (isNaN(startFloat) || isNaN(endFloat)) {
        errorSvc.error({
          data: 'Tried to store an invalid start_time or end_time.'
        });
        return false;
      }
      if (startFloat > endFloat) {
        errorSvc.error({
          data: 'Tried to store a start_time that is after the end_time.'
        });
        return false;
      }
    }

    // clean up multiple choice question Plugin data
    if (prepped.data) {
      delete prepped.data._plugin.selectedDistractor;
      delete prepped.data._plugin.hasBeenAnswered;
      delete prepped.data._plugin._type;
      if (prepped.data._plugin.distractors.length) {
        for (i = 0; i < prepped.data._plugin.distractors.length; i++) {
          delete prepped.data._plugin.distractors[i].selected;
        }
      }
    }

    // TODO if Credly badge events are ever authorable in producer we will have to do the same
    // filtering of user data for those here.   Let's not

    prepped.style_id = [];
    prepped.layout_id = [];

    // convert style/layout selections back into their IDs.
    // trust evt.styles[] and evt.layouts[], DO NOT use styleCss (it contains the scene and episode data too!)
    prepped.style_id = get_id_values('style', evt.styles);
    prepped.layout_id = get_id_values('layout', evt.layouts);

    if (evt._type === 'Chapter') {
      return prepped;
    }
    const template = svc.readCache('template', ('component_name' as keyof TDataCacheItem), evt.component_name);
    if (template != null) {
      prepped.template_id = template.id;
    }
    if (prepped.template_id) {
      return prepped;
    } else {
      errorSvc.error({
        data: 'Tried to store a template with no ID: ' + evt.templateUrl
      });
      return false;
    }
  };
  svc.prepItemForStorage = prepItemForStorage;

  // No, we should not be storing episodes with no master asset halfway through editing
  svc.detachMasterAsset = (epData: IEpisode): ng.IPromise<void | boolean> => {
    const preppedData = prepEpisodeForStorage(epData);
    preppedData.master_asset_id = null;
    console.log('prepped sans master_asset_id for storage:', preppedData);
    if (preppedData) {
      return PUT('/v3/episodes/' + preppedData._id, preppedData);
    } else {
      return $q.reject(false);
    }
  };
  svc.detachEventAsset = function (evt, assetId) {
    evt = prepItemForStorage(evt);
    if (!evt) {
      return false;
    }
    if (evt.asset_id === assetId) {
      evt.asset_id = null;
    }
    if (evt.link_image_id === assetId) {
      evt.link_image_id = null;
    }
    if (evt.annotation_image_id === assetId) {
      evt.annotation_image_id = null;
    }
    if (evt && evt._id && !evt._id.match(/internal/)) {
      // update
      return PUT('/v3/events/' + evt._id, {
        event: evt
      });
    } else {
      // create
      return POST('/v3/episodes/' + evt.episode_id + '/events', {
        event: evt
      });
    }
  };

  const prepEpisodeForStorage = function (epData): Partial<IEpisode> {

    if (epData._id && epData._id.match(/internal/)) {
      delete epData._id;
    }

    const fields = [
      '_id',
      'title',
      'description',
      'container_id',
      'customer_id',
      'master_asset_id',
      'poster_frame_id',
      'status',
      'languages',
      'template_id'
      // "navigation_depth"
      // (0 for no cross-episode nav, 1 for siblings only, 2 for course and session, 3 for customer/course/session)
    ];

    const prepped: Partial<IEpisode> = pick(epData, fields);
    prepped.style_id = get_id_values('style', epData.styles);

    const template = svc.readCache('template', 'id', epData.template_id) as ITemplate;
    console.log('read cache template!', template);
    if (template && template.id) {
      prepped.template_id = template.id;
      return prepped;
    } else {
      errorSvc.error({
        data: 'Tried to store a template with no ID: ' + epData.template_id
      });
      return null;
    }
  };

  // careful to only use this for guaranteed unique fields (style and layout names, basically)
  svc.readCache = readCache;
  function readCache<K extends keyof IDataCache, F extends keyof TDataCacheItem>(
    cache: K,
    field: F,
    val: TDataCacheItem[F]): TDataCacheItem {
    return modelSvc.readDataCache(cache, field, val);
  }

  if (config.debugInBrowser) {
    // console.log("DataSvc:", svc);
    console.log('DataSvc cache:', modelSvc.dataCache);
  }

  svc.getTemplates = function () {
    return Object.keys(modelSvc.dataCache.template).map(function (t) {
      return modelSvc.dataCache.template[t];
    });
  };

  svc.getEpisodeTemplatesAdmin = getEpisodeTemplatesAdmin;
  function getEpisodeTemplatesAdmin(): ITemplateSelect[] {
    if (!authSvc.userHasRole('admin')) {
      return;
    }
    return svc.getTemplates()
      .reduce(
        (ts: ITemplateSelect[], t: ITemplate) => {
          if (t instanceof IEpisodeTemplate) {
            ts.push({
              id: t.id,
              name: t.displayName,
              customer_ids: t.customer_ids
            });
          }
          return ts;
        },
        []
      );
  }

  svc.getEpisodeTemplatesByCustomerIds = getEpisodeTemplatesByCustomerIds;
  function getEpisodeTemplatesByCustomerIds(custIds: string[]): ITemplateSelect[] {
    return svc.getTemplates()
      .reduce(
        (ts: ITemplateSelect[], t: ITemplate) => {
          if (t instanceof IEpisodeTemplate) {
            const hasCustomer = intersection(custIds, t.customer_ids);
            if (hasCustomer.length > 0) {
              ts.push({
                id: t.id,
                name: t.displayName,
                customer_ids: t.customer_ids
              });
            }
          }
          return ts;
        },
        []
      );
  }

  svc.fetchTemplates = fetchTemplates;
  function fetchTemplates(): ng.IPromise<ITemplate[]> {
    return SANE_GET('/v1/templates')
      .then((templates: ITemplate[]) => svc.cache('templates', templates))
      .then(() => svc.getTemplates());
  }


  svc.getTemplate = getTemplate;
  function getTemplate(id: string): ITemplate {
    return modelSvc.dataCache.template[id];
  }

  /*
   gets ID of Style Class when given the 'css_name'. 'css_name' is a attribute on the Style Class.
   for example:
   get_id_values('style', ['cover', '']) -> ['532708d8ed245331bd000007', '52e15b47c9b715cfbb00003f']
   */
  const get_id_values = function (cache, realNames): string[] {

    // convert real styles and layouts back into id arrays. Not for templateUrls!
    const ids = [];

    angular.forEach(realNames, (realName) => {
      if (realName) {
        const cachedValue = svc.readCache(cache, ('css_name' as keyof TDataCacheItem), realName) as IStyle | ILayout;
        if (cachedValue != null) {
          ids.push(cachedValue.id);
        } else {
          errorSvc.error({
            data: 'Tried to store a ' + cache + ' with no ID: ' + realName
          });
          return false;
        }
      }
    });
    return ids;
  };

  return svc;
}
