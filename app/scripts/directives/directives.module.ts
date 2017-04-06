/**
 * Created by githop on 3/30/17.
 */


import 'angular';

import autofocus from './autofocus';
import ittAnnotationField from './ittAnnotationField';
import ittAssetUploader from './ittAssetUploader';
import ittClipboard from './ittClipboard';
import ittColorSelect from './ittColorSelect';
import ittContainer from './ittContainer';
import ittContainerEpisodes from './ittContainerEpisodes'
import ittDescriptionField from './ittDescriptionField';
import ittDisplaySelect from './ittDisplaySelect';
import ittDynamicModel from './ittDynamicModel';
import ittEditPencil from './ittEditPencil';
import ittEpisode from './ittEpisode';
import ittEpisodeEditor from './ittEpisodeEditor';
import ittEpisodeList from './ittEpisodeList';
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
import ittMagnet from './ittMagnet';
import ittMagnetized from './ittMagnetized';
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
import {ittShowHideVisualOnly, visualHideAnimation} from './ittShowHideVisualOnly';
import ittSpeakerField from './ittSpeakerField';
import ittSpeakerThumbField from './ittSpeakerThumbField';
import ittTabs from './ittTabs';
import ittTab from './ittTab';
import ittTemplateSelect from './ittTemplateSelect';
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
import ittUploadTranscripts from './ittUploadTranscriptsField';
import ittUrlField from './ittUrlField';
import ittUser from './ittUser';
import ittValidAsset from './ittValidAsset';
import ittValidationTip from './ittValidationTip';
import ittValidEpisodeUrl from './ittValidEpisodeUrl';
import ittValidItemUrl from './ittValidItemUrl';
import ittValidPathslug from './ittValidPathslug';
import ittValidUrl from './ittValidUrl';
import ittVideo from './ittVideo';
import ittVideoPositionSelect from './ittVideoPositionSelect';
import ittVolumeSlider from './ittVolumeSlider';
import ittWidthWatch from './ittWidthWatch';
import nysCopyright from './nys-copyright';
import sxsAddContent from './sxsAddContent';
import sxsAnnotatorAutocomplete from './sxsAnnotatorAutocomplete';
import sxsContainerAssets from './sxsContainerAssets';
import sxsInputI18n from './sxsInputI18n';
import sxsInputTime from './sxsInputTime';

let directivesModule = angular.module('itt.directives', [])
  .directive('ittAnnotationField', ittAnnotationField)
  .directive('ittAssetUploader', ittAssetUploader)
  .directive('ittClipboard', ittClipboard)
  .directive('ittColorSelect', ittColorSelect)
  .directive('ittContainer', ittContainer)
  .directive('ittContainerEpisodes', ittContainerEpisodes)
  .directive('ittDescriptionField', ittDescriptionField)
  .directive('ittDisplaySelect', ittDisplaySelect)
  .directive('ittDynamicModel', ittDynamicModel)
  .directive('ittEditPencil', ittEditPencil)
  .directive('ittEpisode', ittEpisode)
  .directive('ittEpisodeEditor', ittEpisodeEditor)
  .directive('ittEpisodeList', ittEpisodeList)
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
  .directive('ittTemplateSelect', ittTemplateSelect)
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
  .directive('ittUploadTranscripts', ittUploadTranscripts)
  .directive('ittUrlField', ittUrlField)
  .directive('ittUser', ittUser)
  .directive('ittValidAsset', ittValidAsset)
  .directive('ittValidationTip', ittValidationTip)
  .directive('ittValidEpisodeUrl', ittValidEpisodeUrl)
  .directive('ittValidItemUrl', ittValidItemUrl)
  .directive('ittValidPathslug', ittValidPathslug)
  .directive('ittValidUrl', ittValidUrl)
  .directive('ittVideo', ittVideo)
  .directive('ittVideoPositionSelect', ittVideoPositionSelect)
  .directive('ittVolumeSlider', ittVolumeSlider)
  .directive('ittWidthWatch', ittWidthWatch)
  .directive('nysCopyright', nysCopyright)
  .directive('sxsAddContent', sxsAddContent)
  .directive('sxsAnnotatorAutocomplete', sxsAnnotatorAutocomplete)
  .directive('sxsContainerAssets', sxsContainerAssets)
  .directive('sxsInputI18n', sxsInputI18n)
  .directive('sxsInputTime', sxsInputTime)
  .directive('autofocus', autofocus);

export default directivesModule;