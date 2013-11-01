'use strict';

/*	Filters a collection of item models by their layout property.
	Usage identical to type.js
	(TODO: is this a DRY fail? Or is this the Angular Way?)
*/
angular.module('com.inthetelling.player')
.filter('layout', function() { 
	return function(items, allowedLayouts) {
		var itemsIn = [],
		i, j;
		for (i = 0; i < items.length; i++) {
			for (j = 0; j < allowedLayouts.length; j++) {
				if (items[i].layout === allowedLayouts[j]) {
					itemsIn.push(items[i]);
					break;
				}
			}
		}
		return itemsIn;
	};
})






;
