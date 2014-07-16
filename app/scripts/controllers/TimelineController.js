'use strict';

angular.module('com.inthetelling.story')
	.controller('TimelineController', function($scope, timelineSvc, modelSvc, appState) {

		$scope.play = timelineSvc.play;
		$scope.pause = timelineSvc.pause;

		$scope.setSpeed = function(n) {
			timelineSvc.setSpeed(n);
		};

		$scope.markerPercent = function(t) {
			return t / appState.duration * 100;
		};

		// Yeah, this is a little odd.  Letting timelineSvc manage all video-related functions,
		// including sound, so we can maintain state across multiple videos.
		$scope.toggleMute = function() {
			timelineSvc.toggleMute();
		};
		$scope.setVolume = function(volume) {
			timelineSvc.setVolume(volume);
		};

		// And this is just plain the wrong place for this.
		/* TODO make this a fullscreenbutton directive -------------------------------- */
		$scope.toggleFullscreen = function() {
			if (isInFullscreenMode()) {
				exitFullscreen();
			} else {
				enterFullscreen();
			}
		};

		var isInFullscreenMode = function() {
			return ((document.fullScreenElement && document.fullScreenElement !== null) || // alternative standard methods
				document.mozFullScreen || document.webkitIsFullScreen); // current working methods
		};

		$scope.$watch(function() {
			return isInFullscreenMode();
		}, function(newVal) {
			appState.isInFullscreenMode = newVal;
		});

		var exitFullscreen = function() {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if (document.webkitExitFullscreen) {
				document.webkitExitFullscreen();
			}
		};

		var enterFullscreen = function() {
			var element = document.getElementById('CONTAINER');
			if (element.requestFullScreen) {
				element.requestFullScreen();
			} else if (element.mozRequestFullScreen) {
				element.mozRequestFullScreen();
			} else if (element.webkitRequestFullScreen) {
				element.webkitRequestFullScreen();
			}
		};
		/* END TODO -------------------------------------------------------- */

		$scope.$on('$destroy', function() {
			// Make sure that the clock and event timers are destroyed too
			timelineSvc.pause();
		});
	});
