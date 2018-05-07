
import { YouTubePlayerManager } from './services/youtube-player-manager/YouTubePlayerManager.svc';
import { YTScriptLoader } from './services/youtube-script-loader/youtubeScriptLoader';
import { YoutubeUrlService } from './services/youtube-url-service/youtubeUrlService';


let npYoutubeModule = angular.module('np.youtube', [])
  // .factory('youTubePlayerManager', youTubePlayerManager)
  // .factory('YTScriptLoader', YTScriptLoader)
  // .factory('youtubeUrlService', youtubeUrlService);
  .service(YouTubePlayerManager.Name, YouTubePlayerManager)
  .service(YTScriptLoader.Name, YTScriptLoader)
  .service(YoutubeUrlService.Name, YoutubeUrlService);


export default npYoutubeModule;
