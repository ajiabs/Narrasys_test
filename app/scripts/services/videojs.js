'use strict';

// Service for initializting and controlling the videojs player
// This service should always be used, as opposed to the global window.videojs reference
angular.module('com.inthetelling.player')
.factory('videojs', function () {

	var svc = {};

	// persistent reference to the instantiated videojs player so we can reference it here and also expose its api publicly
	svc.player = null;

	// Initialize the videojs player. Requires the appropriate videojs markup to already be in the dom
	// We should be passed the id for the main video element to initialize videojs with.
	// Can only initialize once. Will return false if videoJS has already initialized and true if the attempt is successful.
	// Can optionally be passed a callback which will be given a reference to the instantiated player.
	svc.init = function(videoJSElementId, callback) {
		if (!svc.player) {
			// Instantiate a new videojs player against the provided element id
			videojs(videoJSElementId, {}, function() {
				svc.player = this;
				if (callback) {
					callback(svc.player);
				}
			});
			return true;
		}
		return false;
	};

	return svc;

});