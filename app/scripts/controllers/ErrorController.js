'use strict';

/* 
to throw errors:
		errorSvc.error({exception data structure:"TO BE DEFINED"},"Cause: ALL MESSED UP");
*/


angular.module('com.inthetelling.player')
	.factory('errorSvc', function() {
		var svc = {};
		svc.errors = [];

		svc.error = function(exception, cause) {

			// TODO
			// For now we're not going to display errors caught by the $exceptionHandler
			// 
			if (exception.data.error) {


				svc.errors.push({
					"exception": exception,
					"cause": exception.data.error
					//"stack": exception.stack
				});
			} else {
				console.log(exception);
			}

		};

		return svc;
	})

.controller('ErrorController', function($scope, $rootScope, errorSvc) {

	$scope.errors = errorSvc.errors;

	//todo this functionality needs to come back!  (don't use localStorage, get lgin_url from appState instead)
	// var status = response.status;
	// if (status === 401) {
	// 	console.warn("INTERCEPTOR GOT 401");
	// 	if (localStorage.storyAuth) {
	// 		// read the login url, if there is one, and redirect to it:
	// 		var storedData = angular.fromJson(localStorage.storyAuth);
	// 		localStorage.removeItem("storyAuth");
	// 		if (storedData.login_url) {
	// 			if (storedData.login_via_top_window_only) {
	// 				window.top.location.href = storedData.login_url;
	// 			} else {
	// 				window.location.href = storedData.login_url;
	// 			}
	// 		}
	// 	}
	// 	// if all else fails, force a reload as guest
	// 	window.location.reload();
	// 	return false;

	// }
	// console.warn("INTERCEPTOR GOT NON-401 ERROR:", response);
	//return $q.reject(response);


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


	/* TODO: handle bad routes without redirecting to /error
			$rootScope.$emit("error",{
				"message": "404: that route doesn't exist."
			});
*/

});
