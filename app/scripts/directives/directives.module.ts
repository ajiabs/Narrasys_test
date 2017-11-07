/**
 * Created by githop on 3/30/17.
 */

import autofocus from './autofocus';
import ittAnnotationField from './ittAnnotationField';
import { AssetUploader } from './ittAssetUploader';
import { Clipboard } from './ittClipboard';
import ittColorSelect from './ittColorSelect';
import { Container } from './ittContainer';
import { ContainerEpisodes } from './ittContainerEpisodes';
import ittDescriptionField from './ittDescriptionField';
import ittDisplaySelect from './ittDisplaySelect';
import ittDynamicModel from './ittDynamicModel';
import { EditPencil } from './ittEditPencil';
import ittFileField from './ittFileField';
import ittFilesHandler from './ittFilesHandler';
import { Flags } from './ittFlags';
import ittFlotr2Chart from './ittFlotChart';
import { GuestAccessibleUrl } from './guest-accessible-url/npGuestAccessibleUrl';
import ittHighlightSelect from './ittHighlightSelect';
import ittIframe from './ittIframe';
import ittImageField from './ittImageField';
import ittItem from './ittItem';
import ittItemDetailModal from './ittItemDetailModal';
import ittItemEditor from './ittItemEditor';
import ittLanguageFlags from './ittLanguageFlags';
import ittLanguageSelect from './ittLanguageSelect';
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
import ittOptionsDisabled from './ittOptionsDisabled';
import ittQuestionOptions from './ittQuestionOptions';
import ittQuestionTextField from './ittQuestionTextField';
import ittQuestionTypeSelect from './ittQuestionTypeSelect';
import ittReviewMode from './ittReviewMode';
import ittRouteLoading from './ittRouteLoading';
import ittScene from './ittScene';
import ittSearchPanel from './ittSearchPanel';
import ittShowFocus from './ittShowFocus';
import { ittShowHideVisualOnly, visualHideAnimation } from './ittShowHideVisualOnly';
import ittSpeakerField from './ittSpeakerField';
import ittSpeakerThumbField from './ittSpeakerThumbField';
import ittTabs from './ittTabs';
import ittTab from './ittTab';
import { TemplateSelect } from './ittTemplateSelect';
import ittTimeField from './ittTimeField';
import ittTimeline from './ittTimeline';
import { TimelineEditor } from './npTimelineEditor';
import ittTimestampSelect from './ittTimestampSelect';
import ittTitleField from './ittTitleField';
import ittToolbarStory from './ittToolbarStory';
import { Tooltip } from './ittTooltip';
import ittTranscriptField from './ittTranscriptField';
import ittTransitionSelect from './ittTransitionSelect';
import ittTypographySelect from './ittTypographySelect';
import { UploadTranscripts } from './ittUploadTranscriptsField';
import { UrlField } from './npUrlField';
import ittUser from './ittUser';
import ittValidAsset from './ittValidAsset';
import ittValidationTip from './ittValidationTip';
import ittValidEpisodeUrl from './ittValidEpisodeUrl';
import ittValidPathslug from './ittValidPathslug';
import ittValidUrl from './ittValidUrl';
import ittVideo from './ittVideo';
import { VideoPositionSelect } from './ittVideoPositionSelect';
import ittVolumeSlider from './ittVolumeSlider';
import ittWidthWatch from './ittWidthWatch';
import nysCopyright from './nys-copyright';
import sxsAddContent from './sxsAddContent';
import sxsAnnotatorAutocomplete from './sxsAnnotatorAutocomplete';
import { SxsContainerAssets } from './sxsContainerAssets';
import sxsInputI18n from './sxsInputI18n';
import sxsInputTime from './sxsInputTime';
import { EnableSocialshare, IttSocialShare } from './socialshare/index';
import { Filedrop } from './ittFiledrop';
import { UploadProgress } from './ittUploadProgress';
import { ittPlayerContainer } from './ittPlayerContainer';
import { ProjectsContainer } from './npProjectsContainer';
import { Copyright } from './copyright/npCopyright';
import { EpisodeFooter } from './npEpisodeFooter';

