'use strict';

/* This is basically just the ui-utils highlight filter, except that I'm too lazy to figure out how to inject a different module into the app right now. */
/* I'll just think of it as being frugal. */

angular.module('com.inthetelling.player')
	.filter('highlight', function ($sce) {
		return function (text, search) {
			if (search || angular.isNumber(search)) {
				return $sce.trustAsHtml(text.toString().replace(new RegExp(search.toString(), 'gi'), '<span class="ui-match">$&</span>'));
			} else {
				return text;
			}
		};
	}
);
