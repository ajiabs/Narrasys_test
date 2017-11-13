/**
 * Created by githop on 3/30/17.
 */

import youTubePlayerManager from './youtube/YouTubePlayerManager.svc';
import YTScriptLoader from './youtube/youtubeScriptLoader';
import youtubeUrlService from './youtube/youtubeUrlService';


let servicesModule = angular.module('itt.services', [])
  .factory('youTubePlayerManager', youTubePlayerManager)
  .factory('YTScriptLoader', YTScriptLoader)
  .factory('youtubeUrlService', youtubeUrlService);
export default servicesModule;
