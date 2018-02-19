// import timelineSvc from './services/timelineSvc/timelineSvc';
import { TimelineSvc } from './services/timelineSvc/timelineSvc';
import ittTimeline from './components/timeline/ittTimeline';
import TimelineController from './components/timeline/TimelineController';

const npTimelineModule = angular.module('np.timeline', []);

npTimelineModule
  // .factory('timelineSvc', timelineSvc)
  .service (TimelineSvc.Name, TimelineSvc)
  .directive('ittTimeline', ittTimeline)
  .controller('TimelineController', TimelineController);

export default npTimelineModule;
