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
			svc.errors.push({
				"exception": exception,
				"cause": cause
			});
		};

		return svc;
	})

	.controller('ErrorController', function ($scope, $rootScope, errorSvc) {

		$scope.errors = errorSvc.errors;
		
//todo this functionality needs to come back!
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




/* TODO: handle bad routes without redirecting to /error
			$rootScope.$emit("error",{
				"message": "404: that route doesn't exist."
			});
*/

	});