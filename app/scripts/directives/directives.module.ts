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
import ittIframe from './ittIframe';
import ittItem from './ittItem';
import ittItemDetailModal from './ittItemDetailModal';
import ittItemEditor from './ittItemEditor';
import { Loading } from './ittLoading';
import ittLogin from './ittLogin';
import ittMagnet from './magnet/ittMagnet';
import ittMagnetized from './magnet/ittMagnetized';
import ittMcQuestion from './ittMcQuestion';
import { Modal } from './ittModal';
import { NarrativeDetail } from './npNarrativeDetail';
import { NarrativeEditor } from './npNarrativeEditor';
import { NarrativeList } from './npNarrativeList';
import { NarrativesContainer } from './npNarrativesContainer';
import { NarrativeContainer } from './npNarrativeContainer';
import ittNarrativeTimeline from './ittNarrativeTimeline';
import { Nav } from './ittNav';
import ittQuestionOptions from './ittQuestionOptions';
import ittQuestionTextField from './ittQuestionTextField';
import ittQuestionTypeSelect from './ittQuestionTypeSelect';
import ittReviewMode from './ittReviewMode';
import ittRouteLoading from './ittRouteLoading';
import ittScene from './ittScene';
import ittSearchPanel from './ittSearchPanel';
import { ittShowHideVisualOnly, visualHideAnimation } from './ittShowHideVisualOnly';
import ittTabs from './ittTabs';
import ittTab from './ittTab';
import ittTimeline from './ittTimeline';
import { TimelineEditor } from './npTimelineEditor';
import ittToolbarStory from './ittToolbarStory';
import { Tooltip } from './ittTooltip';
import ittUser from './ittUser';
import ittValidationTip from './ittValidationTip';
import ittVideo from './ittVideo';
import ittVolumeSlider from './ittVolumeSlider';
import ittWidthWatch from './ittWidthWatch';
import { SxsContainerAssets } from './sxsContainerAssets';
import { EnableSocialshare, IttSocialShare } from './socialshare/index';
import { Filedrop } from './ittFiledrop';
import { UploadProgress } from './ittUploadProgress';
import { ittPlayerContainer } from './ittPlayerContainer';
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
  .directive('ittIframe', ittIframe)
  .directive('ittItem', ittItem)
  .directive('ittItemDetailModal', ittItemDetailModal)
  .directive('ittItemEditor', ittItemEditor)
  .component(Loading.Name, new Loading())
  .directive('ittLogin', ittLogin)
  .directive('ittMagnet', ittMagnet)
  .directive('ittMagnetized', ittMagnetized)
  .directive('ittMcQuestion', ittMcQuestion)
  .component(Modal.Name, new Modal())
  .component(NarrativeEditor.Name, new NarrativeEditor())
  .component(NarrativeList.Name, new NarrativeList())
  .directive('ittNarrativeTimeline', ittNarrativeTimeline)
  .component(Nav.Name, new Nav())
  .directive('ittQuestionOptions', ittQuestionOptions)
  .directive('ittQuestionTextField', ittQuestionTextField)
  .directive('ittQuestionTypeSelect', ittQuestionTypeSelect)
  .directive('ittReviewMode', ittReviewMode)
  .directive('ittRouteLoading', ittRouteLoading)
  .directive('ittScene', ittScene)
  .directive('ittSearchPanel', ittSearchPanel)
  .directive('ittShowHideVisualOnly', ittShowHideVisualOnly)
  .animation('.visual-hide', visualHideAnimation)
  .directive('ittTabs', ittTabs)
  .directive('ittTab', ittTab)
  .directive('ittTimeline', ittTimeline)
  .component(TimelineEditor.Name, new TimelineEditor())
  .directive('ittToolbarStory', ittToolbarStory)
  .component(Tooltip.Name,  new Tooltip())
  .directive('ittUser', ittUser)
  .directive('ittValidationTip', ittValidationTip)
  .directive('ittVideo', ittVideo)
  .directive('ittVolumeSlider', ittVolumeSlider)
  .directive('ittWidthWatch', ittWidthWatch)
  .component(SxsContainerAssets.Name, new SxsContainerAssets())
  .component(IttSocialShare.Name, new IttSocialShare())
  .component(EnableSocialshare.Name, new EnableSocialshare())
  .component(Filedrop.Name, new Filedrop())
  .component(UploadProgress.Name, new UploadProgress())
  .directive('ittPlayerContainer', ittPlayerContainer)
  .component(NarrativeDetail.Name, new NarrativeDetail())
  .component(NarrativeContainer.Name, new NarrativeContainer())
  .component(ProjectsContainer.Name, new ProjectsContainer())
  .component(NarrativesContainer.Name, new NarrativesContainer());

export default directivesModule;
