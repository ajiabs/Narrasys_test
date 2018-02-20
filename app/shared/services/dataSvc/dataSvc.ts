// @npUpgrade-shared-false
// TODO: load and resolve categories

// ** Updated by Curve10 (JAB/EDD)
//    Feb 2018 
//


import {
  createInstance, IAsset, IEpisode, IEpisodeTemplate, IEvent,  ILayout,  IStyle,
  ITemplate
} from '../../../models';
import { IEmailFields, IEpisodeTheme, Partial, IDataCache, TDataCacheItem } from '../../../interfaces';
// import { existy, intersection, pick } from '../ittUtils';
import { ittUtils } from '../ittUtils';
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
export class DataSvc implements IDataSvc {
  static Name = 'dataSvc';
  static $inject = ['$q', '$http', '$routeParams', '$rootScope', '$location', 'ittUtils', 'authSvc', 'appState', 'modelSvc', 'errorSvc', 'mockSvc', 'questionAnswersSvc', 'episodeTheme'];

  constructor (
    private $q: ng.IQService,
    private $http, 
    private $routeParams, 
    private $rootScope, 
    private $location, 
    private ittUtils, 
    private authSvc, 
    private appState, 
    private modelSvc, 
    private errorSvc, 
    private mockSvc, 
    private questionAnswersSvc, 
    private episodeTheme: IEpisodeTheme,
 
  ){}

    private getCommonDefer;  // initialized if null in getCommon()
  /* ------------------------------------------------------------------------------ */

sendSocialshareEmail = function (tlId: string, email: IEmailFields): ng.IPromise<void> {
    return this.SANE_POST(`/v3/timelines/${tlId}/share_via_email`, email);
  }

 beginBackgroundTranslations = function (episodeId) {
    return this.SANE_GET('/v3/episodes/' + episodeId + '/update_translations');
  }
  //NEED to find impl with params arg
  batchUploadTranscripts = function(episodeId, formData, params) {
    var config = {
      transformRequest: angular.identity,
      headers: {'Content-type': undefined}
    };

    if (this.ittUtils.existy(params) && Object.keys(params).length > 0) {
      Object.assign(config, {params:params});
    }

    // return $q(function(resolve){return resolve(formData)});
    return this.SANE_POST('/v3/episodes/' + episodeId + '/events/import_subtitles', formData, config);
  }

  //used in ittContainer
  generateNewNarrative = function (containerId, postData) {
    return this.SANE_POST('/v3/containers/' + containerId + '/narratives', postData)
      .then( (resp) => {
        return resp.data;
      })
      .catch( (e) =>{
        console.error('Error generating new narrative:', e);
      });
  }

  // WARN ittNarrative and ittNarrativeTimeline call dataSvc directly, bad practice. At least put modelSvc in between
  getNarrative = function (narrativeId) {
    // Special case here, since it needs to call getNonce differently:
    var defer = $q.defer();
    var cachedNarrative = this.modelSvc.narratives[narrativeId];
    var subdomain = this.ittUtils.getSubdomain(this.$location.host());
    var urlParams = '';

    if (this.ittUtils.existy(cachedNarrative) && this.ittUtils.existy(cachedNarrative.narrative_subdomain) && subdomain !== cachedNarrative.narrative_subdomain) {
      urlParams = '?customer=' + cachedNarrative.narrative_subdomain;
    }

     this.authSvc.authenticate('narrative=' + narrativeId).then( () => {
      this.$http.get(config.apiDataBaseUrl + '/v3/narratives/' + narrativeId + '/resolve' + urlParams)
        .then( (response) =>{

          response.data.timelines.sort( (a, b)  =>{
            return a.sort_order - b.sort_order;
          });
          this.modelSvc.cache('narrative', this.resolveIDs(response.data));
          defer.resolve(this.modelSvc.narratives[response.data._id]);
        });
    });
    return defer.promise;
  };

  getNarrativeOverview = function (narrativeId) {
    return this.GET('/v3/narratives/' + narrativeId);
  };

  getNarrativeExportAsSpreadsheet = function (nId) {
    var url = '/v3/narratives/' + nId + '.xlsx';
    window.open(url);
  };

