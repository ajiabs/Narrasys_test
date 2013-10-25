'use strict';

describe('Filter: type', function () {

  // load the filter's module
  beforeEach(module('com.inthetelling.player'));

  // initialize a new instance of the filter before each test
  var type;
  beforeEach(inject(function ($filter) {
    type = $filter('type');
  }));

  it('should return the input prefixed with "type filter:"', function () {
    var text = 'angularjs';
    expect(type(text)).toBe('type filter: ' + text);
  });

});
