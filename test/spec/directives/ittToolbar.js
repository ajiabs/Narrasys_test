'use strict';

describe('Directive: ittToolbar', function () {

	// load the directive's module
	beforeEach(module('com.inthetelling.player'));

	var element,
		parentScope;

	beforeEach(inject(function ($rootScope, $compile) {
		parentScope = $rootScope.$new();
		parentScope.testProperty = { "test": true };
		element = angular.element('<div itt-toolbar></div>');
		element = $compile(element)(parentScope);
	}));

	it('should have a child scope which inherits from the parent scope', function() {
		expect(element.scope().hasOwnProperty('testProperty')).toBe(false);
		expect(element.scope().testProperty).toEqual(parentScope.testProperty);
	});

	/* TODO: These tests are failing, need to abstract the directive's controller
	into a separate controller file and test it separately, or else use the technique
	mentioned in this post: http://blog.freeside.co/post/60074672413/unit-testing-angular-directives-that-use-controller-and
	PS: IF THE GUY IN THAT POST DIDN'T USE STUPID COFFEE SCRIPT I'D BE ABLE TO ACTUALLY MAKE SENSE OF HIS SOLUTION AND IMPLEMENT IT NOW!!
	it('should add a setSceneTemplate method to the child scope', function() {
		expect(element.scope().hasOwnProperty('setSceneTemplate')).toBe(false);
		expect(typeof element.scope().setSceneTemplate).toBe('function');
	});

	it('should add a currentSceneTemplateIs method to the child scope', function() {
		expect(element.scope().hasOwnProperty('currentSceneTemplateIs')).toBe(false);
		expect(typeof element.scope().currentSceneTemplateIs).toBe('function');
	});
	*/

});
