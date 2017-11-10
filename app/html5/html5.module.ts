import html5PlayerManager from './services/html5-player-manager/html5PlayerManager.service';
import html5UrlService from './services/html5-url-service/html5UrlService';

const npHtml5Module = angular.module('np.html5', []);

npHtml5Module
  .factory('html5UrlService', html5UrlService)
  .factory('html5PlayerManager', html5PlayerManager);


export default npHtml5Module;
