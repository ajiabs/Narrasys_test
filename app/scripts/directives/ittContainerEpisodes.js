'use strict';
export default function ittContainerEpisodes(modelSvc, recursionHelper, appState, dataSvc) {
	'ngInject';
	return {
		restrict: 'A',
		replace: false,
		scope: {
			container: '=ittContainerEpisodes',
			forAdmin: '=forAdmin'
		},
		templateUrl: "templates/containerepisodes.html",

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
					scope.wasClicked = !scope.wasClicked;
				};
				scope.selectEpisode = function () {
					scope.$emit('episodeSelected', scope.container.episodes[0]);

				};

			});
		}
	};

}
