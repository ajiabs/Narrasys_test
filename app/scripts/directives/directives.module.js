/**
 * Created by githop on 12/12/15.
 */

import angular from 'angular';
import autofocus from './autofocus';
import ittAssetUploader from './ittAssetUploader';
import ittContainer from './ittContainer';
import ittContainerEpisodes from './ittContainerEpisodes';
import ittEpisode from './ittEpisode';
import ittEpisodeEditor from './ittEpisodeEditor';
import ittEpisodeList from './ittEpisodeList';
import ittFlotr2Chart from './ittFlotChart';
import ittIframe from './ittIframe';
import ittItem from './ittItem';
import ittItemDetailModal from './ittItemDetailModal';
import ittItemEditor from './ittItemEditor';
import ittLoading from './ittLoading';
import ittLogin from './ittLogin';
import ittMagnet from './ittMagnet';
import ittMagnetized from './ittMagnetized';
import ittMcQuestion from './ittMcQuestion';
import ittNarrative from './ittNarrative';
import ittNarrativeList from './ittNarrativeList';
import ittNarrativeTimeline from './ittNarrativeTimeline';
import ittReviewMode from './ittReviewMode';
import ittScene from './ittScene';
import ittSearchPanel from './ittSearchPanel';
import ittShowFocus from './ittShowFocus';
import ittShowHideVisualOnly from './ittShowHideVisualOnly';
import ittTab from './ittTab';
import ittTabs from './ittTabs';
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

import ittYoutube from './ittYoutubeEmbed';
import ittToolbarStory from './ittToolbarStory';

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
	.directive('ittItem', ittItem)
	.directive('ittItemDetailModal', ittItemDetailModal)
	.directive('ittItemEditor', ittItemEditor)
	.directive('ittLoading', ittLoading)
	.directive('ittLogin', ittLogin)
	.directive('ittMagnet', ittMagnet)
	.directive('ittMagnetized', ittMagnetized)
	.directive('ittMcQuestion', ittMcQuestion)
	.directive('ittNarrative', ittNarrative)
	.directive('ittNarrativeList', ittNarrativeList)
	.directive('ittNarrativeTimeline', ittNarrativeTimeline)
	.directive('ittReviewMode', ittReviewMode)
	.directive('ittScene', ittScene)
	.directive('ittSearchPanel', ittSearchPanel)
	.directive('ittShowFocus', ittShowFocus)
	.directive('ittShowHideVisualOnly', ittShowHideVisualOnly)
	.directive('ittTab', ittTab)
	.directive('ittTabs', ittTabs)
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
	.directive('ittToolbarStory', ittToolbarStory);

export default directivesModule;