 getCustomerLinkStatusReportSpreadsheet = function (customerId) {
    var url = '/v3/customers/' + customerId + '/link_status.xlsx';
    window.open(url);
  }

  private cachedPurchases = false;
  getUserNarratives = function (userId) {
    if (this.cachedPurchases) {
      var defer = this.$q.defer();
      defer.resolve(this.cachedPurchases);
      return defer.promise;
    } else {
      return this.GET('/v3/users/' + userId + '/narrative_purchases',  (data) => {
        this.cachedPurchases = data;
        return data;
      });

    }
  };

  getCustomerList = function () {
  
    return this.GET('/v3/customers/',  (customers) => {
      angular.forEach(customers,  (customer) => {
        this.modelSvc.cache('customer', customer);
      });
      return customers;
    });

  };

  getCustomer = function (customerId, retrieve) {
    if (!(this.authSvc.userHasRole('admin') || this.authSvc.userHasRole('customer admin'))) {
      return this.$q( (resolve) =>{
        resolve({});
      });
    }
    if (this.modelSvc.customers[customerId]) {

      if (retrieve) {
        return this.$q( (resolve) => {
          resolve(this.modelSvc.customers[customerId]);
        });
      }
      // have it already, or at least already getting it
    } else {


      return this.SANE_GET('/v3/customers/' + customerId)
        .then(customer => {
          this.modelSvc.cache('customer', customer); // the real thing
          return this.modelSvc.customers[customer._id];
        })
        .catch(e => console.log('wtf mate?', e));
    }
  };

  // getEpisode just needs to retrieve all episode data from the API, and pass it on
  // to modelSvc.  No promises needed, let the $digest do the work
 getEpisode = function (epId, segmentId) {
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
      this.modelSvc.cache('episode', {
      _id: epId
    }); // init with empty object to be filled by asynch process


    if (this.$routeParams.local) {
      this.mockSvc.mockEpisode(epId);
      // console.log("Got all events");
      this.$rootScope.$emit('dataSvc.getEpisode.done');
    } else {
      this.authSvc.authenticate()
        .then( () => {
          return this.getCommon();
        })
        .then( () => {
          // call the local method for returning the fully realized episode
          return this._getEpisode(epId, segmentId);
        });
    }
  };

 getEpisodeOverview = function (epId) {
    return this.GET('/v3/episodes/' + epId);
  };

  getNarrativeList= function (customer) {
    if (!this.ittUtils.existy(customer)) {
      return this.GET('/v3/narratives/');
    }


    return this.GET('/v3/narratives?customer_id=' + customer._id)
      .then( (narratives) => {
        this.modelSvc.assocNarrativesWithCustomer(customer, narratives);
      });
  };

  createUserGroup = function (groupName) {
    return this.POST('/v3/groups', {
      'group': {
        'name': groupName
      }
    });
  };

  createNarrative = function  (narrativeData) {
    return this.SANE_POST('/v3/narratives', narrativeData);
  };
  updateNarrative= function  (narrativeData) {
    return this.SANE_PUT('/v3/narratives/' + narrativeData._id, narrativeData);
  };

  createChildEpisode  (childData) {
    // console.log("about to create child epsiode", childData);
    return this.POST('/v3/episodes', {
      'episode': childData
    });
  };

  createEpisodeSegment = function  (narrativeId, segmentData) {
    return this.POST('/v3/timelines/' + narrativeId + '/episode_segments', segmentData);
  };

