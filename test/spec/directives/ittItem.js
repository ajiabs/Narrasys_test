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

	it('should create an isolate scope containing the model from parent scope', function() {
		expect(element.scope().item).toEqual(parentScope.itemModel);
	});
});
