import ittVideo from './components/video/ittVideo';
import playbackService from './services/playback-service/playbackService';
import playerManagerCommons from './services/player-manager-commons/playerManagerCommons';
import urlService from './services/url-service/urlService';

import '../html5/html5.module';
import '../youtube/youtube.module';
import '../kaltura/kaltura.module';
import '../wistia/wistia.module';

const npPlaybackModule = angular.module('np.playback', [
  'np.html5',
  'np.youtube',
  'np.kaltura',
  'np.wistia'
]);

npPlaybackModule
  .directive('ittVideo', ittVideo)
  .factory('playbackService', playbackService)
  .factory('playerManagerCommons', playerManagerCommons)
  .factory('urlService', urlService);

export default npPlaybackModule;
