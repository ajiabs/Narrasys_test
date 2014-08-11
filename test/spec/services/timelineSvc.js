'use strict';

describe('Service: timelineSvc', function () {

	// load the service's module
	beforeEach(module('com.inthetelling.story'));

	// instantiate service
	var timelineSvc;
	var modelSvc;

	beforeEach(inject(function (_timelineSvc_, _modelSvc_) {
		timelineSvc = _timelineSvc_;
		modelSvc = _modelSvc_;

		modelSvc.cache("episode", {
			"_id": "EP1",
			"created_at": "2014-04-10T02:02:15Z",
			"description": "The Business Case for Sustainability",
			"master_asset_id": "masterasset",
			"title": "Test Episode",
			"status": "Published",
			"templateUrl": "templates/episode/purdue.html",
			"styles": [
				"", "", ""
			]
		});
		modelSvc.addLandingScreen("EP1");

	}));

	/* 
TODO lots of math-y stuff we should be testing here: 
- past/present/future state of events after seek, play, etc
- playbackRate   (making tests wait for realtime to elapse would be annoying though)
- (when we add this functionality) skip scenes, multiple episodes in one timeline -- translate epsidoe time to timeline time and vv

*/

	it('stop items should sort their "enter" event before their "pause"', function () {
		var events = [{
			"_id": "event",
			"start_time": 1,
			"stop": true,
			"end_time": 2
		}];

		for (var i = 0; i < events.length; i++) {
			modelSvc.cache("event", events[i]);
		}
		timelineSvc.injectEvents(events, 0);
		expect(timelineSvc.timelineEvents[0].action).toEqual("enter");
		expect(timelineSvc.timelineEvents[1].action).toEqual("pause");
	});

	it('if "stop" and "exit" are simultaneous, "exit" should sort before "pause"', function () {
		var events = [{
			"_id": "event2",
			"start_time": 0,
			"end_time": 1
		}, {
			"_id": "event",
			"start_time": 1,
			"stop": true,
			"end_time": 2
		}];

		for (var i = 0; i < events.length; i++) {
			modelSvc.cache("event", events[i]);
		}
		timelineSvc.injectEvents(events, 0);
		expect(timelineSvc.timelineEvents[1].action).toEqual("exit");
		expect(timelineSvc.timelineEvents[2].action).toEqual("enter");
		expect(timelineSvc.timelineEvents[3].action).toEqual("pause");
	});

	it('if "stop" and "exit" are simultaneous, "exit" should sort before "pause" if events start in wrong order', function () {
		var events = [{
			"_id": "event",
			"start_time": 1,
			"stop": true,
			"end_time": 2
		}, {
			"_id": "event2",
			"start_time": 0,
			"end_time": 1
		}];

		for (var i = 0; i < events.length; i++) {
			modelSvc.cache("event", events[i]);
		}
		timelineSvc.injectEvents(events, 0);
		expect(timelineSvc.timelineEvents[1].action).toEqual("exit");
		expect(timelineSvc.timelineEvents[2].action).toEqual("enter");
		expect(timelineSvc.timelineEvents[3].action).toEqual("pause");
	});

	it('events simultaneous with stop events should sort pause after all enter', function () {
		var events = [{
			"_id": "event",
			"start_time": 1,
			"stop": true,
			"end_time": 2
		}, {
			"_id": "event2",
			"start_time": 1,
			"end_time": 2
		}];

		for (var i = 0; i < events.length; i++) {
			modelSvc.cache("event", events[i]);
		}
		timelineSvc.injectEvents(events, 0);
		expect(timelineSvc.timelineEvents[0].action).toEqual("enter");
		expect(timelineSvc.timelineEvents[1].action).toEqual("enter");
		expect(timelineSvc.timelineEvents[2].action).toEqual("pause");
	});

	it('events simultaneous with stop events should sort pause after all enters, when data is in reverse order', function () {
		var events = [{
			"_id": "event",
			"start_time": 1,
			"end_time": 2
		}, {
			"_id": "event2",
			"start_time": 1,
			"stop": true,
			"end_time": 2
		}];

		for (var i = 0; i < events.length; i++) {
			modelSvc.cache("event", events[i]);
		}
		timelineSvc.injectEvents(events, 0);
		expect(timelineSvc.timelineEvents[0].action).toEqual("enter");
		expect(timelineSvc.timelineEvents[1].action).toEqual("enter");
		expect(timelineSvc.timelineEvents[2].action).toEqual("pause");
	});

});
