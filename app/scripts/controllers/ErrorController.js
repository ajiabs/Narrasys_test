'use strict';

angular.module('com.inthetelling.player')
.controller('ErrorController', function($scope, errorSvc, appState) {
	$scope.errors = errorSvc.errors;
	$scope.notifications = errorSvc.notifications;
	$scope.user = appState.user;

	$scope.dismiss = function(cur) {
		// This is terribly sloppy
		var ret = [];
		for (var i = 0; i < $scope.errors.length; i++) {
			if ($scope.errors[i] !== cur) {
				ret.push($scope.errors[i]);
			}
		}
		$scope.errors = ret;
		ret = [];
		for (i = 0; i < $scope.notifications.length; i++) {
			if ($scope.notifications[i] !== cur) {
				ret.push($scope.notifications[i]);
			}
		}
		$scope.notifications = ret;

	};

	/* TODO HACK this should be in authSvc */
	$scope.resetAuth = function() {
		localStorage.removeItem('storyAuth');
	};
	$scope.reload = function() {
		window.location.reload(true);
	};

});
