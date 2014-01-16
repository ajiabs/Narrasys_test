'use strict';

/*
	Filter for content items, Used in contentpane.html
	if showCurrent is true, returns only items for which isActive is true.
	Otherwise just returns the entire list.

*/
angular.module('com.inthetelling.player')
	.filter('itemList', function () {
		return function (items, showCurrent) {
			if (showCurrent) {
				var filteredItems = [],
					i;
				for (i = 0; i < items.length; i++) {
					if (items[i].isActive) {
						filteredItems.push(items[i]);
					}
				}
				return filteredItems;
			} else {
				return items;
			}

		};
	});
