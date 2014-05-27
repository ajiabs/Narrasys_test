'use strict';

angular.module('com.inthetelling.player')
	.controller('ErrorController', function ($scope, $rootScope,$location) {
		$rootScope.$on("error", function(event, errorData) {
			$scope.error = errorData;
		});

		




/* TODO: handle bad routes without redirecting to /error
			$rootScope.$emit("error",{
				"message": "404: that route doesn't exist."
			});
*/

	});