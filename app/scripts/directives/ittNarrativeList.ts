'use strict';

export default function ittNarrativeList(dataSvc, authSvc, $routeParams, appState) {
	'ngInject';
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
				scope.narratives = narratives;
			});
		}
	};
}
