/**
 * Created by githop on 3/30/17.
 */

import 'angular';

import timelineSvc from './timelineSvc/timelineSvc';
import youTubePlayerManager from './youtube/YouTubePlayerManager.svc';
import YTScriptLoader from './youtube/youtubeScriptLoader';
import youtubeUrlService from './youtube/youtubeUrlService';
import {
  WistiaPlayerManager,
  WistiaScriptLoader,
  WistiaUrlService
} from './wistia/index';


let servicesModule = angular.module('itt.services', [])
  .factory('timelineSvc', timelineSvc)
  .factory('youTubePlayerManager', youTubePlayerManager)
  .factory('YTScriptLoader', YTScriptLoader)
  .factory('youtubeUrlService', youtubeUrlService)
  .service('wistiaUrlService', WistiaUrlService)
  .service('wistiaPlayerManager', WistiaPlayerManager)
  .service('wistiaScriptLoader', WistiaScriptLoader);

export default servicesModule;
