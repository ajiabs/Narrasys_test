xdescribe('Service: timelineSvc', () => {

  // load the service's module
  beforeEach(angular.mock.module('iTT'));

  // instantiate service
  var timelineSvc;
  var modelSvc;

  beforeEach(angular.mock.inject((_timelineSvc_, _modelSvc_) => {
    timelineSvc = _timelineSvc_;
    modelSvc = _modelSvc_;

    modelSvc.cache('episode', {
      '_id': 'EP1',
      'created_at': '2014-04-10T02:02:15Z',
      'description': 'The Business Case for Sustainability',
      'master_asset_id': 'masterasset',
      'title': 'Test Episode',
      'status': 'Published',
      'templateUrl': 'templates/episode/purdue.html',
      'styles': [
        '', '', ''
      ]
    });
    modelSvc.addLandingScreen('EP1');

  }));

  /*
TODO lots of math-y stuff we should be testing here:
- past/present/future state of events after seek, play, etc
- playbackRate   (making tests wait for realtime to elapse would be annoying though)
- (when we add this functionality) skip scenes, multiple episodes in one timeline
-- translate epsidoe time to timeline time and vv
*/

  it('stop items should sort their "enter" event before their "pause"', () => {
    const events = [{
      '_id': 'event',
      'start_time': 1,
      'stop': true,
      'end_time': 2,
      'templateUrl': 'timelineSvc.spec'
    }];
    // for (let i = 0; i < events.length; i += 1) {
    //   modelSvc.cache('event', events[i]);
    // }

    events.map((event: any) => modelSvc.cache('event', event));
    timelineSvc.injectEvents(events, 0);
    expect(timelineSvc.timelineEvents[0].action).toEqual('enter');
    // expect(timelineSvc.timelineEvents[1].action).toEqual('pause');
  });

  it('stop items injected and then removed should have their "pause" removed as well', () => {
    const events = [{
      '_id': 'event',
      'start_time': 1,
      'stop': true,
      'end_time': 2,
      'templateUrl': 'timelineSvc.spec'
    }];

    for (var i = 0; i < events.length; i++) {
      modelSvc.cache('event', events[i]);
    }
    timelineSvc.injectEvents(events, 0);
    expect(timelineSvc.timelineEvents[0].action).toEqual('enter');
    expect(timelineSvc.timelineEvents[1].action).toEqual('pause');
    expect(timelineSvc.timelineEvents[2].action).toEqual('exit');
    timelineSvc.removeEvent('event');

    expect(timelineSvc.timelineEvents.length).toEqual(0);
  });

  it('stop items updated with a new time should have their old timeline events removed', () => {
    const events = [{
      '_id': 'event',
      'start_time': 1,
      'stop': true,
      'end_time': 2,
      'templateUrl': 'timelineSvc.spec'
    }];

    for (var i = 0; i < events.length; i++) {
      modelSvc.cache('event', events[i]);
    }

    //Add the events to the timeline
    timelineSvc.injectEvents(events, 0);

    //Let's make sure that everything made it into the timeline correctly
    expect(timelineSvc.timelineEvents.length).toEqual(3);
    expect(timelineSvc.timelineEvents[0].action).toEqual('enter');
    expect(timelineSvc.timelineEvents[0].t).toEqual(1);
    expect(timelineSvc.timelineEvents[1].action).toEqual('pause');
    expect(timelineSvc.timelineEvents[1].t).toEqual(1);
    expect(timelineSvc.timelineEvents[2].action).toEqual('exit');
    expect(timelineSvc.timelineEvents[2].t).toEqual(1.01);

    //Update the time of the event
    events[0].start_time = 4
    timelineSvc.updateEventTimes(events[0]);

    //Make sure that there are only timeline events for the new event time
    expect(timelineSvc.timelineEvents.length).toEqual(3);
    expect(timelineSvc.timelineEvents[0].action).toEqual('enter');
    expect(timelineSvc.timelineEvents[0].t).toEqual(4);
    expect(timelineSvc.timelineEvents[1].action).toEqual('pause');
    expect(timelineSvc.timelineEvents[1].t).toEqual(4);
    expect(timelineSvc.timelineEvents[2].action).toEqual('exit');
    expect(timelineSvc.timelineEvents[2].t).toEqual(4.01);
  });

  it('if "stop" and "exit" are simultaneous, "exit" should sort before "pause"', () => {
    const events = [{
      '_id': 'event2',
      'start_time': 0,
      'end_time': 1,
      'templateUrl': 'timelineSvc.spec'
    }, {
      '_id': 'event',
      'start_time': 1,
      'stop': true,
      'end_time': 2,
      'templateUrl': 'timelineSvc.spec'
    }];

    for (var i = 0; i < events.length; i++) {
      modelSvc.cache('event', events[i]);
    }
    timelineSvc.injectEvents(events, 0);
    expect(timelineSvc.timelineEvents[1].action).toEqual('exit');
    expect(timelineSvc.timelineEvents[2].action).toEqual('enter');
    expect(timelineSvc.timelineEvents[3].action).toEqual('pause');
  });

  it('if "stop" and "exit" are simultaneous, "exit" should sort before "pause" if events start in wrong order', () => {
    const events = [{
      '_id': 'event',
      'start_time': 1,
      'stop': true,
      'end_time': 2,
      'templateUrl': 'timelineSvc.spec'
    }, {
      '_id': 'event2',
      'start_time': 0,
      'end_time': 1,
      'templateUrl': 'timelineSvc.spec'
    }];

    for (var i = 0; i < events.length; i++) {
      modelSvc.cache('event', events[i]);
    }
    timelineSvc.injectEvents(events, 0);
    expect(timelineSvc.timelineEvents[1].action).toEqual('exit');
    expect(timelineSvc.timelineEvents[2].action).toEqual('enter');
    expect(timelineSvc.timelineEvents[3].action).toEqual('pause');
  });

  it('events simultaneous with stop events should sort pause after all enter', () => {
    const events = [{
      '_id': 'event',
      'start_time': 1,
      'stop': true,
      'end_time': 2,
      'templateUrl': 'timelineSvc.spec'
    }, {
      '_id': 'event2',
      'start_time': 1,
      'end_time': 2,
      'templateUrl': 'timelineSvc.spec'
    }];

    for (let i = 0; i < events.length; i++) {
      modelSvc.cache('event', events[i]);
    }
    timelineSvc.injectEvents(events, 0);
    expect(timelineSvc.timelineEvents[0].action).toEqual('enter');
    expect(timelineSvc.timelineEvents[1].action).toEqual('enter');
    expect(timelineSvc.timelineEvents[2].action).toEqual('pause');
  });

  it('events simultaneous with stop events should sort pause after all enters, when data is in reverse order', () => {
    const events = [{
      '_id': 'event',
      'start_time': 1,
      'end_time': 2,
      'templateUrl': 'timelineSvc.spec'
    }, {
      '_id': 'event2',
      'start_time': 1,
      'stop': true,
      'end_time': 2,
      'templateUrl': 'timelineSvc.spec'
    }];

    for (let i = 0; i < events.length; i++) {
      modelSvc.cache('event', events[i]);
    }
    timelineSvc.injectEvents(events, 0);
    expect(timelineSvc.timelineEvents[0].action).toEqual('enter');
    expect(timelineSvc.timelineEvents[1].action).toEqual('enter');
    expect(timelineSvc.timelineEvents[2].action).toEqual('pause');
  });

});
