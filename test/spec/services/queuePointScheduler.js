'use strict';

xdescribe('Service: queuePointScheduler', function () {

	// load the service's module
	beforeEach(module('com.inthetelling.player'));

	// instantiate service
	var queuePointScheduler;
	beforeEach(inject(function (_queuePointScheduler_) {
		queuePointScheduler = _queuePointScheduler_;
	}));

	xit('should do something', function () {
		expect(!!queuePointScheduler).toBe(true);
	});

});
