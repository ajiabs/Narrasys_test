'use strict';

// UI Error Controller
angular.module('com.inthetelling.player')
	.controller('UIErrorController', function ($scope, $rootScope,$location) {
		$rootScope.$on("error", function(event, errorData) {
			if (errorData) {
				$scope.error = errorData;
			}
		});

// Would prefer not to have app.js redirect to /error in the first place, but as long as we are for missing routes:
		if ($location.url() === "/error") {
			$rootScope.$emit("error",{
				"message": "Requested rote doesn't exist."
			});
		}

	});
