'use strict';

angular.module('com.inthetelling.player')
.controller('ErrorController', function($scope, $rootScope, errorSvc, appState) {
	$scope.errors = errorSvc.errors;
	$scope.user = appState.user;

	$scope.dismiss = function(error) {
		console.log(error, $scope.errors);
		var ret = [];
		for (var i = 0; i < $scope.errors.length; i++) {
			if ($scope.errors[i] !== error) {
				ret.push($scope.errors[i]);
			}
		}
		$scope.errors = ret;
	};

	/* TODO HACK this should be in authSvc */
	$scope.resetAuth = function() {
		localStorage.removeItem('storyAuth');
		window.location.reload(true);
	}

});
