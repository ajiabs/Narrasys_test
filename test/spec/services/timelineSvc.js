'use strict';

describe('Service: timelineSvc', function () {

	// load the service's module
	beforeEach(module('com.inthetelling.story'));

	// instantiate service
	var timelineSvc;
	beforeEach(inject(function (_timelineSvc_) {
		timelineSvc = _timelineSvc_;

	}));

	/* 
TODO lots of math-y stuff we should be testing here: 

- past/present/future state of events after seek, play, etc
- playbackRate   (making tests wait for realtime to elapse would be annoying though)
- (when we add this functionality) skip scenes, multiple episodes in one timeline -- translate epsidoe time to timeline time and vv

*/

	it('TODO', function () {

	});

});
