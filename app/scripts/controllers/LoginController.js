'use strict';

angular.module('com.inthetelling.story')
	.controller('LoginController', function ($scope, $location, $routeParams, authSvc) {

		if ($routeParams.episode) {
			authSvc.authenticate()
				.then(function () {
					var epId = $routeParams.episode;
					$location.search('episode', null);
					$location.search('nonce', null);
					$location.path('episode/' + epId);
				});
		}

		if (authSvc.isAuthenticated() && authSvc.userHasRole('admin')) {
			$location.path('episodes');
		}

		// for admin logins only, for now. In future maybe oauth-based login will route through here too
		$scope.adminLogin = function () {

			authSvc.adminLogin($scope.auth_key, $scope.password).then(function () {
				$location.path('episodes');
			}, function () {
				$scope.badlogin = true;
			});

		};

	});
