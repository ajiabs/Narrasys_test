'use strict';

/*  Stash for shared information, to save us a lot of $watching and $emitting. 
    It's convenient.  Maybe -too- convenient.
*/

angular.module('com.inthetelling.player')
	.factory('appState', function($interval, $filter, config) {


		// Simplify inter-controller communicatio thusly:
		var svc = {

			user: {}, // whatever authSvc gets back from getAccessToken

			episodeId: false, // ID of current episode
			/* jshint -W116 */
			isFramed: (window.parent != window), // are we inside an iframe?  Don't use !== because IE8 gets it wrong
			/* jshint +W116 */
			// TODO: The "correct" method below has too many false positives (IE I'm looking at you):
			// isTouchDevice:  ('ontouchstart' in window),
			isTouchDevice: (
				navigator.platform.indexOf('iPad') > -1 ||
				navigator.platform.indexOf('iPhone') > -1 ||
				navigator.platform.indexOf('iPod') > -1 ||
				navigator.userAgent.indexOf('Android') > -1),
			windowWidth: 0,
			windowHeight: 0,

			viewMode: (angular.element(window).width() > 480) ? 'discover' : 'review', // default view mode

			time: 0, // current playhead position (in seconds) relative to timeline NOT TO EPISODE!
			timeMultiplier: 1, // sets player speed (0.5 = half speed, 2=double,etc)
			duration: 0, // duration of timeline (in seconds)
			timelineState: 'paused', // "playing" or "paused" (set by timelineSvc). Future: "locked" (by stop question or etc)
			hasBeenPlayed: false, // set to true after first time the video plays (used so we can interrupt that first play with a helpful help)
			volume: 100, // Audio for main video
			muted: false, // audio for main video
			hideCaptions: false, // visibility of "closed captions" in watch mode
			show: {
				searchPanel: false,
				helpPanel: false,
				navPanel: false
			},
			videoControlsActive: false, // whether bottom toolbar is visible

			itemDetail: false, // Put item data here to show it as a modal overlay
			autoscroll: false, //scroll window to make current items visible (in relevant modes)
			autoscrollBlocked: false, // User has disabled autoscroll
			editing: false, // Object currently being edited by user (TODO)
			blerg: 'fnord' // Can't see this
		};

		// workaround for iOS crasher (can't bind to window.resize when inside an iframe)
		$interval(function() {
			svc.windowHeight = angular.element(window).height();
			svc.windowWidth = angular.element(window).width();
		}, 50, 0, false);

		// another iOS workaround:
		if (svc.isTouchDevice) {
			document.getElementById('CONTAINER').className = "touchDevice";
		}


		console.log("APPSTATE:", svc);

		return svc;

	});
