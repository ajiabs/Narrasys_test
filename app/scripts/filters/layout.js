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
			if (layout === 'required' || layout === 'optional' || layout === 'transcript' || layout === 'transmedia' || layout === 'content') {
				// return items for one of the five types of content pane.
				// We can ignore any items here for which item.inContentPane is false.
				for (i = 0; i < items.length; i++) {
					if (items[i].inContentPane) {
						if (layout === 'transcript') {
							if (items[i].type === 'annotation') {
								filteredItems.push(items[i]);
							}
						} else if (layout === 'transmedia') {
							if (items[i].type !== 'annotation') {
								filteredItems.push(items[i]);
							}
						} else if (layout === 'required') {
							if (items[i].type === 'annotation' || items[i].required) {
								filteredItems.push(items[i]);
							}
						} else if (layout === 'optional') {
							if (items[i].type !== 'annotation' && !(items[i].required)) {
								filteredItems.push(items[i]);
							}
						} else { // "content", so return everything:
							filteredItems.push(items[i]);
						}
					}
				}
			} else {
				// match only the specific layout input
				for (i = 0; i < items.length; i++) {
					if (items[i].layout === layout) {
						filteredItems.push(items[i]);
					}
				}
			}
			return filteredItems;
		};
	});
