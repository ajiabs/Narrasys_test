// @npUpgrade-episode-false
import { IAnalyticsSvc, IDataSvc, IModelSvc } from '../../../interfaces';
const TEMPLATE = `
<div class="episode episode-template" ng-class="episode.templateCss" ng-hide="episodeTheme.sheetLoading">

  <div
    class="fill"
    ng-if="episode.template.css_configuration.fill_class != null"
    ng-class="episode.template.css_configuration.fill_class">
    
    <div ng-if="episode.template.css_configuration.fill_class === 'gwsb-seal'" class="fill"></div>
  </div>
  <span ng-include="'view-modes/review-mode/reviewmode.html'"></span>
  <span ng-include="'view-modes/watch-mode/watchmode.html'"></span>
  <span
    ng-class="{'colorInvert DiscoverModeOnly': episode.template.displayName === 'Middlebury'}"
    ng-repeat="scene in episode.scenes | isCurrent"
    ng-include="'view-modes/discover-mode/discovermode.html'">
  </span>
  <span ng-include="'view-modes/video/video.html'"></span>
  <span ng-include="'view-modes/windowfg/windowfg.html'"></span>
  
  <np-episode-footer template-data="episode.template"></np-episode-footer>
</div>
`;


class EpisodeController {
  static $inject = [
    '$scope',
    '$interval',
    'analyticsSvc',
    'modelSvc',
    'appState',
    'dataSvc',
    'timelineSvc'
  ];

  constructor(
    public $scope: ng.IScope,
    private $interval: ng.IIntervalService,
    private analyticsSvc: IAnalyticsSvc,
    private modelSvc: IModelSvc,
    private appState,
    private dataSvc: IDataSvc,
    private timelineSvc) { }

  $onInit() {
    // console.log('episode init!');
    // this.appState.episodeId = this.$routeParams.epId;
    this.$scope.episode = this.modelSvc.episodes[this.appState.episodeId];
    // TODO: this will break if the timeline and the episode timeline don't match.
    // TODO: check whether this gets called if multiple episodes are added to the timeline...
    // I'm thinking probably not....

    // I did something stupid here wrt scoping, apparently;
    // 'edit episode' causes this scope to refer to a copy of the data rather than back to the modelSvc cache.
    // This is an even stupider but relatively harmless HACK to keep it  pointing at the right data:
    // classic daniel ^^

    this.loadEpisodeForPlayer();

    const scopeHack = () => {
      this.$scope.episode = this.modelSvc.episodes[this.appState.episodeId];
    };

    this.$interval(scopeHack, 457);
  }

  $onDestroy() {
    this.analyticsSvc.captureEpisodeActivity('episodeUnload');
    this.analyticsSvc.stopPolling();
  }

  loadEpisodeForPlayer() {
    this.analyticsSvc.startPolling();
    this.analyticsSvc.captureEpisodeActivity('episodeLoad');
  }
}
export default function ittEpisode() {
  return {
    restrict: 'EA',
    replace: false,
    template: TEMPLATE,
    controller: EpisodeController
  };
}
