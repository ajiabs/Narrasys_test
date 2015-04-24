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
					console.log('user', scope.user);
					scope.userHasRole = authSvc.userHasRole;

					if (!scope.inPlayer && !scope.userHasRole('guest')) {
						scope.getMyNarratives();
					}
				});
				

				scope.updateUser = function() {
					appState.user.email = appState.user.email;
					authSvc.updateUser(appState.user).then(function(data) {
						//console.log("Saved user data", data);
					});
				};
				scope.getMyNarratives = function () {
					dataSvc.getUserNarratives(scope.user._id).then(function (data) {
						// console.log("purchase", data);

						scope.myPurchases = data;

						angular.forEach(scope.myPurchases, function (purchase) {
							purchase.daysUntilExpiration = Math.floor((new Date(purchase.expiration_date) - new Date()) / 86400000);

							// get the narrative data for each purchase (this copes with multiple purchases of the same narrative)
							dataSvc.getNarrativeOverview(purchase.narrative_id).then(function (nData) {
								angular.forEach(scope.myPurchases, function (pur) {
									if (pur.narrative_id === nData._id) {
										pur.narrativeData = nData;
									}
								});
							});
						});

					});
				};

			}
		};
	});
