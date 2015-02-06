'use strict';

/* 
No UI for this directive. This originally showed a login form but that led to a flash-of-content when authenticating via lti

*/
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
					if ($routeParams.key) {
						// (Probably unnecessary here, but testing to see if this fixes the unintended redirect from /#/auth)
						$location.search('key', null); // hide the param from the url.  reloadOnSearch must be turned off in $routeProvider!
					}
					if ($routeParams.episode) {
						var epId = $routeParams.episode;
						$location.search('episode', null);
						$location.search('nonce', null);
						$location.path('/episode/' + epId);
					} else {
						// Don't redirect by default, as it breaks LTI login.  
						// TODO investigate why that started breaking LTI login (it hits /auth with no episode param at least once...)
						if (scope.userHasRole('admin') && Object.keys($routeParams).length === 0) {
							$location.path('/');
						}

					}
				}, function () {
					console.log("Login failed...");
				});

				// for admin logins only, for now. In future maybe oauth-based login will route through here too
				scope.adminLogin = function () {
					authSvc.adminLogin(scope.loginForm.auth_key, scope.loginForm.password).then(function () {}, function (data) {
						console.warn("FAILED ADMIN LOGIN", data);
						scope.badlogin = true;
					});
				};

				scope.logout = function () {
					authSvc.logout();
				};

			}
		};

	});
