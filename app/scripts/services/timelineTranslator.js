'use strict';
angular.module('com.inthetelling.story')
	.factory('timelineTranslator', function () {
		var svc = {};
		
		var sortSegments = function (segmentX, segmentY) {
			//Move the parseInt out of here, for perf
			var x = parseInt(segmentX.sort_order);
			var y = parseInt(segmentY.sort_order);
			return x - y;
		}
		svc.getSegmentWithTime = function (segments, timelineTime) {
			segments = segments.sort(sortSegments);			
			var currentTime = 0;
			var index = 0;
			var remainder = timelineTime;
			var relevantSegment = segments[0];
			while(currentTime <= timelineTime) {
				var relevantSegment = segments[index];
		
				currentTime = currentTime + (segments[index].end_time - segments[index].start_time);
				if (currentTime <= timelineTime) {
					remainder = timelineTime - currentTime;
				}
				index++;
			}
			var segAndTime = {};
			segAndTime.time = remainder + relevantSegment.start_time;
			segAndTime.segment = relevantSegment;
			return segAndTime;
		};
		svc.getSegmentTimeFromTimelineTime = function(segments, time) {
			var seg = svc.getSegmentWithTime(segments, time);
			return seg.time;
		};

		svc.getSegmentFromTimelineTime = function(segments, time) {
			var seg = svc.getSegmentWithTime(segments, time);
			return seg.segment;
		};
		svc.getTimelineTimeFromSegmentTime = function(segments, currentSegment, segmentTime) {
			segments = segments.sort(sortSegments);
			var totalTime = 0;
			for (var i = 0, len = segments.length; i < len; i++) {
				if (segments[i]._id == currentSegment._id) {
					totalTime = totalTime + (segmentTime - currentSegment.start_time);
					break;
				}
				totalTime = totalTime + (segments[i].end_time - segments[i].start_time);
			}
			return totalTime;
		};
		svc.getDuration = function(segments) {
			segments = segments.sort(sortSegments);
			var totalTime = 0;
			for (var i = 0, len = segments.length; i < len; i++) {
				totalTime = totalTime + (segments[i].end_time - segments[i].start_time);
			}
			return totalTime;
		}
		return svc;
	});
