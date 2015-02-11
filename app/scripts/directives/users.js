'use strict';

angular.module('com.inthetelling.story')
	.directive('ittUser', function (appState, authSvc, dataSvc) {
		return {
			restrict: 'A',
			replace: true,
			scope: {

			},
			templateUrl: 'templates/user.html',

			link: function (scope, element, attrs) {

				scope.inPlayer = attrs.inPlayer;

				scope.loading = true;
				scope.logout = authSvc.logout;

				authSvc.authenticate().then(function () {
					scope.loading = false;
					scope.user = appState.user;
					scope.userHasRole = authSvc.userHasRole;

					scope.getMyNarratives();
				});

				scope.getMyNarratives = function () {
					dataSvc.getUserNarratives(scope.user._id).then(function (data) {
						console.log("narrs", data);

						scope.myNarratives = [];
						angular.forEach(data, function (n) {
							// Definitely a race condition here as far as sort order goes, but ¯\_(ツ)_/¯
							dataSvc.getNarrativeOverview(n.narrative_id).then(function (nData) {
								scope.myNarratives.push(nData);
							});
						});

					});
				};

			}
		};
	});
