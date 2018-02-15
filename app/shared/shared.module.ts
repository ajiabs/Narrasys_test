// ***********************************
// set of imports and service,component declarations for the shared section of code
// in process of updating to angular from angularJS
// this includes changing factories into services
//
// Updates by Curve10
//
// ***********************************************************************************

import authSvc from './services/authSvc/authSvc';
import { AppState } from './services/appState';
import { awsSvc } from './services/awsSvc';
// changed from:
// import errorSvc from './services/errorSvc';
import {ErrorSvc} from './services/errorSvc';
// changed from
// import imageResize from './/services/imageResizeSvc';
import {ImageResize} from './services/imageResizeSvc';
// changed from
import { ittUtils } from './services/ittUtils';
// import {NPUtilServices} from './services/ittUtils';

import mockSvc from './services/mockSvc';
import { UploadsService } from './services/uploadsService';
import { AssetUploader } from './components/asset-uploader/ittAssetUploader';
import { Container } from './components/container/ittContainer';
import { EpisodeList } from './components/episode-list/ittEpisodeList';
import ittUser from './components/user/ittUser';
import { ContainerEpisodes } from './components/ittContainerEpisodes';
import { EditPencil } from './components/ittEditPencil';
import { Modal } from './components/ittModal';
import { Nav } from './components/ittNav';
import ittRouteLoading from './components/ittRouteLoading';
import { Tooltip } from './components/ittTooltip';
import ittValidationTip from './components/ittValidationTip';
import ittFilesHandler from './directives/ittFilesHandler';
import ittLogin from './directives/ittLogin';
import dataSvc from './services/dataSvc/dataSvc';
import modelSvc from './services/modelSvc/modelSvc';
import { AssetsResolve } from './components/npAssetsResolve.component';
import { ErrorNotice } from './components/error-notice/npErrorNotice.component';

import './filters/filters';
import { Loading } from './components/ittLoading';
import { DynamicEventTemplate } from './directives/dynamic-event-template';
import { AuthTemplate } from './templates/auth/auth.template';
import { Error404Template } from './templates/error-404/error-404.template';
import { RootTemplate } from './templates/root/root.template';
import { SxsContainerAssets } from './components/container-assets/sxsContainerAssets';

const npSharedModule = angular.module('np.shared', [
  'np.filters'
]);

const sharedTemplates = [
  AuthTemplate,
  Error404Template,
  RootTemplate
];

sharedTemplates.forEach((t: any) => {
  npSharedModule.directive(t.Name, t.factory());
});


npSharedModule
  .service(AppState.Name, AppState)
  .service(UploadsService.Name, UploadsService)
  // was: .factory('imageResize', imageResize)
  // added as service...
  .service(ImageResize.Name, ImageResize)

  // was:  .factory('errorSvc', errorSvc)
  // added as service.

  // added as service:
 // .service(NPUtilServices.Name, NPUtilServices)

  .service( ErrorSvc.Name, ErrorSvc)
  .factory('authSvc', authSvc)
  // was .factory('awsSvc', awsSvc)
  // added as service:
  .service( awsSvc.Name, awsSvc)

  .factory('dataSvc', dataSvc)
  
  .factory('mockSvc', mockSvc)
  .factory('modelSvc', modelSvc)
    .factory('ittUtils', ittUtils)
  .component(SxsContainerAssets.Name, new SxsContainerAssets())
  .component(AssetUploader.Name, new AssetUploader())
  .component(Container.Name, new Container())
  .component(EpisodeList.Name, new EpisodeList())
  .directive('ittUser', ittUser)
  .component(ContainerEpisodes.Name, new ContainerEpisodes())
  .component(EditPencil.Name, new EditPencil())
  .component(Modal.Name, new Modal())
  .component(Nav.Name, new Nav())
  .directive('ittRouteLoading', ittRouteLoading)
  .component(Tooltip.Name, new Tooltip())
  .directive('ittValidationTip', ittValidationTip)
  .directive('ittFilesHandler', ittFilesHandler)
  .directive('ittLogin', ittLogin)
  .directive(DynamicEventTemplate.Name, DynamicEventTemplate.factory())
  .component(Loading.Name, new Loading())
  .component(AssetsResolve.Name, new AssetsResolve())
  .component(ErrorNotice.Name, new ErrorNotice());
  

export default npSharedModule;
