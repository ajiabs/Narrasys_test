'use strict';

// UI Error Controller
angular.module('com.inthetelling.player')
	.controller('UIErrorController', function ($scope, $rootScope, $location, $timeout) {
		$rootScope.$on("error", function(event, errorData) {
			if (errorData && errorData.message) {  // blocking "unknown error", as those tend to turn out to not be errors
				// delay to prevent displaying transient errors on page refresh
				$timeout(function () {
					$scope.error = errorData;
				}, 2000);
			} else {
				console.error("UIErrorController got triggered with no error message!");
			}
		});

		// Would prefer not to have app.js redirect to /error in the first place, but as long as we are for missing routes:
		if ($location.url() === "/error") {
			$rootScope.$emit("error", {
				"message": "Requested rote doesn't exist."
			});
		}

	});
