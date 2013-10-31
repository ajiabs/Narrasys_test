'use strict';

// Expose the global window.videojs object as an injectable
angular.module('com.inthetelling.player')
.factory('videojs', function () {
	return window.videojs;
});