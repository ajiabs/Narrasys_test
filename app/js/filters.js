'use strict';

/* Declare the player.filters module and its dependencies */

angular.module('player.filters', []).
	filter('interpolate', ['version', function(version) {
		return function(text) {
			return String(text).replace(/\%VERSION\%/mg, version);
		}
	}]);
