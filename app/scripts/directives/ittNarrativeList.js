'use strict';

angular.module('com.inthetelling.story')
	.directive('ittNarrativeList', function (dataSvc, authSvc, $routeParams, appState) {
		return {
			restrict: 'A',
			replace: true,
			templateUrl: 'templates/narrativelist.html',

			link: function (scope) {
				authSvc.authenticate().then(function () {
					scope.userHasRole = authSvc.userHasRole;
					scope.user = appState.user;
					if ($routeParams.admin) {
						scope.showAddNarrative = true;
					}
				});

				scope.logout = authSvc.logout;

				dataSvc.getNarrativeList().then(function (narratives) {

					// BEGIN TEMP: this should only be necessary during a data migration from path to path_slug:
					angular.forEach(narratives, function (narrative) {
						if (narrative.path && !narrative.path_slug) {
							narrative.path_slug = narrative.path;
						}
					});
					// END TEMP

					scope.narratives = narratives;
				});
			}
		};
	});
