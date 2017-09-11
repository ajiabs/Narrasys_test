import { IAnalyticsSvc, IDataSvc, IModelSvc } from '../../interfaces';
class EpisodeController {
  static $inject = ['$scope', '$interval', 'analyticsSvc', 'modelSvc', 'appState', 'dataSvc', 'timelineSvc'];

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
      if (this.$scope.episode != null) {
        this.appState.playerTemplate = this.$scope.episode.templateUrl;
      }
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
ittEpisode.$inject = ['$timeout', 'appState'];
export default function ittEpisode($timeout, appState) {
  return {
    restrict: 'A',
    replace: true,
    template: `<span ng-include="episode.templateUrl"></span>`,
    controller: EpisodeController
  };
}
