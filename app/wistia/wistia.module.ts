import { WistiaPlayerManager } from './services/wistia-player-manager/wistiaPlayerManager';
import { WistiaScriptLoader } from './services/wistia-script-loader/wistiaScriptLoader';
import { WistiaUrlService } from './services/wistia-url-service/wistiaUrlService';

// import '../playback/playback.module';

const npWistiaModule = angular.module('np.wistia', [
  // 'np.playback'
]);

const services = [
  WistiaPlayerManager,
  WistiaScriptLoader,
  WistiaUrlService
];

services.forEach((svc: any) => {
  npWistiaModule.service(svc.Name, svc);
});

export default npWistiaModule;
