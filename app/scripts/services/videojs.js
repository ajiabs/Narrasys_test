'use strict';

// Service for initializting and controlling the videojs player
// This service should always be used, as opposed to the global window.videojs reference
angular.module('com.inthetelling.player')
	.factory('videojs', function (config,$rootScope) {

		var svc = {};

		// persistent reference to the instantiated videojs player so we can reference it here and also expose its api publicly
		svc.player = null;

		// Initialize the videojs player. Requires the appropriate videojs markup to already be in the dom
		// We should be passed the id for the main video element to initialize videojs with.
		// Can only initialize once. Will return false if videoJS has already initialized and true if the attempt is successful.
		// Can optionally be passed a callback which will be given a reference to the instantiated player.
		svc.init = function (videodata, callback) {

			// console.log("video service init");
			if (!svc.player) {
				// Instantiate a new videojs player against the provided element id

				var vjsconfig = {
					// customControlsOnMobile was removed from videoJs, but if they ever bring it back we can use it as a better fix
					// than turning off vjs.controls() when something is going to overlap the video 
					// (which we need to do on ipad only, because the video controls layer steals all click events within its area
					"controls": true,
					"preload": true,
					"nativeControlsForTouch": false // doesn't seem to do anything?
				};
				
				// TODO Youtube plugin is buggy on iDevices and IE9.  If we cant fix and can afford the bandwidth, divert those users to S3.
				// SEE ALSO ittVideo.js which needs to perform the same test!
//				if (videodata.youtube && !($rootScope.isIPad || $rootScope.isIPhone)) { 
				if (videodata.youtube) { 
					vjsconfig.techOrder = ["youtube"];
				} else {
					vjsconfig.techOrder = ["html5", "flash"];
				}
				videojs(config.videoJSElementId, vjsconfig, function () {
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
