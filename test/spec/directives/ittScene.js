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

	it('should add a scene property to the isolate scope', function() {
		expect(element.isolateScope().hasOwnProperty('scene')).toBe(true);
		expect(element.isolateScope().scene).toEqual(parentScope.sceneModel);
	});
});
