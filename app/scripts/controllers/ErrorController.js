'use strict';

/* 
to throw explicit errors:
		errorSvc.error({exception data structure:"TO BE DEFINED"},"Cause: ALL MESSED UP");
*/


angular.module('com.inthetelling.player')
	.factory('errorSvc', function() {
		var svc = {};
		svc.errors = [];

		svc.error = function(exception, cause) {

			// TODO
			// For now we're not going to display errors caught by the generic $exceptionHandler.
			// 
			if (exception && exception.data && exception.data.error) {
				svc.errors.push({
					"exception": exception,
					"cause": exception.data.error
					//"stack": exception.stack
				});
			} else {
				// generic error.  TODO show these only in dev environment
				console.log(exception);
			}

		};

		return svc;
	})

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

});
