'use strict';

/*	
	Filters a collection of item models by their type property. Should be provided an map of allowed types. Types may be omitted.
	Usage example, filtering an items list to only links and images:
	<div ng-repeat="item in scene.items | types:{link: true, image: true}]"></div>
*/
angular.module('com.inthetelling.player')
	.filter('type', function () {
		return function (items, allowedTypes) {
			if (allowedTypes) {
				var itemsIn = [],
					i;
				for (i = 0; i < items.length; i++) {
					if (allowedTypes[items[i].type]) {
						itemsIn.push(items[i]);
					}
				}
				return itemsIn;
			}
			return [];
		};
	});
