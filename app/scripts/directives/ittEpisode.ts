ittEpisode.$inject = ['$interval', 'analyticsSvc', 'modelSvc', 'appState'];

export default function ittEpisode($interval, analyticsSvc, modelSvc, appState) {
  return {
    restrict: 'A',
    replace: true,
    template: '<span ng-include="episode.templateUrl"></span>',
    controller: 'EpisodeController',

    link: function (scope) {
      console.log('ittEpisode', scope);
      scope.episode = modelSvc.episodes[appState.episodeId];
      // TODO: this will break if the timeline and the episode timeline don't match.
      // TODO: check whether this gets called if multiple episodes are added to the timeline... I'm thinking probably not....
      analyticsSvc.captureEpisodeActivity("episodeLoad");

      // I did something stupid here wrt scoping, apparently; 'edit episode' causes this scope to refer to a copy of the data rather than back to the modelSvc cache.
      // This is an even stupider but relatively harmless HACK to keep it  pointing at the right data:
      var scopeHack = function () {
        scope.episode = modelSvc.episodes[appState.episodeId];
        if (scope.episode != null) { //jshint ignore:line
          appState.playerTemplate = scope.episode.templateUrl;
        }
      };
      $interval(scopeHack, 457);

    },

  };
}
