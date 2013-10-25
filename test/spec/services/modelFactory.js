'use strict';

describe('Service: Modelfactory', function () {

  // load the service's module
  beforeEach(module('ComInthetellingPlayerApp'));

  // instantiate service
  var Modelfactory;
  beforeEach(inject(function (_Modelfactory_) {
    Modelfactory = _Modelfactory_;
  }));

  it('should do something', function () {
    expect(!!Modelfactory).toBe(true);
  });

});
