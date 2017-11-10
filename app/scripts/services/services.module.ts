/**
 * Created by githop on 3/30/17.
 */

import 'angular';

import {AppState} from './appState';
import authSvc from './authSvc/authSvc';
import awsSvc from './awsSvc';
import config from './config';
import dataSvc from './dataSvc/dataSvc';
import errorSvc from './errorSvc';
import imageResize from './imageResizeSvc;
import {ittUtils} from './ittUtils';
import mockSvc from './mockSvc';
import modelSvc from './modelSvc/modelSvc';
import questionAnswersSvc from './questionAnswersSvc';
import recursionHelper from './recursionHelper';
import timelineSvc from './timelineSvc/timelineSvc';
import youTubePlayerManager from './youtube/YouTubePlayerManager.svc';
import YTScriptLoader from './youtube/youtubeScriptLoader';
import youtubeUrlService from './youtube/youtubeUrlService';
import {
  WistiaPlayerManager,
  WistiaScriptLoader,
  WistiaUrlService
} from './wistia/index';

import {UploadsService} from './uploadsService';

let servicesModule = angular.module('itt.services', [])
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
  .factory('questionAnswersSvc', questionAnswersSvc)
  .factory('recursionHelper', recursionHelper)
  .factory('timelineSvc', timelineSvc)
  .factory('youTubePlayerManager', youTubePlayerManager)
  .factory('YTScriptLoader', YTScriptLoader)
  .factory('youtubeUrlService', youtubeUrlService)
  .service('wistiaUrlService', WistiaUrlService)
  .service('wistiaPlayerManager', WistiaPlayerManager)
  .service('wistiaScriptLoader', WistiaScriptLoader)
  .service('uploadsService', UploadsService);

export default servicesModule;
