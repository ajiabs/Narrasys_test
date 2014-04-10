'use strict';

// UI Error Controller
angular.module('com.inthetelling.player')
	.controller('UIErrorController', function ($scope, $rootScope, $timeout, $location) {
		$rootScope.$on("error", function (event, errorData) {
			// delay to prevent displaying transient errors on page refresh
			$timeout(function () {
				$scope.error = errorData;
			}, 2000);
		});

		// Would prefer not to have app.js redirect to /error in the first place, but as long as we are for missing routes:
		if ($location.url() === "/error") {
			$rootScope.$emit("error", {
				"message": "Requested rote doesn't exist."
			});
		}

	});
