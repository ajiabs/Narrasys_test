'use strict';
describe('timelineTranslator', function () {
	var translator;
	beforeEach(angular.mock.module('com.inthetelling.story'));

	beforeEach(function () {
		angular.mock.inject(function ($injector) {
			translator = $injector.get('timelineTranslator');
		})
	});
	var segments = [{
			"_id":"1",
			"sort_order":0,
			"start_time": 0,
			"end_time": 100
		}, {
			"_id":"2",
			"sort_order":1,
			"start_time": 0,
			"end_time": 100
		}, {
			"_id":"3",
			"sort_order":2,
			"start_time": 0,
			"end_time": 100
		}, {
			"_id":"4",
			"sort_order":3,
			"start_time": 0,
			"end_time": 100
		}
	];
	var segmentsB = [{
			"_id":"1",
			"sort_order":0,
			"start_time": 50,
			"end_time": 100
		}, {
			"_id":"2",
			"sort_order":1,
			"start_time": 50,
			"end_time": 100
		}, {
			"_id":"3",
			"sort_order":2,
			"start_time": 50,
			"end_time": 100
		}, {
			"_id":"4",
			"sort_order":3,
			"start_time": 50,
			"end_time": 100
		}
	];
	describe('timelineTimeToSegmentTime ', function () {
		it('should return the time in the segment that equates to the total timeline time supplied', inject(function () {
			var time = 350;
			var segment_time = translator.getSegmentTimeFromTimelineTime(segments, time);
			expect(segment_time)
				.toEqual(50);
		}));
		it('should return the segment that the total timeline time supplied falls within', inject(function () {
			var time = 350;
			var segment = translator.getSegmentFromTimelineTime(segments, time);
			expect(segment._id)
				.toEqual("4");
		}));
		it('should return the timeline time according to the current segment time', inject(function () {
			var segmentTime = 50;
			var timelineTime = translator.getTimelineTimeFromSegmentTime(segments, segments[3], 50);
			expect(timelineTime)
				.toEqual(350);
		}));

	});

	describe('timelineTimeToSegmentTime ', function () {
		it('should return the time in the segment that equates to the total timeline time supplied when the segment start not zero', inject(function () {
			var time = 130;
			var segment_time = translator.getSegmentTimeFromTimelineTime(segmentsB, time);
			expect(segment_time)
				.toEqual(80);
		}));
		it('should return the segment that the total timeline time supplied falls within,  when the segment start not zero', inject(function () {
			var time = 130;
			var segment = translator.getSegmentFromTimelineTime(segmentsB, time);
			expect(segment._id)
				.toEqual("3");
		}));
		it('should return the timeline time according to the current segment time,  when the segment start not zero', inject(function () {
			var segmentTime = 55;
			var timelineTime = translator.getTimelineTimeFromSegmentTime(segmentsB, segmentsB[3], segmentTime);
			expect(timelineTime)
				.toEqual(155);
		}));

	});



});
