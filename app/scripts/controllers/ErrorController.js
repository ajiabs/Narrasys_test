'use strict';

angular.module('com.inthetelling.player')
	.controller('ErrorController', function ($scope, errorSvc, appState) {
		$scope.errorSvc = errorSvc;

		$scope.user = appState.user;

		// probably should split this into separate functions for errors and notifications, but good enough for now
		$scope.dismiss = function (cur) {
			// this use of splice to remove items from the middle of the array in place works here 
			// only because we're only removing a single item.  For multiple removes in one pass, will need to  scan backwards through the array
			for (var i = 0; i < errorSvc.errors.length; i++) {
				if (errorSvc.errors[i] === cur) {
					errorSvc.errors.splice(i, 1);
					i = errorSvc.errors.length; // break loop since we already removed our item
				}
			}
			for (i = 0; i < errorSvc.notifications.length; i++) {
				if (errorSvc.notifications[i] === cur) {
					errorSvc.notifications.splice(i, 1);
					i = errorSvc.notifications.length;
				}
			}
		};

		/* TODO HACK this doesn't belong here at all; should be in authSvc (or possibly removed altogether) */
		$scope.resetAuth = function () {
			localStorage.removeItem('storyAuth');
		};

		$scope.reload = function () {
			window.location.reload(true);
		};

	});
