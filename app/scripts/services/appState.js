'use strict';

/*
	Stash for shared information, to save us a lot of $watching and $emitting. 
	It's convenient.  Maybe -too- convenient.

	I have a sinking feeling this is probably an elaborate wheel-reinvention of $scope or 
	something, but hey, it works

*/

angular.module('com.inthetelling.story')
	.factory('appState', function ($interval, $filter, config) {

		var svc = {};

		svc.init = function () {
			svc.user = {}; // whatever authSvc gets back from getAccessToken
			svc.episodeId = false; // ID of current episode

			/* jshint -W116 */
			svc.isFramed = (window.parent != window); // are we inside an iframe?  Don't use !== because IE8 gets it wrong
			/* jshint +W116 */

			svc.isTouchDevice = (navigator.platform.match(/iPad|iPod|iPhone/) || navigator.userAgent.match(/Android/));

			svc.windowWidth = 0;
			svc.windowHeight = 0;

			svc.viewMode = (angular.element(window).width() > 480) ? 'discover' : 'review'; // default view mode

			svc.time = 0; // current playhead position (in seconds) relative to timeline NOT TO EPISODE!
			svc.timeMultiplier = 1; // sets player speed (0.5 = half speed; 2=double;etc)
			svc.duration = 0; // duration of timeline (in seconds)
			svc.timelineState = 'paused'; // "playing", "paused", or "buffering" (set by timelineSvc). Future = "locked" (by stop question or etc)
			svc.hasBeenPlayed = false; // set to true after first time the video plays (used so we can interrupt that first play with a helpful help)
			svc.volume = 100; // Audio for main video
			svc.muted = false; // audio for main video
			svc.hideCaptions = false; // visibility of "closed captions" in watch mode
			svc.show = {
				searchPanel: false,
				helpPanel: false,
				navPanel: false
			};
			svc.videoControlsActive = false; // whether bottom toolbar is visible
			svc.itemDetail = false; // Put item data here to show it as a modal overlay
			svc.autoscroll = false; //scroll window to make current items visible (in relevant modes)
			svc.autoscrollBlocked = false; // User has disabled autoscroll
			svc.editing = false; // Object currently being edited by user (TODO)
		};
		svc.init();

		// workaround for iOS crasher (can't bind to window.resize when inside an iframe)
		$interval(function () {
			svc.windowHeight = angular.element(window).height();
			svc.windowWidth = angular.element(window).width();
		}, 50, 0, false);

		// another iOS workaround:
		if (svc.isTouchDevice) {
			document.getElementById('CONTAINER').className = "touchDevice";
		}

		console.log("appState:", svc);
		return svc;
	});
