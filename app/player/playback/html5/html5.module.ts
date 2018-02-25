import { Html5PlayerManager } from './services/html5-player-manager/html5PlayerManager.service';
import { Html5UrlService } from './services/html5-url-service/html5UrlService';


const npHtml5Module = angular.module('np.html5', [
]);

npHtml5Module
  // .factory('html5UrlService', html5UrlService)
  // .factory('html5PlayerManager', html5PlayerManager);
  .service(Html5PlayerManager.Name, Html5PlayerManager)
  .service(Html5UrlService.Name, Html5UrlService);

export default npHtml5Module;
