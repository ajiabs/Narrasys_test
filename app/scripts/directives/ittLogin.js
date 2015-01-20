'use strict';

angular.module('com.inthetelling.story')
	.directive('ittLogin', function ($location, $routeParams, config, authSvc, appState, errorSvc) {
		return {
			restrict: 'A',
			replace: false,

			link: function (scope) {

				scope.userHasRole = authSvc.userHasRole;

				scope.appState = appState;
				scope.loginForm = {
					auth_key: '',
					password: ''
				};

				scope.apiDataBaseUrl = config.apiDataBaseUrl;

				authSvc.authenticate().then(function () {
					errorSvc.init();
					if ($routeParams.episode) {
						var epId = $routeParams.episode;
						$location.search('episode', null);
						$location.search('nonce', null);
						$location.path('/episode/' + epId);
						// } else if (authSvc.userHasRole('admin')) {
						// $location.path('/episodes');
					} else {
						// TODO user homepage. For now:
						$location.path('/');
					}
				});

				// for admin logins only, for now. In future maybe oauth-based login will route through here too
				scope.adminLogin = function () {
					console.log(scope.loginForm.auth_key, scope.loginForm.password);
					authSvc.adminLogin(scope.loginForm.auth_key, scope.loginForm.password).then(function () {
						//$location.path('episodes');
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
