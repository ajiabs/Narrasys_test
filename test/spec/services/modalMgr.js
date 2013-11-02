'use strict';

describe('Service: modalMgr', function () {

	// load the service's module
	beforeEach(module('com.inthetelling.player'));

	// instantiate service
	var modalMgr;
	beforeEach(inject(function (_modalMgr_) {
		modalMgr = _modalMgr_;
	}));

	it('should have a createItemDetailOverlay method', function () {
		expect(typeof modalMgr.createItemDetailOverlay).toBe('function');
	});

	it('should have a createInitOverlay method', function () {
		expect(typeof modalMgr.createInitOverlay).toBe('function');
	});

	it('should have a destroyInitOverlay method', function () {
		expect(typeof modalMgr.destroyInitOverlay).toBe('function');
	});

});

