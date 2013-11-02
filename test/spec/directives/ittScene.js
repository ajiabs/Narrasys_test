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

	it ('should create an isolate scope', function() {
		expect(!!element.scope().sceneModel).toBe(false);
	});

	it('should add a scene property to the isolate scope', function() {
		expect(element.scope().hasOwnProperty('scene')).toBe(true);
		expect(element.scope().scene).toEqual(parentScope.sceneModel);
	});
});
