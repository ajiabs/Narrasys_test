'use strict';

/*
	For use in video mode: returns only non-cosmetic, current transcript items
*/
angular.module('com.inthetelling.player')
	.filter('transcript', function () {
		return function (items) {
			var filteredItems = [];
			for (var i=0; i<items.length;i++) {
				if (
					items[i].type === 'annotation' &&
					items[i].isActive &&
					!(items[i].cosmetic) &&
					(items[i].templateUrl.indexOf('/transcript-')>-1)
				) {
					filteredItems.push(items[i]);
				}
			}
			return filteredItems;
		};
	});
