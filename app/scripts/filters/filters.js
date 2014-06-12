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

.filter('highlightSubstring', function($sce) {
	return function(text, search) {
		if (search || angular.isNumber(search)) {
			return $sce.trustAsHtml(text.toString().replace(new RegExp(search.toString(), 'gi'), '<span class="ui-match">$&</span>'));
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
			return (Math.floor(n * 100)) + "%";
		};
	})
	.filter('asTime', function() {
		return function(t) {
			return Math.floor(t / 60) + ":" + ("0" + Math.floor(t) % 60).slice(-2);
		};
	});
/*
	.filter('XXX', function() {
		return function(items) {
			var ret = [];
			angular.forEach(items, function(item) {
				if (XXX) {
					ret.push(item);
				}
			});
			return ret;
		};
	})
*/

// Not needed anymore:
/*
	.filter('scenes', function() {
		return function(arr, filters) {
//			console.log("scenes filter", filters);
			// currently supported filters: episodeId
			var ret = [];
			angular.forEach(arr, function(item) {
				if (item._type !== 'Scene') {
					return;
				}
				if (filters.episodeId && item.episode_id !== filters.episodeId) {
					return;
				}
				ret.push(item);
			});
			return ret.sort(function(a, b) {
				return a.start_time - b.start_time;
			});
		};

	})
	.filter('items', function(modelSvc) {
		return function(arr, filters) {
//			console.log("items filter", filters);
			// currently supported filters: episodeId, sceneId
			var ret = [];
			angular.forEach(arr, function(item) {
				if (item._type === 'Scene') {
					return;
				}
				if (filters.episodeId && item.episode_id !== filters.episodeId) {
					return;
				}
				if (filters.sceneId) {
					var scene = modelSvc.scene(filters.sceneId);
					if (item.start_time < scene.start_time || item.start_time >= scene.end_time) {
						return;
					}
				}
				ret.push(item);
			});
			return ret.sort(function(a, b) {
				return a.start_time - b.start_time;
			});
		};

	});
		*/
