'use strict';

describe('Directive: ittItem', function () {

  // load the directive's module
  beforeEach(module('com.inthetelling.player'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<itt-item></itt-item>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the ittItem directive');
  }));
});
