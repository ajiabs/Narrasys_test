'use strict';

describe('Service: videojs', function () {

	// mock global videojs dependency
	window.videojs = jasmine.createSpy('videojs');

	// load the service's module
	beforeEach(module('com.inthetelling.player'));

	// instantiate service
	var videojs;
	beforeEach(inject(function (_videojs_) {
		videojs = _videojs_;
	}));

	it('should have an init method', function () {
		expect(typeof videojs.init).toBe('function');
	});

	it('should wire up videojs', function() {
		videojs.init("vjs");
		expect(window.videojs).toHaveBeenCalled();
	});

	// TODO: Stub out window.videojs method with a spy that can fire the callback
	// and passed by the videojs.init() function... then we can test that videojs.player has been propertly set.
	// Also test the videojs.init() callback parameter.

});

