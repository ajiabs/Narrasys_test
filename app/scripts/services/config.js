'use strict';

// Expose the global window.config object as an injectable
angular.module('com.inthetelling.player')
.factory('config', function () {
	return window.config;
});