import ittVideo from './components/video/ittVideo';
import playbackService from './services/playback-service/playbackService';
import playerManagerCommons from './services/player-manager-commons/playerManagerCommons';
import urlService from './services/url-service/urlService';

const npPlaybackModule = angular.module('np.playback', []);

npPlaybackModule
  .directive('ittVideo', ittVideo)
  .factory('playbackService', playbackService)
  .factory('playerManagerCommons', playerManagerCommons)
  .factory('urlService', urlService);

export default npPlaybackModule;
