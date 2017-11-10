import { AnalyticsService } from './services/analytics/analytics.service';
import { ValidationService } from './services/validation/validation.service';
import selectService from './services/select/selectService';
import ittNarrativeTimeline from './components/narrative-timeline/ittNarrativeTimeline';
import { ittPlayerContainer } from './components/player-container/ittPlayerContainer';
import PlayerController from './components/player-container/PlayerController';
import ittSearchPanel from './components/search-panel/ittSearchPanel';
import SearchPanelController from './components/search-panel/SearchPanelController';
import { ToolbarStory } from './components/toolbar-story/ittToolbarStory';
import ittTab from './components/ittTab';
import ittTabs from './components/ittTabs';
import ittVolumeSlider from './components/ittVolumeSlider';
import ittMagnet from './directives/ittMagnet';
import ittMagnetized from './directives/ittMagnetized';
import { ittShowHideVisualOnly, visualHideAnimation } from './directives/ittShowHideVisualOnly';
import ittWidthWatch from './directives/ittWidthWatch';

const npPlayerModule = angular.module('np.player', []);

const services = [
  AnalyticsService,
  ValidationService
];

npPlayerModule
  .factory('selectService', selectService)
  .directive('ittNarrativeTimeline', ittNarrativeTimeline)
  .directive('ittPlayerContainer', ittPlayerContainer)
  .controller('PlayerController', PlayerController)
  .directive('ittSearchPanel', ittSearchPanel)
  .controller('SearchPanelController', SearchPanelController)
  .directive(ToolbarStory.Name, ToolbarStory.factory())
  .directive('ittTab', ittTab)
  .directive('ittTabs', ittTabs)
  .directive('ittVolumeSlider', ittVolumeSlider)
  .directive('ittMagnet', ittMagnet)
  .directive('ittMagnetized', ittMagnetized)
  .directive('ittShowHideVisualOnly', ittShowHideVisualOnly)
  .animation('visualHideAnimation', visualHideAnimation)
  .directive('ittWidthWatch', ittWidthWatch);

services.forEach((svc: any) => {
  npPlayerModule.service(svc.Name, svc);
});

export default npPlayerModule;
