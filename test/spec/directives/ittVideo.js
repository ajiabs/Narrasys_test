'use strict';

describe('Directive: ittVideo', function () {

	// mock global videojs dependency
	// videojs service will throw error if videojs service is not
	// on the page.
	// TODO: Better way to do this would be to mock out the
	// videojs service dependency here. We need to test it anyways.
	window.videojs = jasmine.createSpy('videojs');

	// load the directive's module
	beforeEach(module('com.inthetelling.player'));

	var element,
		parentScope;

	beforeEach(inject(function ($rootScope, $compile) {
		parentScope = $rootScope.$new();
		parentScope.testProperty = { "test": true };
		element = angular.element('<div itt-video></div>');
		element = $compile(element)(parentScope);
	}));

	it ('should inherit from the parent scope', function() {
		expect(element.scope().hasOwnProperty('testProperty')).toBe(true);
		expect(element.scope().testProperty).toEqual(parentScope.testProperty);
	});

	// TODO: add specs for videojs.init() and scope.$on
	
});