const directivesModule = angular.module('itt.directives', [])
  .directive('ittAnnotationField', ittAnnotationField)
  .component(AssetUploader.Name, new AssetUploader())
  .component(Clipboard.Name, new Clipboard())
  .directive('ittColorSelect', ittColorSelect)
  .component(Container.Name, new Container())
  .component(ContainerEpisodes.Name,  new ContainerEpisodes())
  .directive('ittDescriptionField', ittDescriptionField)
  .directive('ittDisplaySelect', ittDisplaySelect)
  .directive('ittDynamicModel', ittDynamicModel)
  .component(EditPencil.Name, new EditPencil())
  .directive('ittFileField', ittFileField)
  .directive('ittFilesHandler', ittFilesHandler)
  .component(Flags.Name, new Flags())
  .directive('ittFlotr2Chart', ittFlotr2Chart)
  .component(GuestAccessibleUrl.Name, new GuestAccessibleUrl())
  .directive('ittHighlightSelect', ittHighlightSelect)
  .directive('ittIframe', ittIframe)
  .directive('ittImageField', ittImageField)
  .directive('ittItem', ittItem)
  .directive('ittItemDetailModal', ittItemDetailModal)
  .directive('ittItemEditor', ittItemEditor)
  .directive('ittLanguageFlags', ittLanguageFlags)
  .directive('ittLanguageSelect', ittLanguageSelect)
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
  .directive('ittOptionsDisabled', ittOptionsDisabled)
  .directive('ittQuestionOptions', ittQuestionOptions)
  .directive('ittQuestionTextField', ittQuestionTextField)
  .directive('ittQuestionTypeSelect', ittQuestionTypeSelect)
  .directive('ittReviewMode', ittReviewMode)
  .directive('ittRouteLoading', ittRouteLoading)
  .directive('ittScene', ittScene)
  .directive('ittSearchPanel', ittSearchPanel)
  .directive('ittShowFocus', ittShowFocus)
  .directive('ittShowHideVisualOnly', ittShowHideVisualOnly)
  .animation('.visual-hide', visualHideAnimation)
  .directive('ittSpeakerField', ittSpeakerField)
  .directive('ittSpeakerThumbField', ittSpeakerThumbField)
  .directive('ittTabs', ittTabs)
  .directive('ittTab', ittTab)
  .component(TemplateSelect.Name, new TemplateSelect())
  .directive('ittTimeField', ittTimeField)
  .directive('ittTimeline', ittTimeline)
  .component(TimelineEditor.Name, new TimelineEditor())
  .directive('ittTimestampSelect', ittTimestampSelect)
  .directive('ittTitleField', ittTitleField)
  .directive('ittToolbarStory', ittToolbarStory)
  .component(Tooltip.Name,  new Tooltip())
  .directive('ittTranscriptField', ittTranscriptField)
  .directive('ittTransitionSelect', ittTransitionSelect)
  .directive('ittTypographySelect', ittTypographySelect)
  .component(UploadTranscripts.Name, new UploadTranscripts())
  .component(UrlField.Name, new UrlField())
  .directive('ittUser', ittUser)
  .directive('ittValidAsset', ittValidAsset)
  .directive('ittValidationTip', ittValidationTip)
  .directive('ittValidEpisodeUrl', ittValidEpisodeUrl)
  .directive('ittValidPathslug', ittValidPathslug)
  .directive('ittValidUrl', ittValidUrl)
  .directive('ittVideo', ittVideo)
  .component(VideoPositionSelect.Name, new VideoPositionSelect())
  .directive('ittVolumeSlider', ittVolumeSlider)
  .directive('ittWidthWatch', ittWidthWatch)
  .directive('nysCopyright', nysCopyright)
  .directive('sxsAddContent', sxsAddContent)
  .directive('sxsAnnotatorAutocomplete', sxsAnnotatorAutocomplete)
  .component(SxsContainerAssets.Name, new SxsContainerAssets())
  .directive('sxsInputI18n', sxsInputI18n)
  .directive('sxsInputTime', sxsInputTime)
  .directive('autofocus', autofocus)
  .component(IttSocialShare.Name, new IttSocialShare())
  .component(EnableSocialshare.Name, new EnableSocialshare())
  .component(Filedrop.Name, new Filedrop())
  .component(UploadProgress.Name, new UploadProgress())
  .directive('ittPlayerContainer', ittPlayerContainer)
  .component(NarrativeDetail.Name, new NarrativeDetail())
  .component(NarrativeContainer.Name, new NarrativeContainer())
  .component(ProjectsContainer.Name, new ProjectsContainer())
  .component(NarrativesContainer.Name, new NarrativesContainer())
  .component(Copyright.Name, new Copyright())
  .component(EpisodeFooter.Name, new EpisodeFooter());

export default directivesModule;
