'use strict';

/*	Filters a collection of item models by their type property. Should be provided an array of allowed types.
	Usage example:
	<div ng-repeat="item in scene.items | types:['link', 'image']"></div>
	...will filter in items with type of 'link' or 'image'
*/
angular.module('com.inthetelling.player')
.filter('type', function () {
	return function(items, allowedTypes) {
		//console.log("typesFilter");
		// TODO: When console.log is printed, this filter is called A LOT while the app is running. Is this normal? A performance issue?
		// Would we have the same issue when using the filter filter?
		var itemsIn = [],
		i, j;
		for (i = 0; i < items.length; i++) {
			for (j = 0; j < allowedTypes.length; j++) {
				if (items[i].type === allowedTypes[j]) {
					itemsIn.push(items[i]);
					break;
				}
			}
		}
		return itemsIn;
	};
});
