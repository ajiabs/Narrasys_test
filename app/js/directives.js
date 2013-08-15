'use strict';

/* Declare the player.directives module and its dependencies */

angular.module('player.directives', []).
	directive('appVersion', ['version', function(version) {
		return function(scope, elm, attrs) {
			elm.text(version);
		};
	}]);
