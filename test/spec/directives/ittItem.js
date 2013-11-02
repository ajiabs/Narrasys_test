'use strict';

describe('Directive: ittItem', function () {

	// load the directive's module
	beforeEach(module('com.inthetelling.player'));

	var element,
		parentScope;

	beforeEach(inject(function ($rootScope, $compile) {
		parentScope = $rootScope.$new();
		parentScope.itemModel = { "test": true };
		element = angular.element('<div itt-item="itemModel"></div>');
		element = $compile(element)(parentScope);
	}));

	it ('should create an isolate scope', function() {
		expect(!!element.scope().itemModel).toBe(false);
	});

	it('should add an item property to the isolate scope', function() {
		expect(element.scope().hasOwnProperty('item')).toBe(true);
		expect(element.scope().item).toEqual(parentScope.itemModel);
	});

	it('should add a launchDetailView method to the isolate scope', function() {
		expect(element.scope().hasOwnProperty('launchDetailView')).toBe(true);
		expect(typeof element.scope().launchDetailView).toBe('function');
	});
});
