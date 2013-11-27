'use strict';

/*
	Filters the item list based on where they need to appear. layout = any valid scene.layout, or one of
		required (returns transcript and required transmedia)
		optional (returns non-required transmedia)
		content (returns all transcript and transmedia)
		transcript
		transmedia
*/
angular.module('com.inthetelling.player')
.filter('layout', function() {

	return function(items, layout) {
		if (!items) {return [];}
		var itemsIn = [], i, j, allowedLayouts;
		if (layout === 'required' || layout === 'optional' || layout === 'transcript' || layout === 'transmedia' || layout === 'content') {
			allowedLayouts = ['inline', 'sidebarL', 'sidebarR', 'burstL','burstR','burst'];
		} else {
			allowedLayouts = [layout];
		}
		for (i = 0; i < items.length; i++) {
			for (j = 0; j < allowedLayouts.length; j++) {
				if (items[i].layout === allowedLayouts[j]) {
					if (layout === 'transcript') {
						if (items[i].type === 'transcript') {itemsIn.push(items[i]);}
					} else if (layout === 'transmedia') {
						if (items[i].type !== 'transcript') {itemsIn.push(items[i]);}
					} else if (layout === 'required') {
						if (items[i].type === 'transcript' || items[i].required) {itemsIn.push(items[i]);}
					} else if (layout === 'optional') {
						if (items[i].type !== 'transcript' && !(items[i].required)) {itemsIn.push(items[i]);}
					} else { // content
						itemsIn.push(items[i]);
					}
					break;
				}
			}
		}
		return itemsIn;
	};
});
