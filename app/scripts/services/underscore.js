'use strict';

// Expose the global window._ object as an injectable
angular.module('com.inthetelling.player')
.factory('_', function () {
	return window._;
});