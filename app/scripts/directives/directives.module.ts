/**
 * Created by githop on 12/12/15.
 */
import 'angular';
import autofocus from './autofocus';
import ittAssetUploader from './ittAssetUploader';
import ittContainer from './ittContainer';
import ittContainerEpisodes from './ittContainerEpisodes';
import ittEpisode from './ittEpisode';
import ittEpisodeEditor from './ittEpisodeEditor';
import ittEpisodeList from './ittEpisodeList';
import ittFlotr2Chart from './ittFlotChart';
import {ittIframe, ittIframeCtrl} from './ittIframe';
import ittItem from './ittItem';
import ittItemDetailModal from './ittItemDetailModal';
import ittItemEditor from './ittItemEditor';
import ittLoading from './ittLoading';
import ittLogin from './ittLogin';
import ittMagnet from './ittMagnet';
import ittMagnetized from './ittMagnetized';
import ittMcQuestion from './ittMcQuestion';
import {ittNarrative, ittNarrativeCtrl} from './ittNarrative';
import {ittNarrativeList, NarrativeListCtrl} from './ittNarrativeList';
import ittNarrativeTimeline from './ittNarrativeTimeline';
import ittReviewMode from './ittReviewMode';
import ittScene from './ittScene';
import ittSearchPanel from './ittSearchPanel';
import ittShowFocus from './ittShowFocus';
import {ittShowHideVisualOnly, customAnimation} from './ittShowHideVisualOnly';
import {ittTabs, TabsCtrl} from './ittTabs';
import ittTab from './ittTab';
import ittTimeline from './ittTimeline';
import ittUser from './ittUser';
import ittVideo from './ittVideo';
import ittVolumeSlider from './ittVolumeSlider';
import ittWidthWatch from './ittWidthWatch';
import sxsAddContent from './sxsAddContent';
import sxsAnnotatorAutocomplete from './sxsAnnotatorAutocomplete';
import sxsContainerAssets from './sxsContainerAssets';
import sxsInputI18n from './sxsInputI18n';
import sxsInputTime from './sxsInputTime';
import {ittYoutube, ittYoutubeCtrl} from './ittYoutubeEmbed';
import ittToolbarStory from './ittToolbarStory';
import ittValidItemUrl from './ittValidItemUrl'
import ittEditPencil from './ittEditPencil';
import ittModal from './ittModal';
import ittNarrativeEditor from './ittNarrativeEditor';
import ittRouteLoading from './ittRouteLoading';
import ittTimelineEditor from './ittTimelineEditor';
import ittValidUrl from './ittValidUrl';
import ittAnnotationField from './ittAnnotationField';
import ittColorSelect from './ittColorSelect';
import ittDescriptionField from './ittDescriptionField';
import ittDisplaySelect from './ittDisplaySelect';
import ittDynamicModel from './ittDynamicModel';
import ittFileField from './ittFileField';
import ittFlags from './ittFlags';
import ittHighlightSelect from './ittHighlightSelect';
import ittImageField from './ittImageField';
import ittQuestionOptions from './ittQuestionOptions';
import ittQuestionTextField from './ittQuestionTextField';
import ittQuestionTypeSelect from './ittQuestionTypeSelect';
import ittSpeakerField from './ittSpeakerField';
import ittSpeakerThumbField from './ittSpeakerThumbField';
import ittTemplateSelect from './ittTemplateSelect';
import ittTimeField from './ittTimeField';
import ittTimestampSelect from './ittTimestampSelect';
import ittTitleField from './ittTitleField';
import ittTranscriptField from './ittTranscriptField';
import ittTransitionSelect from './ittTransitionSelect';
import ittTypographySelect from './ittTypographySelect';
import ittUrlField from './ittUrlField';
import ittVideoPositionSelect from './ittVideoPositionSelect';
import ittLanguageFlags from  './ittLanguageFlags';
import ittLanguageSelect from './ittLanguageSelect';
import ittOptionsDisabled from './ittOptionsDisabled';
import ittValidAsset from './ittValidAsset';
import ittValidationTip from './ittValidationTip';