 storeTimeline= function (narrativeId, origTimeline) {

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
    var timeline = this.ittUtils.pick(origTimeline, permitted);

    

    if (timeline._id) {
      return this.PUT('/v3/timelines/' + timeline._id, timeline,  (ret) => {
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
      return this.POST('/v3/narratives/' + narrativeId + '/timelines', timeline,  (ret) => {
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
 deleteTimeline = function  (tlId) {
    return this.PDELETE('/v3/timelines/' + tlId).then( (resp) => {
      return resp;
    });
  };

  getSingleAsset = function (assetId: string): ng.IPromise<IAsset> {
    if (assetId) {
      return this.GET('/v1/assets/' + assetId);
    } else {
      return this.$q( (resolve) => {
        resolve(undefined);
      });
    }
  };

  // Gets all layouts, styles, and templates
  private gettingCommon = false;


  getCommon = function () {

    if( ! this.getCommonDefer) {
      // initialize before someone tries to use it!
      this.getCommonDefer = this.$q.defer();
    }



    // console.log("dataSvc.getCommon");
    if (this.gettingCommon) {
      return this.getCommonDefer.promise;

    } else {
      this.gettingCommon = true;
      this.$q.all([
        this.$http.get(config.apiDataBaseUrl + '/v1/templates'),
        this.$http.get(config.apiDataBaseUrl + '/v1/layouts'),
        this.$http.get(config.apiDataBaseUrl + '/v1/styles')
      ])
        .then( (responses) => {
          this.cache('templates', responses[0].data);
          this.cache('layouts', responses[1].data);
          this.cache('styles', responses[2].data);

          this.gettingCommon = true;
          this.getCommonDefer.resolve();
        },  () =>{
          // console.error("getCommon failed", failure);
          this.gettingCommon = false;
          this.getCommonDefer.reject();
        });
    }
    return this.getCommonDefer.promise;
  };


  cache = function (cacheType, dataList) {
    // console.log("dataSvc.cache", cacheType, dataList);
  
    angular.forEach(dataList,  (item) => {
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
          this.modelSvc.dataCache.template[item._id] = createInstance('EpisodeTemplate', {
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
          this.modelSvc.dataCache.template[item._id] = createInstance('LayoutTemplate', {
            id: item._id,
            url: item.url,
            type: 'Scene',
            displayName: item.name,
            component_name: item.component_name
          });
        } else {
          this.modelSvc.dataCache.template[item._id] = createInstance('ItemTemplate', {
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
        this.modelSvc.dataCache.layout[item._id] = createInstance('Layout', {
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
        this.modelSvc.dataCache.style[item._id] = createInstance('Style', {
          id: item._id,
          css_name: item.css_name,
          displayName: item.display_name
        });
      }
    });
  };

  // TODO more template management: add/delete/edit
  createTemplate (templateData) {
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
    return this.POST('/v1/templates', templateData);
  };
  // svc.createStyle = function (styleData) {
  // 	// ALSO TEMPORARY, UNSAFE
  // 	return POST("/v1/styles", styleData);
  // };

  // transform API common IDs into real values
 resolveIDs= function  (obj) {
    // console.log("resolving IDs", obj);

    if (obj.layout_id) {
      var layouts = [];
      if (obj.type === 'Scene') {
        layouts = ['', ''];
      }


      angular.forEach(obj.layout_id,  (id) => {
        if (this.modelSvc.dataCache.layout[id]) {
          if (obj.type === 'Scene') {
            //conditions outside of 'showCurrent' necessary for USC scholar
            if (this.modelSvc.dataCache.layout[id].css_name === 'showCurrent') {
              layouts[1] = this.modelSvc.dataCache.layout[id].css_name;
            } else if (this.modelSvc.dataCache.layout[id].css_name === 'splitRequired') {
              layouts[2] = this.modelSvc.dataCache.layout[id].css_name;
            } else {
              layouts[0] = this.modelSvc.dataCache.layout[id].css_name;
            }
          } else {
            layouts.push(this.modelSvc.dataCache.layout[id].css_name);
          }
        } else {
          this.errorSvc.error({
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
      angular.forEach(obj.style_id,  (id) =>{
        if (this.modelSvc.dataCache.style[id]) {
          styles.push(this.modelSvc.dataCache.style[id].css_name);
        } else {
          this.errorSvc.error({
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

  getAssetIdFromEvent= function (event) {
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

  getAssetIdsFromEvents = function (events) {
    //asset_id,
    //annotation_image_id
    //link_image_id
    var idsobject = {}; //object is way faster to prevent duplicates
    for (var i = 0, length = events.length; i < length; i++) {
      var id = this.getAssetIdFromEvent(events[i]);
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

  getAssetsByAssetIds = function (assetIds: string[]): ng.IPromise<IAsset[]> {
    const assetIdsObj = Object.create(null);
    assetIdsObj.asset_ids = assetIds;
    return this.SANE_POST('/v1/assets', assetIdsObj)
      .then(resp => resp.data.files);
  }

   fetchAndCacheAssetsByIds(assetIds: string[]): ng.IPromise<IAsset[]> {

    return this.getAssetsByAssetIds(assetIds)
      .then((assets: IAsset[]) => {
        assets.forEach((asset) => {
          this.modelSvc.cache('asset', asset);
        });
        //return cached assets
        return assetIds.reduce((asx, id) => {
            asx.push(this.modelSvc.assets[id]);
            return asx;
        }, []);

      });
  }

 
   // auth and common are already done before this is called.  Batches all necessary API calls to construct an episode
   private _getEpisode = function (epId, segmentId) {
    // The url and return data differ depending on whether we're getting a (resolved) segment or a normal episode:
    // console.log("dataSvc.getEpisode");
    var url = (segmentId) ? '/v3/episode_segments/' + segmentId + '/resolve' : '/v3/episodes/' + epId;
    

    this.$http.get(config.apiDataBaseUrl + url)
      .success( (ret) =>   {
        var episodeData = Object.create(null);
        if (ret) {
          episodeData = (ret.episode ? ret.episode : ret); // segment has the episode data in ret.episode; that's all we care about at this point
        }
        if (episodeData.status === 'Published' || this.authSvc.userHasRole('admin') || this.authSvc.userHasRole('customer admin')) {
          const episodeTemplate = this.modelSvc.dataCache.template[episodeData.template_id];
          episodeData.template = episodeTemplate;
          this.modelSvc.cache('episode', this.resolveIDs(episodeData));
          if (episodeTemplate) {
            this.episodeTheme.setTheme(episodeTemplate);
          }

          this.getEvents(epId, segmentId)
            .success (  (events) => {
              events = events || [];
              this.getEventActivityDataForUser(events, 'Plugin', epId);

              angular.forEach(events, (eventData) => {
                eventData.cur_episode_id = epId; // So the player doesn't need to care whether it's a child or parent episode
                this.modelSvc.cache('event', this.resolveIDs(eventData));
              });
              this.modelSvc.resolveEpisodeEvents(epId);

              const assetIds = this.getAssetIdsFromEvents(events);
              this.assetIds = (typeof assetIds !== 'undefined' && assetIds.length > 0) ? assetIds : [];
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
              this.getAssetsByAssetIds(assetIds)
                .then((assets: IAsset[]) => {
                  assets.forEach((asset) => {
                    this.modelSvc.cache('asset', asset);
                  });
                  this.modelSvc.resolveEpisodeAssets(epId);
                  this.$rootScope.$emit('dataSvc.getEpisode.done');
                });
            })
            .error( () => {
              this.errorSvc.error({
                data: 'API call to get events failed.'
              });
            });

        } else {
          this.errorSvc.error({
            data: 'This episode has not yet been published.'
          });
        }
      })
      .error( ()=> {
        this.errorSvc.error({
          data: 'API call to /v3/episodes/' + epId + ' failed (bad episode ID?)'
        });
      });
  };

  // calls getContainer, iterates to all parents before finally resolving
  getContainerAncestry = function (containerId, episodeId, defer) {
    defer = defer || this.$q.defer();

    this.getContainer(containerId, episodeId)
      .then( (id) => {
        var container = this.modelSvc.containers[id];
        if (container.parent_id) {
          this.getContainerAncestry(container.parent_id, episodeId, defer);
        } else {
          defer.resolve(id);
        }
      });
    return defer.promise;
  };

  //getEvents returns the data via a promise, instead of just setting modelSvc
  getEvents = function (epId, segmentId) {
    var endpoint = (segmentId) ? '/v3/episode_segments/' + segmentId + '/events' : '/v3/episodes/' + epId + '/events';
    return this.$http.get(config.apiDataBaseUrl + endpoint);
  };

  getEventActivityDataForUser = function (events, activityType, epId) {

    angular.forEach(events,(eventData) => {
      if (eventData.type === 'Plugin') {

        // having trouble making this into a lamda function to maintain context...
        var context = this;
        ( function (evData)  {
          context.questionAnswersSvc.getUserAnswer(evData._id, context.appState.user._id)
            .then( (userAnswer) =>{

              if (userAnswer.data) {
                evData.data._plugin.hasBeenAnswered = true;
                var i = 0;
                var angularContinue = true;
                angular.forEach(evData.data._plugin.distractors,(distractor) =>{
                  if (angularContinue) {
                    if (distractor.index === userAnswer.data.index) {
                      distractor.selected = true;
                      evData.data._plugin.selectedDistractor = distractor.index;
                      angularContinue = false;
                    }
                    i++;
                  }
                });
                context.modelSvc.cache('event', context.resolveIDs(evData));
              } else {
                console.error('Got no user data from getUserAnswer:', userAnswer);
              }
            });
        }(eventData));
      }
    });
    this.modelSvc.resolveEpisodeEvents(epId);
  };

  /* ------------------------------------------------------------------------------ */

  // PRODUCER
  // a different idiom here, let's see if this is easier to conceptualize.

  // to use GET(), pass in the API endpoint, and an optional callback for post-processing of the results
  GET  (path, postprocessCallback?) {
    // console.log("GET", path);
    var defer = this.$q.defer();

    this.authSvc.authenticate()
      .then(()  => {
        this.$http.get(config.apiDataBaseUrl + path)
          .then( (response) => {
            var ret = response.data;
            if (postprocessCallback) {
              ret = postprocessCallback(ret);
            }
            return defer.resolve(ret);
          });
      });
    return defer.promise;
  };

  SANE_GET = function  (path) {
    //wrapping a method in a promises that is already using functions that return promises
    //is an anti-pattern.
    //simply return this promise

    return this.authSvc.authenticate()
      .then(() => {
        //then return this promise
        return this.$http.get(config.apiDataBaseUrl + path)
          .then( (resp) =>{
            //SANE_GET will resolve to this
            return resp.data;
          });
      });
  };

 SANE_POST = function (_path, data, _config?) {
    const path = config.apiDataBaseUrl + _path;
    if (_config) {
      return this.$http.post(path, data, _config);
    }
    return this.$http.post(path, data);
  };

  SANE_PUT = function (path, data) {
    return this.$http.put(config.apiDataBaseUrl + path, data);
  };

  PUT = function (path, putData, postprocessCallback?) {
    var defer = this.$q.defer();
    this.$http({
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

  POST = function (path, postData, postprocessCallback?) {
    var defer = this.$q.defer();
    this.$http({
      method: 'POST',
      url: config.apiDataBaseUrl + path,
      data: postData
    })
      .success((response)  =>{
        var ret = response;
        if (postprocessCallback) {
          ret = postprocessCallback(ret);
        }
        defer.resolve(ret);
      });
    return defer.promise;
  };

  DELETE = function (path) {
    var defer = this.$q.defer();

    this.$http({
      method: 'DELETE',
      url: config.apiDataBaseUrl + path,
    })
      .success((data) => {
        // console.log("Deleted:", data);
        return defer.resolve(data);
      });
    return defer.promise;
  };

  PDELETE = (path: string): ng.IPromise<any> => {
    return this.$http({
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

  getContainerRoot = function () {
    // This is only used by episodelist.  Loads root container, returns a list of root-level container IDs

    return this.GET('/v3/containers',  (containers) => {
      var customerIDs = [];

      angular.forEach(containers, (customer) => {
        // cache the customer data:
        this.modelSvc.cache('container', customer);
        customerIDs.push(customer._id);
      });
      return customerIDs;
    });
  };

  getContainer = function (id, episodeId?) {


    return this.GET('/v3/containers/' + id, (containers) => {
      this.modelSvc.cache('container', containers[0]);
      var container = this.modelSvc.containers[containers[0]._id];

      // Get the container' asset list:
      this.getContainerAssets(id, episodeId);

      // Ensure container.children refers to items in modelSvc cache:
      if (container.children) {
        for (var i = 0; i < container.children.length; i++) {
          container.children[i] = this.modelSvc.containers[container.children[i]._id];
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

          angular.forEach(container.children,  (child) => {
            if (child.episodes[0]) {
              this.getEpisodeOverview(child.episodes[0])
                .then( (overview) => {
                  if (overview) {
                    child.status = overview.status;
                    child.title = overview.title; // name == container, title == episode
                    this.modelSvc.cache('container', child); // trigger setLang
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

  getContainerAssets = function (containerId, episodeId?) {

    return this.$http.get(config.apiDataBaseUrl + '/v1/containers/' + containerId + '/assets')
      .success( (containerAssets) => {
        this.modelSvc.containers[containerId].assetsHaveLoaded = true;
        angular.forEach(containerAssets.files,  (asset) => {
          this.modelSvc.cache('asset', asset);
        });
        this.modelSvc.resolveEpisodeAssets(episodeId);
      });
  };

createContainer = function (container) {
    var defer = this.$q.defer();

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


    this.POST('/v3/containers', newContainer)
      .then( (data) => {
        // console.log("CREATED CONTAINER", data);
        this.modelSvc.cache('container', data);
        const newContainer = this.modelSvc.containers[data._id];
        const parentId = newContainer.parent_id;

        // add it to the parent's child list (WARN I'm mucking around in modelSvc inappropriately here I think)
        // console.log(modelSvc.containers[parentId]);
        this.modelSvc.containers[parentId].children.push(newContainer);

        defer.resolve(newContainer);
      });
    return defer.promise;
  };

  updateContainer = function (container) {
    //TODO sanitize
    var defer = this.$q.defer();
    if (!container._id) {
      console.error('Tried to update a container with no id', container);
      defer.reject();
    }
    this.PUT('/v3/containers/' + container._id, container,  (data) => {
      this.modelSvc.cache('container', data);
      defer.resolve(data);
    });
    return defer.promise;
  };

deleteContainer = function(containerId: string): ng.IPromise<any> {
    // DANGER WILL ROBINSON incomplete and unsafe.
    // only for deleting test data for now, don't expose this to the production team.
    return this.PDELETE('/v3/containers/' + containerId);
  }

  // Create new episodes, c.f. storeEpisode.   TODO mild cruft
  createEpisode = function (episode) {

    //Default the status of the episode to 'Unpublished'
    episode.status = 'Unpublished';

    var defer = this.$q.defer();

    // console.log("Attempting to create ", episode);
    this.POST('/v3/episodes', episode)
      .then( (data) => {
        // console.log("Created episode: ", data);
        // muck around in modelSvc.containers again:
        this.modelSvc.containers[data.container_id].episodes = [data._id];
        this.modelSvc.containers[data.container_id].status = data.status;
        defer.resolve(data);
      });
    return defer.promise;
  };

  // Update existing episodes, c.f. createEpisode TODO mild cruft
  storeEpisode = function (epData) {
    const preppedData = this.prepEpisodeForStorage(epData);
    console.log('prepped for storage:', preppedData);
    if (preppedData != null) {
      return this.PUT('/v3/episodes/' + preppedData._id, preppedData);
    } else {
      return this.$q.reject(false);
    }
  };

  deleteItem = function (evtId) {
    return this.DELETE('/v3/events/' + evtId);
  };
  
  createAsset = function (containerId, asset) {
    var createAssetDefer = this.$q.defer();

    asset.container_id = containerId;
    if (asset._id && asset._id.match(/internal/)) {
      delete asset._id;
    }

    asset = this.modelSvc.deriveAsset(asset);
    console.log('Attempting to create asset ', asset);

    this.POST('/v1/containers/' + containerId + '/assets', asset)
      .then( (data)  => {
        this.modelSvc.containers[data.file.container_id].episodes = [data.file._id];
        this.modelSvc.cache('asset', data.file);
        createAssetDefer.resolve(data.file);
        //modelSvc.resolveEpisodeAssets(episodeId);
      });
    return createAssetDefer.promise;
  };

 deleteAsset = function (assetId) {
    return this.DELETE('/v1/assets/' + assetId);
  };

  // TODO need safety checking here
  storeItem = function (evt: IEvent): ng.IPromise<IEvent> {
    evt = this.prepItemForStorage(evt) as IEvent;
    if (!evt) {
      return this.$q.reject({});
    }
    if (evt && evt._id && !evt._id.match(/internal/)) {
      // update
      return this.PUT('/v3/events/' + evt._id, {
        event: evt
      });
    } else {
      // create
      return this.POST('/v3/episodes/' + evt.episode_id + '/events', {
        event: evt
      });
    }
  };

  prepItemForStorage = function (evt): IEvent | false {
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
        this.errorSvc.error({
          data: 'Tried to store an invalid start_time or end_time.'
        });
        return false;
      }
      if (startFloat > endFloat) {
        this.errorSvc.error({
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
    const template = this.readCache('template', ('component_name' as keyof TDataCacheItem), evt.component_name);
    if (template != null) {
      prepped.template_id = template.id;
    }
    if (prepped.template_id) {
      return prepped;
    } else {
      this.errorSvc.error({
        data: 'Tried to store a template with no ID: ' + evt.templateUrl
      });
      return false;
    }
  };

  // No, we should not be storing episodes with no master asset halfway through editing
  detachMasterAsset = (epData: IEpisode): ng.IPromise<void | boolean> => {
    const preppedData = this.prepEpisodeForStorage(epData);
    preppedData.master_asset_id = null;
    console.log('prepped sans master_asset_id for storage:', preppedData);
    if (preppedData) {
      return this.PUT('/v3/episodes/' + preppedData._id, preppedData);
    } else {
      return this.$q.reject(false);
    }
  };
  
  detachEventAsset = function (evt, assetId) {
    evt = this.prepItemForStorage(evt);
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
      return this.PUT('/v3/events/' + evt._id, {
        event: evt
      });
    } else {
      // create
      return this.POST('/v3/episodes/' + evt.episode_id + '/events', {
        event: evt
      });
    }
  };

  prepEpisodeForStorage = function (epData): Partial<IEpisode> {

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


    const prepped: Partial<IEpisode> = this.ittUtils.pick(epData, fields);
    prepped.style_id = this.get_id_values('style', epData.styles);

    const template = this.readCache('template', 'id', epData.template_id) as ITemplate;
    console.log('read cache template!', template);
    if (template && template.id) {
      prepped.template_id = template.id;
      return prepped;
    } else {
      this.errorSvc.error({
        data: 'Tried to store a template with no ID: ' + epData.template_id
      });
      return null;
    }
  };

  // careful to only use this for guaranteed unique fields (style and layout names, basically)
readCache = function<K extends keyof IDataCache, F extends keyof TDataCacheItem> (
    cache: K,
    field: F,
    val: TDataCacheItem[F]): TDataCacheItem {
    return this.modelSvc.readDataCache(cache, field, val);
  }

  /*
  if (config.debugInBrowser) {
    // console.log("DataSvc:", svc);
    console.log('DataSvc cache:', this.modelSvc.dataCache);
  }
  */

  getTemplates = function () {

    return Object.keys(this.modelSvc.dataCache.template).map( (t) => {
      return this.modelSvc.dataCache.template[t];
    });
  };

getEpisodeTemplatesAdmin = function(): ITemplateSelect[] {
    if (!this.authSvc.userHasRole('admin')) {
      return;
    }
    return this.getTemplates()
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


getEpisodeTemplatesByCustomerIds = function (custIds: string[]): ITemplateSelect[] {

  return this.getTemplates()
      .reduce(
        (ts: ITemplateSelect[], t: ITemplate) => {
          if (t instanceof IEpisodeTemplate) {
            const hasCustomer = this.ittUtils.intersection(custIds, t.customer_ids);
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

 fetchTemplates= function (): ng.IPromise<ITemplate[]> {

    return this.SANE_GET('/v1/templates')
      .then((templates: ITemplate[]) => this.cache('templates', templates))
      .then(() => this.getTemplates());
  }


getTemplate = function (id: string): ITemplate {
    return this.modelSvc.dataCache.template[id];
  }

  /*
   gets ID of Style Class when given the 'css_name'. 'css_name' is a attribute on the Style Class.
   for example:
   get_id_values('style', ['cover', '']) -> ['532708d8ed245331bd000007', '52e15b47c9b715cfbb00003f']
   */
  get_id_values = function (cache, realNames): string[] {

    // convert real styles and layouts back into id arrays. Not for templateUrls!
    const ids = [];


    angular.forEach(realNames, (realName) => {
      if (realName) {
        const cachedValue = this.readCache(cache, ('css_name' as keyof TDataCacheItem), realName) as IStyle | ILayout;
        if (cachedValue != null) {
          ids.push(cachedValue.id);
        } else {
          this.errorSvc.error({
            data: 'Tried to store a ' + cache + ' with no ID: ' + realName
          });
          return false;
        }
      }
    });
    return ids;
  };

}
