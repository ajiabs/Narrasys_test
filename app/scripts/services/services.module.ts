/**
 * Created by githop on 3/30/17.
 */

// import analyticsSvc from './analyticsSvc';
import {AppState} from './appState';
import authSvc from './authSvc';
import awsSvc from './awsSvc';
import config from './config';
import dataSvc from './dataSvc';
import errorSvc from './errorSvc';
import imageResize from './imageResizeSvc';
import {ittUtils} from './ittUtils';
import mockSvc from './mockSvc';
import modelSvc from './modelSvc';
import playbackService from './playbackService';
import questionAnswersSvc from './questionAnswersSvc';
import recursionHelper from './recursionHelper';
import selectService from './selectService';
import timelineSvc from './timelineSvc';
import urlService from './urlService';
import playerManagerCommons from './basePlayerManager/playerManagerCommons';
import html5PlayerManager from './html5/html5PlayerManager.svc';
import html5UrlService from './html5/html5UrlService';
import kalturaPlayerManager from './kaltura/kalturaPlayerManager';
import kalturaScriptLoader from './kaltura/kalturaScriptLoader';
import kalturaUrlService from './kaltura/kalturaUrlService';
import youTubePlayerManager from './youtube/YouTubePlayerManager.svc';
import YTScriptLoader from './youtube/youtubeScriptLoader';
import youtubeUrlService from './youtube/youtubeUrlService';
import {ValidationService} from './validation.svc';
import {UploadsService} from './uploadsService';
import {AnalyticsSvc} from './analyticsSvc';

const servicesModule = angular.module('itt.services', [])
  .service('appState', AppState)
  .factory('authSvc', authSvc)
  .factory('awsSvc', awsSvc)
  .factory('config', config)
  .factory('dataSvc', dataSvc)
  .factory('errorSvc', errorSvc)
  .factory('imageResize', imageResize)
  .factory('ittUtils', ittUtils)
  .factory('mockSvc', mockSvc)
  .factory('modelSvc', modelSvc)
  .factory('playbackService', playbackService)
  .factory('questionAnswersSvc', questionAnswersSvc)
  .factory('recursionHelper', recursionHelper)
  .factory('selectService', selectService)
  .factory('timelineSvc', timelineSvc)
  .factory('urlService', urlService)
  .factory('playerManagerCommons', playerManagerCommons)
  .factory('html5PlayerManager', html5PlayerManager)
  .factory('html5UrlService', html5UrlService)
  .factory('kalturaPlayerManager', kalturaPlayerManager)
  .factory('kalturaScriptLoader', kalturaScriptLoader)
  .factory('kalturaUrlService', kalturaUrlService)
  .factory('youTubePlayerManager', youTubePlayerManager)
  .factory('YTScriptLoader', YTScriptLoader)
  .factory('youtubeUrlService', youtubeUrlService)
  .service('analyticsSvc', AnalyticsSvc)
  .service('validationSvc', ValidationService)
  .service('uploadsService', UploadsService);

export default servicesModule;
