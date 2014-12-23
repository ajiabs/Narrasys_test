'use strict';

angular.module('com.inthetelling.story')
	.directive('ittLogin', function ($location, $routeParams, config, authSvc, appState) {
		return {
			restrict: 'A',
			replace: false,

			link: function (scope) {

				if ($routeParams.episode) {
					authSvc.authenticate()
						.then(function () {
							var epId = $routeParams.episode;
							$location.search('episode', null);
							$location.search('nonce', null);
							$location.path('episode/' + epId);
						});
				}
				if ($routeParams.key) {
					authSvc.authenticate();
				}

				scope.appState = appState;
				scope.loginForm = {
					auth_key: '',
					password: ''
				};

				scope.apiDataBaseUrl = config.apiDataBaseUrl;

				if (authSvc.isAuthenticated() && authSvc.userHasRole('admin')) {
					// $location.path('episodes');
				}

				// for admin logins only, for now. In future maybe oauth-based login will route through here too
				scope.adminLogin = function () {
					console.log(scope.loginForm.auth_key, scope.loginForm.password);
					authSvc.adminLogin(scope.loginForm.auth_key, scope.loginForm.password).then(function () {
						$location.path('episodes');
					}, function () {
						scope.badlogin = true;
					});

				};

				scope.logout = function () {
					authSvc.logout();
				};
			}
		};

	});
