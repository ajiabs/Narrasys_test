
import kalturaPlayerManager from './services/kaltura-player-manager/kalturaPlayerManager';
import kalturaScriptLoader from './services/kaltura-script-loader/kalturaScriptLoader';
import kalturaUrlService from './services/kaltura-url-service/kalturaUrlService';

const npKalturaModule = angular.module('np.kaltura', []);

npKalturaModule
  .factory('kalturaPlayerManager', kalturaPlayerManager)
  .factory('kalturaScriptLoader', kalturaScriptLoader)
  .factory('kalturaUrlService', kalturaUrlService);

export default npKalturaModule;
