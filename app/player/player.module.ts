import { AnalyticsService } from './services/analytics/analytics.service';
import { ValidationService } from './services/validation/validation.service';
import selectService from './services/select/selectService';
import { NarrativeTimelineCtrl} from './components/narrative-timeline/ittNarrativeTimeline';
import { ittPlayerContainer } from './components/player-container/ittPlayerContainer';
import PlayerController from './components/player-container/PlayerController';
import ittSearchPanel from './components/search-panel/ittSearchPanel';
import SearchPanelController from './components/search-panel/SearchPanelController';
import { ToolbarStory } from './components/toolbar-story/ittToolbarStory';
import ittTab from './components/ittTab';
import ittTabs from './components/ittTabs';
import ittVolumeSlider from './components/ittVolumeSlider';
import { Magnet } from './directives/ittMagnet';
import { Magnetized } from './directives/ittMagnetized';
import { ittShowHideVisualOnly, visualHideAnimation } from './directives/ittShowHideVisualOnly';
import ittWidthWatch from './directives/ittWidthWatch';

//text angular
import 'rangy';
import 'rangy/lib/rangy-selectionsaverestore';
import 'textAngular/dist/textAngular-sanitize.min';
import 'textAngular/dist/textAngular.min';
//
import './episode/episode.module';
import './view-modes/viewModes.module';
import './item/item.module';
import './input-fields/input-fields.module';
import './scenes/scenes.module';
import './timeline/timeline.module';
import './playback/playback.module';
import './question/question.module';

const npPlayerModule = angular.module('np.player', [
  'textAngular',
  'ngSanitize',
  'np.episode',
  'np.viewModes',
  'np.item',
  'np.inputFields',
  'np.scenes',
  'np.timeline',
  'np.playback',
  'np.question'
]);

const services = [
  AnalyticsService,
  ValidationService
];

npPlayerModule
  .factory('selectService', selectService)
  .directive( NarrativeTimelineCtrl.Name ,  NarrativeTimelineCtrl.factory()/* ittNarrativeTimeline */)
  .directive('ittPlayerContainer', ittPlayerContainer)
  .controller('PlayerController', PlayerController)
  .directive('ittSearchPanel', ittSearchPanel)
  .controller('SearchPanelController', SearchPanelController)
  .directive(ToolbarStory.Name, ToolbarStory.factory())
  .directive('ittTab', ittTab)
  .directive('ittTabs', ittTabs)
  .directive('ittVolumeSlider', ittVolumeSlider)
  .directive(Magnet.Name, Magnet.factory())
  .directive(Magnetized.Name, Magnetized.factory())
  .directive('ittShowHideVisualOnly', ittShowHideVisualOnly)
  .animation('.visualHideAnimation', visualHideAnimation)
  .directive('ittWidthWatch', ittWidthWatch);

services.forEach((svc: any) => {
  npPlayerModule.service(svc.Name, svc);
});

npPlayerModule
  .config(['$provide', textAngularConfig]); // Configuration for textAngular toolbar

function textAngularConfig($provide) {
  $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function (taRegisterTool, taOptions) { // $delegate is the taOptions we are decorating
    taOptions.defaultFileDropHandler = function (a, b) {
    }; //jshint ignore:line
    taOptions.toolbar = [
      ['h1', 'h2', 'h3'],
      ['bold', 'italics', 'underline', 'strikeThrough'],
      ['ul', 'ol'],
      ['undo', 'redo', 'clear']
      // ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
      // ['justifyLeft','justifyCenter','justifyRight','indent','outdent'],
      // ['html', 'insertImage', 'insertLink', 'insertVideo', 'wordcount', 'charcount']
    ];
    return taOptions;
  }]);
}

export default npPlayerModule;
