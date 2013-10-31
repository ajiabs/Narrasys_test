'use strict';

describe('Directive: ittVideo', function () {

	// mock global videojs dependency
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

	it('should inherit parent scope', function() {
		expect(element.scope().testProperty).toEqual(parentScope.testProperty);
	});

	it('should wire up videojs', function() {
		expect(window.videojs).toHaveBeenCalled();
	});
});
