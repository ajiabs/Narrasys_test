'use strict';

/*
	Filters the item list based on where they need to appear.

	layout = any valid scene.layout, or one of the following:
		required   (returns annotation and required transmedia)
		optional   (returns non-required transmedia)
		content    (returns all annotation and transmedia)
		transcript (returns all annotation items)
		transmedia (returns all except annotation items)
*/
angular.module('com.inthetelling.player')
	.filter('layout', function () {

		return function (items, layout) {
			if (!items || !layout) {
				return [];
			}
			var filteredItems = [],
				i;
			// item.type === 'annotation' is a bit off as a method for matching transcript nodes specifically...
			
			for (i = 0; i < items.length; i++) {
				switch (layout) {
				case "transcript":
					if (items[i].inContentPane && items[i].type === 'annotation') {
						filteredItems.push(items[i]);
					}
					break;
				case "transmedia":
					if (items[i].inContentPane && items[i].type !== 'annotation') {
						filteredItems.push(items[i]);
					}
					break;
				case "required":
					if (items[i].inContentPane && items[i].required && items[i].type !== 'annotation') {
						filteredItems.push(items[i]);
					}
					break;
				case "optional":
					if (items[i].inContentPane && !(items[i].required) && items[i].type !== 'annotation') {
						filteredItems.push(items[i]);
					}
					break;
				case "transcript+required":
					if (items[i].inContentPane && items[i].required || items[i].type === 'annotation') {
						filteredItems.push(items[i]);
					}
					break;
				case "transcript+optional":
					if (items[i].inContentPane && !(items[i].required) || items[i].type === 'annotation') {
						filteredItems.push(items[i]);
					}
					break;
				case "content":
					if (items[i].inContentPane) {
						filteredItems.push(items[i]);
					}
					break;
				default:
					// Non-content-pane items match only the specific layout input:
					if (items[i].layout === layout) {
						filteredItems.push(items[i]);
					}
				}

			}
			return filteredItems;
		};
	});
