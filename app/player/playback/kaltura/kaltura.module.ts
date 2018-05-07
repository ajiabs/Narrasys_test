
import { KalturaPlayerManager } from './services/kaltura-player-manager/kalturaPlayerManager';
import { KalturaScriptLoader } from './services/kaltura-script-loader/kalturaScriptLoader';
import { KalturaUrlService } from './services/kaltura-url-service/kalturaUrlService';

const npKalturaModule = angular.module('np.kaltura', []);

npKalturaModule
  // .factory('kalturaPlayerManager', kalturaPlayerManager)
  // .factory('kalturaScriptLoader', kalturaScriptLoader)
  // .factory('kalturaUrlService', kalturaUrlService);
  .service(KalturaPlayerManager.Name, KalturaPlayerManager)
  .service(KalturaScriptLoader.Name, KalturaScriptLoader)
  .service(KalturaUrlService.Name, KalturaUrlService);


export default npKalturaModule;