let directivesModule = angular.module('iTT.directives', [])
	.directive('autofocus', autofocus)
	.directive('ittAssetUploader', ittAssetUploader)
	.directive('ittContainer', ittContainer)
	.directive('ittContainerEpisodes', ittContainerEpisodes)
	.directive('ittEpisode', ittEpisode)
	.directive('ittEpisodeEditor', ittEpisodeEditor)
	.directive('ittEpisodeList', ittEpisodeList)
	.directive('ittFlotr2Chart', ittFlotr2Chart)
	.directive('ittIframe', ittIframe)
	.controller('ittIframeCtrl', ittIframeCtrl)
	.directive('ittItem', ittItem)
	.directive('ittItemDetailModal', ittItemDetailModal)
	.directive('ittItemEditor', ittItemEditor)
	.directive('ittLoading', ittLoading)
	.directive('ittLogin', ittLogin)
	.directive('ittMagnet', ittMagnet)
	.directive('ittMagnetized', ittMagnetized)
	.directive('ittMcQuestion', ittMcQuestion)
	.directive('ittNarrative', ittNarrative)
	.controller('ittNarrativeCtrl', ittNarrativeCtrl)
	.directive('ittNarrativeTimeline', ittNarrativeTimeline)
	.directive('ittReviewMode', ittReviewMode)
	.directive('ittScene', ittScene)
	.directive('ittSearchPanel', ittSearchPanel)
	.directive('ittShowFocus', ittShowFocus)
	.directive('ittShowHideVisualOnly', ittShowHideVisualOnly)
	.animation('.visual-hide', customAnimation)
	.directive('ittTab', ittTab)
	.directive('ittTabs', ittTabs)
	.controller('TabsCtrl', TabsCtrl)
	.directive('ittTimeline', ittTimeline)
	.directive('ittUser', ittUser)
	.directive('ittVideo', ittVideo)
	.directive('ittVolumeSlider', ittVolumeSlider)
	.directive('ittWidthWatch', ittWidthWatch)
	.directive('sxsAddContent', sxsAddContent)
	.directive('sxsAnnotatorAutocomplete', sxsAnnotatorAutocomplete)
	.directive('sxsContainerAssets', sxsContainerAssets)
	.directive('sxsInputI18n', sxsInputI18n)
	.directive('sxsInputTime', sxsInputTime)
	.directive('ittYoutube', ittYoutube)
	.controller('ittYoutubeCtrl', ittYoutubeCtrl)
	.directive('ittToolbarStory', ittToolbarStory)
	.directive('ittEditPencil', ittEditPencil)
	.directive('ittModal', ittModal)
	.directive('ittNarrativeEditor', ittNarrativeEditor)
	.directive('ittNarrativeList', ittNarrativeList)
	.controller('NarrativeListCtrl', NarrativeListCtrl)
	.directive('ittRouteLoading', ittRouteLoading)
	.directive('ittTimelineEditor', ittTimelineEditor)
	.directive('ittValidItemUrl', ittValidItemUrl)
	.directive('ittValidUrl', ittValidUrl)
	.directive('ittAnnotationField', ittAnnotationField)
	.directive('ittColorSelect', ittColorSelect)
	.directive('ittDescriptionField', ittDescriptionField)
	.directive('ittDisplaySelect', ittDisplaySelect)
	.directive('ittDynamicModel', ittDynamicModel)
	.directive('ittFileField', ittFileField)
	.directive('ittFlags', ittFlags)
	.directive('ittHighlightSelect', ittHighlightSelect)
	.directive('ittImageField', ittImageField)
	.directive('ittQuestionOptions', ittQuestionOptions)
	.directive('ittQuestionTextField', ittQuestionTextField)
	.directive('ittQuestionTypeSelect', ittQuestionTypeSelect)
	.directive('ittSpeakerField', ittSpeakerField)
	.directive('ittSpeakerThumbField', ittSpeakerThumbField)
	.directive('ittTemplateSelect', ittTemplateSelect)
	.directive('ittTimeField', ittTimeField)
	.directive('ittTimestampSelect', ittTimestampSelect)
	.directive('ittTitleField', ittTitleField)
	.directive('ittTranscriptField', ittTranscriptField)
	.directive('ittTransitionSelect', ittTransitionSelect)
	.directive('ittTypographySelect', ittTypographySelect)
	.directive('ittUrlField', ittUrlField)
	.directive('ittVideoPositionSelect', ittVideoPositionSelect)
	.directive('ittLanguageFlags', ittLanguageFlags)
	.directive('ittLanguageSelect', ittLanguageSelect)
	.directive('ittOptionsDisabled', ittOptionsDisabled)
	.directive('ittValidAsset', ittValidAsset)
	.directive('ittValidationTip', ittValidationTip);

export default directivesModule;
