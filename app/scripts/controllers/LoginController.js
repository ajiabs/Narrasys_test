'use strict';

angular.module('com.inthetelling.story')
	.controller('LoginController', function ($scope, $location, authSvc) {

		// for admin logins only, for now. In future maybe oauth-based login will route through here too
		$scope.adminLogin = function () {
			authSvc.adminLogin($scope.auth_key, $scope.password).then(function () {
				$location.path('episodes');
			}, function () {
				$scope.badlogin = true;
			});

		};

	});
