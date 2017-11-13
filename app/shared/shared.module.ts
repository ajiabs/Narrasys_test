import authSvc from './services/authSvc/authSvc';
import { AppState } from './services/appState';
import awsSvc from './services/awsSvc';
import config from './services/config';
import errorSvc from './services/errorSvc';
import imageResize from './services/imageResizeSvc';
import { ittUtils } from './services/ittUtils';
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
import EditController from './services/EditController';

const npSharedModule = angular.module('np.shared', []);

npSharedModule
  .service(AppState.Name, AppState)
  .service(UploadsService.Name, UploadsService)
  .factory('authSvc', authSvc)
  .factory('awsSvc', awsSvc)
  .factory('config', config)
  .factory('dataSvc', dataSvc)
  .factory('errorSvc', errorSvc)
  .factory('imageResize', imageResize)
  .factory('ittUtils', ittUtils)
  .factory('mockSvc', mockSvc)
  .factory('modelSvc', modelSvc)
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
  .component(AssetsResolve.Name, new AssetsResolve())
  .component(ErrorNotice.Name, new ErrorNotice())
  .controller('EditController', EditController);

export default npSharedModule;
