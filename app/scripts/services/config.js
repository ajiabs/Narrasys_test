'use strict';

// Expose the global window.config object as an injectable
angular.module('com.inthetelling.story')
	.factory('config', function () {
		var config = window.config;

		// Find out the API data url, if not specified:
		if (!config.apiDataBaseUrl) {
			config.apiDataBaseUrl = "//" + window.location.host;
		}

		if (!config.localStorageKey) {
			config.localStorageKey = "storyToken";
		}

		return config;
	});
