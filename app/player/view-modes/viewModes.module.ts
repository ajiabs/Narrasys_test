
import { DiscovermodeTemplate } from './templates/discover-mode/discovermode.template';
import { ReviewmodeTemplate } from './templates/review-mode/reviewmode.template';
import { VideoTemplate } from './templates/video/video.template';
import { WatchmodeTemplate } from './templates/watch-mode/watchmode.template';
import { WindowfgTemplate } from './templates/windowfg/windowfg.template';

const npViewModesModule = angular.module('np.viewModes', []);

const templates = [
  DiscovermodeTemplate,
  ReviewmodeTemplate,
  VideoTemplate,
  WatchmodeTemplate,
  WindowfgTemplate
];

templates.forEach((t: any) => {
  npViewModesModule.directive(t.Name, t.factory());
});
