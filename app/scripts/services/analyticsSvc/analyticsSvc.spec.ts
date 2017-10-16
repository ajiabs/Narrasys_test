/*

So far only testing dejitter.
Obvious


*/
describe('Service: analyticsSvc', () => {

  // load the service's module
  beforeEach(angular.mock.module('iTT'));

  // instantiate services
  var analyticsSvc;
  var appState;
  var config;

  beforeEach(angular.mock.inject((_analyticsSvc_, _appState_, _config_) => {
    analyticsSvc = _analyticsSvc_;
    appState = _appState_;
    config = _config_;
    appState.user.track_episode_metrics = true;
    config.disableAnalytics = false;
  }));

  xit('should combine scrubTimeline jitter into a single event', () => {

    // this accurately simulates the jitter we're seeing (repeated sequential seeks)
    appState.time = 0;
    for (var i = 0; i < 100; i++) {
      var oldTime = appState.time;
      appState.time = appState.time + 1;
      analyticsSvc.captureEpisodeActivity('seek', {
        'method': 'scrubTimeline',
        'seekStart': oldTime
      });
    }

    var dejittered = analyticsSvc.dejitter(analyticsSvc.activityQueue);
    expect(dejittered.length).toEqual(1);
    expect(dejittered[0].data.seekStart).toEqual(0);
    expect(dejittered[0].timestamp).toEqual(100);
  });

  xit('should combine jitter in reverse scrubTimeline', () => {
    // this accurately simulates the jitter we're seeing (repeated sequential seeks)
    appState.time = 100;
    for (var i = 0; i < 100; i++) {
      var oldTime = appState.time;
      appState.time = appState.time - 1; // <-----
      analyticsSvc.captureEpisodeActivity('seek', {
        'method': 'scrubTimeline',
        'seekStart': oldTime
      });
    }

    var dejittered = analyticsSvc.dejitter(analyticsSvc.activityQueue);
    expect(dejittered.length).toEqual(1);
    expect(dejittered[0].data.seekStart).toEqual(100);
    expect(dejittered[0].timestamp).toEqual(0);
  });

  xit('should not consolidate noncontiguous scrubTimeline events', () => {
    appState.time = 0;
    for (var i = 0; i < 10; i++) {
      var oldTime = appState.time;
      appState.time = appState.time + 1;
      analyticsSvc.captureEpisodeActivity('seek', {
        'method': 'scrubTimeline',
        'seekStart': oldTime
      });
      appState.time = appState.time + 1; // <------- add a gap between seeks
    }

    var dejittered = analyticsSvc.dejitter(analyticsSvc.activityQueue);
    expect(dejittered.length).toEqual(10);
    expect(dejittered[0].data.seekStart).toEqual(0);
    expect(dejittered[0].timestamp).toEqual(1);
  });

  xit('should not consolidate non-scrubTimeline events', () => {
    appState.time = 0;
    var oldTime;
    for (var i = 0; i < 10; i++) {
      oldTime = appState.time;
      appState.time = appState.time + 1;
      analyticsSvc.captureEpisodeActivity('seek', {
        'method': 'scrubTimeline',
        'seekStart': oldTime
      });
    }
    analyticsSvc.captureEpisodeActivity('blurt', {
      'method': 'unseemly',
    });
    for (i = 0; i < 10; i++) {
      oldTime = appState.time;
      appState.time = appState.time + 1;
      analyticsSvc.captureEpisodeActivity('seek', {
        'method': 'scrubTimeline',
        'seekStart': oldTime
      });
    }

    var dejittered = analyticsSvc.dejitter(analyticsSvc.activityQueue);
    expect(dejittered.length).toEqual(3);
    expect(dejittered[0].data.seekStart).toEqual(0);
    expect(dejittered[0].timestamp).toEqual(10);
    expect(dejittered[1].timestamp).toEqual(10);
    expect(dejittered[1].name).toEqual('blurt');
    expect(dejittered[2].data.seekStart).toEqual(10);
    expect(dejittered[2].timestamp).toEqual(20);
  });

  it('should cope with empty event arrays', () => {
    var dejittered = analyticsSvc.dejitter(analyticsSvc.activityQueue);
    expect(dejittered.length).toEqual(0);
  });

});
