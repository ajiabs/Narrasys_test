'use strict';

// Expose the global window.config object as an injectable
angular.module('com.inthetelling.player')
	.factory('config', function () {
		var config = window.config;

		// Find out the API data url, if not specified:
		if (!config.apiDataBaseUrl) {
			config.apiDataBaseUrl = "//" + window.location.host;
		}
		return config;
	});
