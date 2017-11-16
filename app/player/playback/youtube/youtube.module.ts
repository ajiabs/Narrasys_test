
import youTubePlayerManager from './services/youtube-player-manager/YouTubePlayerManager.svc';
import YTScriptLoader from './services/youtube-script-loader/youtubeScriptLoader';
import youtubeUrlService from './services/youtube-url-service/youtubeUrlService';


let npYoutubeModule = angular.module('np.youtube', [])
  .factory('youTubePlayerManager', youTubePlayerManager)
  .factory('YTScriptLoader', YTScriptLoader)
  .factory('youtubeUrlService', youtubeUrlService);

export default npYoutubeModule;
