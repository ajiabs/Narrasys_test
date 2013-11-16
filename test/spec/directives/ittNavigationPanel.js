'use strict';

describe('Directive: ittNavigationPanel', function () {

	// load the directive's module
	beforeEach(module('com.inthetelling.player'));

	var element,
		parentScope;

	beforeEach(inject(function ($rootScope, $compile) {
		parentScope = $rootScope.$new();
		parentScope.testProperty = { "test": true };
		element = angular.element('<div itt-navigation-panel></div>');
		element = $compile(element)(parentScope);
	}));

	it('should have a child scope which inherits from the parent scope', function() {
		expect(element.scope().hasOwnProperty('testProperty')).toBe(false);
		expect(element.scope().testProperty).toEqual(parentScope.testProperty);
	});
});
