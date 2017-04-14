ittContainerEpisodes.$inject = ['modelSvc', 'recursionHelper', 'appState', 'dataSvc'];

export default function ittContainerEpisodes(modelSvc, recursionHelper, appState, dataSvc) {
  return {
    restrict: 'A',
    replace: false,
    scope: {
      container: '=ittContainerEpisodes',
      forAdmin: '=forAdmin',
      onNodeClick: '&',
      rootContext: '='
    },
    templateUrl: "templates/containerepisodes.html",
    controller: ['$scope', function ($scope) {

      $scope.selectEpisode = function (e) {
        $scope.onNodeClick({node: e});
        console.log('ctrl select epi', e);
        // $scope.emit('episodeSelected', e);
      };
    }],

    compile: function (element) {
      // Use the compile function from the recursionHelper,
      // And return the linking function(s) which it returns
      return recursionHelper.compile(element, function (scope) {

        scope.containers = modelSvc.containers;
        scope.crossEpisodePath = appState.crossEpisodePath;
        scope.episodeId = appState.episodeId;

        scope.loadChildren = function () {
          if (modelSvc.containers[scope.container._id].haveNotLoadedChildData) {
            dataSvc.getContainer(scope.container._id);
          }
        };
        scope.toggle = function () {
          scope.container.wasClicked = !scope.container.wasClicked;
        };
        // scope.selectEpisode = function (e) {
        // 	// console.log(scope.container.episodes[0]);
        // 	// console.log('hmm', scope.onChoice);
        // 	scope.$emit('episodeSelected', e);
        // };

      });
    }
  };

}
