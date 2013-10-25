'use strict';

xdescribe('Controller: UIErrorController', function () {

	// load the controller's module
	beforeEach(module('com.inthetelling.player'));

	var UIErrorController,
		scope;

	// Initialize the controller and a mock scope
	beforeEach(inject(function ($controller, $rootScope) {
		scope = $rootScope.$new();
		UIErrorController = $controller('UIErrorController', {
			$scope: scope
		});
	}));

	xit('should attach a list of awesomeThings to the scope', function () {
		expect(scope.awesomeThings.length).toBe(3);
	});
});
