'use strict';

xdescribe('Directive: ittVideoMagnet', function () {

	// load the directive's module
	beforeEach(module('com.inthetelling.player'));

	var element,
		parentScope;

	beforeEach(inject(function ($rootScope, $compile) {
		parentScope = $rootScope.$new();
		parentScope.testProperty = { "test": true };
		element = angular.element('<div itt-video-magnet></div>');
		element = $compile(element)(parentScope);
	}));

	it('should inherit parent scope', function() {
		expect(element.scope().testProperty).toEqual(parentScope.testProperty);
	});
});
