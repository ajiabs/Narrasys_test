/* For now this is just a thin wrapper around the playerController */
ittNarrativeTimeline.$inject = ['$routeParams', 'dataSvc', 'appState', 'authSvc', 'errorSvc'];

export default function ittNarrativeTimeline($routeParams, dataSvc, appState, authSvc, errorSvc) {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: 'templates/player-timeline.html',

    link: function (scope) {
      appState.init();
      //        console.log('user', appState.user);
      //appState.product = "player";
      dataSvc.getNarrative($routeParams.narrativePath)
        .then(function (narrative) {
          appState.narrativeId = narrative._id;
          scope.narrative = narrative;

          var narrativeRole = authSvc.getRoleForNarrative(narrative._id);
          var defaultProduct = authSvc.getDefaultProductForRole(narrativeRole);
          let currentTl = Object.create(null);
          appState.product = defaultProduct;
          angular.forEach(narrative.timelines, function (timeline) {
            if (
              timeline._id === $routeParams.timelinePath ||
              timeline.path_slug.en === $routeParams.timelinePath
            ) {
              currentTl = timeline;
              appState.timelineId = timeline._id;
              if (timeline.episode_segments[0]) {
                appState.episodeId = timeline.episode_segments[0].episode_id;
                appState.episodeSegmentId = timeline.episode_segments[0]._id;
                scope.showPlayer = true;
              }
            }
          });

          let narrativeUrl = narrative.path_slug.en;
          let timelineUrl = currentTl.path_slug.en;
          let {narrative_subdomain:  subDomain} = narrative;
          if (narrative.enable_social_sharing === true) {

            scope.socialShareInfo = {
              subDomain,
              narrative: narrativeUrl,
              timeline: timelineUrl,
            };
          }

          if (!appState.episodeId) {
            errorSvc.error({
              data: "Sorry, no episode was found in this timeline."
            });
          }
        });

    }
  };
}
