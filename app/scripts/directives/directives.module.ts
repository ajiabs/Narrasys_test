/**
 * Created by githop on 3/30/17.
 */

import autofocus from './autofocus';
import ittAnnotationField from './ittAnnotationField';
import { AssetUploader } from './ittAssetUploader';
import ittClipboard from './ittClipboard';
import ittColorSelect from './ittColorSelect';
import ittContainer from './ittContainer';
import ittContainerEpisodes from './ittContainerEpisodes';
import ittDescriptionField from './ittDescriptionField';
import ittDisplaySelect from './ittDisplaySelect';
import ittDynamicModel from './ittDynamicModel';
import ittEditPencil from './ittEditPencil';
import ittFileField from './ittFileField';
import ittFilesHandler from './ittFilesHandler';
import ittFlags from './ittFlags';
import ittFlotr2Chart from './ittFlotChart';
import ittGuestAccessibleUrl from './ittGuestAccessibleUrl';
import ittHighlightSelect from './ittHighlightSelect';
import ittIframe from './ittIframe';
import ittImageField from './ittImageField';
import ittItem from './ittItem';
import ittItemDetailModal from './ittItemDetailModal';
import ittItemEditor from './ittItemEditor';
import ittLanguageFlags from './ittLanguageFlags';
import ittLanguageSelect from './ittLanguageSelect';
import ittLoading from './ittLoading';
import ittLogin from './ittLogin';
import ittMagnet from './magnet/ittMagnet';
import ittMagnetized from './magnet/ittMagnetized';
import ittMcQuestion from './ittMcQuestion';
import ittModal from './ittModal';
import ittNarrative from './ittNarrative';
import ittNarrativeEditor from './ittNarrativeEditor';
import ittNarrativeList from './ittNarrativeList';
import ittNarrativeTimeline from './ittNarrativeTimeline';
import ittNav from './ittNav';
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
import ittTimelineEditor from './ittTimelineEditor';
import ittTimestampSelect from './ittTimestampSelect';
import ittTitleField from './ittTitleField';
import ittToolbarStory from './ittToolbarStory';
import ittTooltip from './ittTooltip';
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
import { Copyright } from './copyright/npCopyright';
import { EpisodeFooter } from './npEpisodeFooter';

let directivesModule = angular.module('itt.directives', [])
  .directive('ittAnnotationField', ittAnnotationField)
  .component(AssetUploader.Name, new AssetUploader())
  .directive('ittClipboard', ittClipboard)
  .directive('ittColorSelect', ittColorSelect)
  .directive('ittContainer', ittContainer)
  .directive('ittContainerEpisodes', ittContainerEpisodes)
  .directive('ittDescriptionField', ittDescriptionField)
  .directive('ittDisplaySelect', ittDisplaySelect)
  .directive('ittDynamicModel', ittDynamicModel)
  .directive('ittEditPencil', ittEditPencil)
  .directive('ittFileField', ittFileField)
  .directive('ittFilesHandler', ittFilesHandler)
  .directive('ittFlags', ittFlags)
  .directive('ittFlotr2Chart', ittFlotr2Chart)
  .directive('ittGuestAccessibleUrl', ittGuestAccessibleUrl)
  .directive('ittHighlightSelect', ittHighlightSelect)
  .directive('ittIframe', ittIframe)
  .directive('ittImageField', ittImageField)
  .directive('ittItem', ittItem)
  .directive('ittItemDetailModal', ittItemDetailModal)
  .directive('ittItemEditor', ittItemEditor)
  .directive('ittLanguageFlags', ittLanguageFlags)
  .directive('ittLanguageSelect', ittLanguageSelect)
  .directive('ittLoading', ittLoading)
  .directive('ittLogin', ittLogin)
  .directive('ittMagnet', ittMagnet)
  .directive('ittMagnetized', ittMagnetized)
  .directive('ittMcQuestion', ittMcQuestion)
  .directive('ittModal', ittModal)
  .directive('ittNarrative', ittNarrative)
  .directive('ittNarrativeEditor', ittNarrativeEditor)
  .directive('ittNarrativeList', ittNarrativeList)
  .directive('ittNarrativeTimeline', ittNarrativeTimeline)
  .directive('ittNav', ittNav)
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
  .directive('ittTimelineEditor', ittTimelineEditor)
  .directive('ittTimestampSelect', ittTimestampSelect)
  .directive('ittTitleField', ittTitleField)
  .directive('ittToolbarStory', ittToolbarStory)
  .directive('ittTooltip', ittTooltip)
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
  .component(Copyright.Name, new Copyright())
  .component(EpisodeFooter.Name, new EpisodeFooter());

export default directivesModule;
