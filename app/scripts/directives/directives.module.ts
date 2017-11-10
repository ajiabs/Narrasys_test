/**
 * Created by githop on 3/30/17.
 */

import { AssetUploader } from './ittAssetUploader';
import { Clipboard } from './ittClipboard';
import { Container } from './ittContainer';
import { ContainerEpisodes } from './ittContainerEpisodes';
import { EditPencil } from './ittEditPencil';
import ittFilesHandler from './ittFilesHandler';
import ittFlotr2Chart from './ittFlotChart';
import { GuestAccessibleUrl } from './guest-accessible-url/npGuestAccessibleUrl';
import { Loading } from './ittLoading';
import ittLogin from './ittLogin';
import ittMcQuestion from './ittMcQuestion';
import { Modal } from './ittModal';
import { NarrativeDetail } from './npNarrativeDetail';
import { NarrativeEditor } from './npNarrativeEditor';
import { NarrativeList } from './npNarrativeList';
import { NarrativesContainer } from './npNarrativesContainer';
import { NarrativeContainer } from './npNarrativeContainer';
import { Nav } from './ittNav';
import ittQuestionOptions from './ittQuestionOptions';
import ittQuestionTextField from './ittQuestionTextField';
import ittQuestionTypeSelect from './ittQuestionTypeSelect';
import ittReviewMode from './ittReviewMode';
import ittRouteLoading from './ittRouteLoading';
import ittScene from './ittScene';
// import { ittShowHideVisualOnly, visualHideAnimation } from './ittShowHideVisualOnly';
import ittTimeline from './ittTimeline';
import { TimelineEditor } from './npTimelineEditor';
import { Tooltip } from './ittTooltip';
import ittUser from './ittUser';
import ittValidationTip from './ittValidationTip';
import { SxsContainerAssets } from './sxsContainerAssets';
import { EnableSocialshare, IttSocialShare } from './socialshare/index';
import { Filedrop } from './ittFiledrop';
import { UploadProgress } from './ittUploadProgress';
import { ProjectsContainer } from './npProjectsContainer';

const directivesModule = angular.module('itt.directives', [])
  .component(AssetUploader.Name, new AssetUploader())
  .component(Clipboard.Name, new Clipboard())
  .component(Container.Name, new Container())
  .component(ContainerEpisodes.Name,  new ContainerEpisodes())
  .component(EditPencil.Name, new EditPencil())
  .directive('ittFilesHandler', ittFilesHandler)
  .directive('ittFlotr2Chart', ittFlotr2Chart)
  .component(GuestAccessibleUrl.Name, new GuestAccessibleUrl())
  .component(Loading.Name, new Loading())
  .directive('ittLogin', ittLogin)
  .directive('ittMcQuestion', ittMcQuestion)
  .component(Modal.Name, new Modal())
  .component(NarrativeEditor.Name, new NarrativeEditor())
  .component(NarrativeList.Name, new NarrativeList())
  .component(Nav.Name, new Nav())
  .directive('ittQuestionOptions', ittQuestionOptions)
  .directive('ittQuestionTextField', ittQuestionTextField)
  .directive('ittQuestionTypeSelect', ittQuestionTypeSelect)
  .directive('ittReviewMode', ittReviewMode)
  .directive('ittRouteLoading', ittRouteLoading)
  .directive('ittScene', ittScene)
  // .directive('ittShowHideVisualOnly', ittShowHideVisualOnly)
  // .animation('.visual-hide', visualHideAnimation)
  .directive('ittTimeline', ittTimeline)
  .component(TimelineEditor.Name, new TimelineEditor())
  .component(Tooltip.Name,  new Tooltip())
  .directive('ittUser', ittUser)
  .directive('ittValidationTip', ittValidationTip)
  .component(SxsContainerAssets.Name, new SxsContainerAssets())
  .component(IttSocialShare.Name, new IttSocialShare())
  .component(EnableSocialshare.Name, new EnableSocialshare())
  .component(Filedrop.Name, new Filedrop())
  .component(UploadProgress.Name, new UploadProgress())
  .component(NarrativeDetail.Name, new NarrativeDetail())
  .component(NarrativeContainer.Name, new NarrativeContainer())
  .component(ProjectsContainer.Name, new ProjectsContainer())
  .component(NarrativesContainer.Name, new NarrativesContainer());

export default directivesModule;
