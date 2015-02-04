'use strict';
angular.module('com.inthetelling.story')
	.directive('ittContainerEpisodes', function (modelSvc, recursionHelper, appState) {
		return {
			restrict: 'A',
			replace: false,
			scope: {
				container: '=ittContainerEpisodes'
			},
			templateUrl: "templates/containerepisodes.html",

			compile: function (element) {
				// Use the compile function from the recursionHelper,
				// And return the linking function(s) which it returns
				return recursionHelper.compile(element, function (scope) {
					scope.containers = modelSvc.containers;
					scope.crossEpisodePath = appState.crossEpisodePath;
					scope.episodeId = appState.episodeId;

				});
			}
		};

	});
