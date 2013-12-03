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

	it('should add an item property to the isolate scope', function() {
		expect(element.isolateScope().hasOwnProperty('item')).toBe(true);
		expect(element.isolateScope().item).toEqual(parentScope.itemModel);
	});

	it('should add a toggleDetailView method to the isolate scope', function() {
		expect(element.isolateScope().hasOwnProperty('toggleDetailView')).toBe(true);
		expect(typeof element.isolateScope().toggleDetailView).toBe('function');
	});

});
