'use strict';

describe('Controller: EpisodeController', function () {

  // load the controller's module
  beforeEach(module('com.inthetelling.player'));

  var EpisodecontrollerCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    EpisodecontrollerCtrl = $controller('EpisodecontrollerCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
