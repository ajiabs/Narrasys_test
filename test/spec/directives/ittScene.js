'use strict';

describe('Directive: ittScene', function () {

	// load the directive's module
	beforeEach(module('com.inthetelling.player'));

	var element,
		parentScope;

	beforeEach(inject(function ($rootScope, $compile) {
		parentScope = $rootScope.$new();
		parentScope.sceneModel = { "test": true };
		element = angular.element('<div itt-scene="sceneModel"></div>');
		element = $compile(element)(parentScope);
	}));

	it('should create an isolate scope containing the model from parent scope', function() {
		expect(element.scope().item).toEqual(parentScope.itemModel);
	});
});
