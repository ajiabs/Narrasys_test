'use strict';

angular.module('com.inthetelling.story')
	.directive('ittNarrativeList', function (dataSvc, authSvc, $routeParams) {
		return {
			restrict: 'A',
			replace: true,
			templateUrl: 'templates/narrativelist.html',

			link: function (scope) {
				authSvc.authenticate().then(function () {
					scope.userIsAdmin = authSvc.userHasRole('admin');
					if ($routeParams.admin) {
						scope.showAddNarrative = true;
					}
				});

				dataSvc.getNarrativeList().then(function (narratives) {
					scope.narratives = narratives;
				});
			}
		};
	});
