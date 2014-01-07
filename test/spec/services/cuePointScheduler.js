'use strict';

describe('Service: cuePointScheduler', function () {

	// load the service's module
	beforeEach(module('com.inthetelling.player'));

	// instantiate service
	var cuePointScheduler;
	beforeEach(inject(function (_cuePointScheduler_) {
		cuePointScheduler = _cuePointScheduler_;
	}));

	// setup the jasmine mock clock for synchronous testing of this service
	// the service uses window.setInterval internally for its scan interval
	// so by setting up the jasmine.Clock mock here we can control the internal
	// clock for window.setInterval synchronously
	beforeEach(function() {
		jasmine.Clock.useMock();
	});

	// setup some reusable vars and a spy to use as a subscriber callback
	var providerId;
	var scanInterval;
	var subscriber1;
	var subscriber2;
	beforeEach(function() {
		providerId = "myTimelineProvider";
		scanInterval = 300; //ms
		subscriber1 = {
			span: {begin: 1000, end: 2000},
			callback: jasmine.createSpy('cb1')
		};
		subscriber2 = {
			span: {begin: 1000, end: 2000},
			callback: jasmine.createSpy('cb2')
		};
	});

	it('should register and unregister timeline provider', function () {
		var registerResult = cuePointScheduler.registerProvider(providerId, scanInterval);
		expect(typeof registerResult).toBe("function");
		var unregisterResult = cuePointScheduler.unregisterProvider(providerId);
		expect(unregisterResult).toBe(true);
	});

	it('should subscribe and unsubscribe a span', function () {
		var subscribeResult = cuePointScheduler.subscribe(subscriber1.span, subscriber1.callback);
		expect(subscribeResult).toBe(true);
		var unsubscribeResult = cuePointScheduler.unsubscribe(subscriber1.span);
		expect(unsubscribeResult).toBe(true);
	});

	it('should fire ENTER event for a single subscriber callback', function () {
		// subscribe to service
		var setPlayhead = cuePointScheduler.registerProvider(providerId, scanInterval);
		cuePointScheduler.subscribe(subscriber1.span, subscriber1.callback);
		expect(subscriber1.callback).not.toHaveBeenCalled();
		// generate an ENTER event
		setPlayhead(subscriber1.span.begin);
		jasmine.Clock.tick(scanInterval);
		expect(subscriber1.callback.callCount).toEqual(1);
		expect(subscriber1.callback.mostRecentCall.args[0]).toEqual(subscriber1.span);
		expect(subscriber1.callback.mostRecentCall.args[1]).toEqual(cuePointScheduler.ENTER);
		expect(subscriber1.callback.mostRecentCall.args[2]).toEqual(subscriber1.span.begin);
	});

	it('should fire EXIT event for a single subscriber callback', function () {
		// subscribe to service
		var setPlayhead = cuePointScheduler.registerProvider(providerId, scanInterval);
		cuePointScheduler.subscribe(subscriber1.span, subscriber1.callback);
		expect(subscriber1.callback).not.toHaveBeenCalled();
		// We must enter the span before we can exit it
		setPlayhead(subscriber1.span.begin);
		jasmine.Clock.tick(scanInterval);
		// generate an EXIT event
		setPlayhead(subscriber1.span.end);
		jasmine.Clock.tick(scanInterval);
		expect(subscriber1.callback.callCount).toEqual(2);
		expect(subscriber1.callback.mostRecentCall.args[0]).toEqual(subscriber1.span);
		expect(subscriber1.callback.mostRecentCall.args[1]).toEqual(cuePointScheduler.EXIT);
		expect(subscriber1.callback.mostRecentCall.args[2]).toEqual(subscriber1.span.end);
	});

	it('should fire ENTER event for multiple subscriber callbacks with same span', function () {
		// first make sure subscriber1 and subscriber2 are set up correctly
		expect(subscriber1.span).toEqual(subscriber2.span);
		expect(subscriber1.callback).not.toEqual(subscriber2.callback);
		// subscribe to service
		var setPlayhead = cuePointScheduler.registerProvider(providerId, scanInterval);
		cuePointScheduler.subscribe(subscriber1.span, subscriber1.callback);
		cuePointScheduler.subscribe(subscriber2.span, subscriber2.callback);
		expect(subscriber1.callback).not.toHaveBeenCalled();
		expect(subscriber2.callback).not.toHaveBeenCalled();
		// generate an ENTER event
		setPlayhead(subscriber1.span.begin);
		jasmine.Clock.tick(scanInterval);
		expect(subscriber1.callback.callCount).toEqual(1);
		expect(subscriber1.callback.mostRecentCall.args[0]).toEqual(subscriber1.span);
		expect(subscriber1.callback.mostRecentCall.args[1]).toEqual(cuePointScheduler.ENTER);
		expect(subscriber1.callback.mostRecentCall.args[2]).toEqual(subscriber1.span.begin);
		expect(subscriber2.callback.callCount).toEqual(1);
		expect(subscriber2.callback.mostRecentCall.args[0]).toEqual(subscriber2.span);
		expect(subscriber2.callback.mostRecentCall.args[1]).toEqual(cuePointScheduler.ENTER);
		expect(subscriber2.callback.mostRecentCall.args[2]).toEqual(subscriber2.span.begin);
	});

	it('should fire EXIT event for multiple subscriber callbacks with same span', function () {
		// first make sure subscriber1 and subscriber2 are set up correctly
		expect(subscriber1.span).toEqual(subscriber2.span);
		expect(subscriber1.callback).not.toEqual(subscriber2.callback);
		// subscribe to service
		var setPlayhead = cuePointScheduler.registerProvider(providerId, scanInterval);
		cuePointScheduler.subscribe(subscriber1.span, subscriber1.callback);
		cuePointScheduler.subscribe(subscriber2.span, subscriber2.callback);
		expect(subscriber1.callback).not.toHaveBeenCalled();
		expect(subscriber2.callback).not.toHaveBeenCalled();
		// We must enter the span before we can exit it
		setPlayhead(subscriber1.span.begin);
		jasmine.Clock.tick(scanInterval);
		// generate an EXIT event
		setPlayhead(subscriber1.span.end);
		jasmine.Clock.tick(scanInterval);
		expect(subscriber1.callback.callCount).toEqual(2);
		expect(subscriber1.callback.mostRecentCall.args[0]).toEqual(subscriber1.span);
		expect(subscriber1.callback.mostRecentCall.args[1]).toEqual(cuePointScheduler.EXIT);
		expect(subscriber1.callback.mostRecentCall.args[2]).toEqual(subscriber1.span.end);
		expect(subscriber2.callback.callCount).toEqual(2);
		expect(subscriber2.callback.mostRecentCall.args[0]).toEqual(subscriber2.span);
		expect(subscriber2.callback.mostRecentCall.args[1]).toEqual(cuePointScheduler.EXIT);
		expect(subscriber2.callback.mostRecentCall.args[2]).toEqual(subscriber2.span.end);
	});

});
