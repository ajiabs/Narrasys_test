'use strict';

// Some of these filters are unnecessary, and need to make up my mind about 'foo' versus 'isFoo'


angular.module('com.inthetelling.player')

/* List filters */
.filter('itemLayout', function() {
	return function(items, layout) {
		var ret = [];
		angular.forEach(items, function(item) {
			if (item.layouts && item.layouts[0] === layout) {
				ret.push(item);
			}
		});
		return ret;
	};
})
	.filter('annotation', function() {
		return function(items) {
			var ret = [];
			angular.forEach(items, function(item) {
				if (item._type === 'Annotation') {
					ret.push(item);
				}
			});
			return ret;
		};
	})
	.filter('transmedia', function() {
		return function(items) {
			var ret = [];
			angular.forEach(items, function(item) {
				if (item._type !== 'Annotation') {
					ret.push(item);
				}
			});
			return ret;
		};
	})
	.filter('transcript', function() {
		return function(items) {
			var ret = [];
			angular.forEach(items, function(item) {
				if (item.isTranscript) {
					ret.push(item);
				}
			});
			return ret;
		};
	})
	.filter('isCurrent', function() {
		return function(items) {
			var ret = [];
			angular.forEach(items, function(item) {
				if (item.isCurrent) {
					ret.push(item);
				}
			});
			return ret;
		};
	})
	.filter('isContent', function() {
		return function(items) {
			var ret = [];
			angular.forEach(items, function(item) {
				if (item.isContent) {
					ret.push(item);
				}
			});
			return ret;
		};
	})
	.filter('transcriptandrequired', function() {
		// returns transcript AND required transmedia:
		return function(items) {
			var ret = [];
			angular.forEach(items, function(item) {
				if (item.isTranscript || item.required) {
					ret.push(item);
				}
			});
			return ret;
		};
	})
	.filter('transcriptandoptional', function() {
		// returns transcript AND optional transmedia
		return function(items) {
			var ret = [];
			angular.forEach(items, function(item) {
				if (item.isTranscript || (!item.isTranscript && !item.required)) {
					ret.push(item);
				}
			});
			return ret;
		};
	})
	.filter('required', function() {
		// returns only required transmedia (no transcript):
		return function(items) {
			var ret = [];
			angular.forEach(items, function(item) {
				if (!item.isTranscript && item.required) {
					ret.push(item);
				}
			});
			return ret;
		};
	})
	.filter('optional', function() {
		// returns only optional transmedia (no transcript)
		return function(items) {
			var ret = [];
			angular.forEach(items, function(item) {
				if (!item.isTranscript && !item.required) {
					ret.push(item);
				}
			});
			return ret;
		};
	})
/* Single filters */

/*
.filter('trustAsHtml', function($sce) {
	return function(val) {
		return $sce.trustAsHtml(val);
	};
})
*/
	.filter('highlightSubstring', function() {
		return function(text, search) {
			// console.log("Search highlight",text,search);
			if (!text) {
				return;
			}
			if (search || angular.isNumber(search)) {
				return text.toString().replace(new RegExp(search.toString(), 'gi'), '<span class="ui-match">$&</span>');
			} else {
				return text;
			}
		};
	})
	.filter('pretty', function() {
		return function(json) {
			return JSON.stringify(json, undefined, 2);
		};
	})
	.filter('asPercent', function() {
		return function(n) {
			return isNaN(n) ? (Math.floor(n * 100)) + "%" : '0%';
		};
	})
	.filter('asTime', function() {
		return function(t) {
			return isNaN(t) ? "0:00" : Math.floor(t / 60) + ":" + ("0" + Math.floor(t) % 60).slice(-2);
		};
	});
