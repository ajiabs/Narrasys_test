'use strict';

describe('Service: Queuepointscheduler', function () {

  // load the service's module
  beforeEach(module('ComInthetellingPlayerApp'));

  // instantiate service
  var Queuepointscheduler;
  beforeEach(inject(function (_Queuepointscheduler_) {
    Queuepointscheduler = _Queuepointscheduler_;
  }));

  it('should do something', function () {
    expect(!!Queuepointscheduler).toBe(true);
  });

});
