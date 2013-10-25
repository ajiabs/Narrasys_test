'use strict';

describe('Directive: ittVideoMagnet', function () {

  // load the directive's module
  beforeEach(module('com.inthetelling.player'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<itt-video-magnet></itt-video-magnet>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the ittVideoMagnet directive');
  }));
});
