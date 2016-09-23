'use strict';

angular.module('com.inthetelling.story')
	.controller('TimelineController', function ($scope, timelineSvc, modelSvc, appState) {

		$scope.play = timelineSvc.play;
		$scope.pause = timelineSvc.pause;

		$scope.changeSpeed = function (n) {
			// console.log("timelineController.changeSpeed");
			// Limit speed to between 0.5 and 2 inclusive
			var newSpeed = appState.timeMultiplier + n;
			if (newSpeed < 0.5) {
				newSpeed = 0.5;
			}
			if (newSpeed > 2) {
				newSpeed = 2;
			}
			timelineSvc.setSpeed(newSpeed);
		};
		$scope.resetSpeed = function () {
			timelineSvc.setSpeed(1);
		};

		$scope.markerPercent = function (t) {
			return (t === undefined ? 0 : t / appState.duration * 100);
		};

		// Yeah, this is a little odd.  Letting timelineSvc manage all video-related functions,
		// including sound, so we can maintain state across multiple videos.
		$scope.toggleMute = function () {
			timelineSvc.toggleMute();
		};
		$scope.setVolume = function (volume) {
			timelineSvc.setVolume(volume);
		};

		/* DEAD CODE
		$scope.toggleFullscreen = function () {
			if (isInFullscreenMode()) {
				exitFullscreen();
			} else {
				enterFullscreen();
			}
		};

		var isInFullscreenMode = function () {
			return ((document.fullScreenElement && document.fullScreenElement !== null) || // alternative standard methods
				document.mozFullScreen || document.webkitIsFullScreen); // current working methods
		};

		var fullscreenWatcher = $scope.$watch(function () {
			return isInFullscreenMode();
		}, function (newVal) {
			appState.isInFullscreenMode = newVal;
		});
		$scope.$on('$destroy', function () {
			fullscreenWatcher();
		});

		var exitFullscreen = function () {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if (document.webkitExitFullscreen) {
				document.webkitExitFullscreen();
			}
		};

		var enterFullscreen = function () {
			var element = document.getElementById('CONTAINER');
			if (element.requestFullScreen) {
				element.requestFullScreen();
			} else if (element.mozRequestFullScreen) {
				element.mozRequestFullScreen();
			} else if (element.webkitRequestFullScreen) {
				element.webkitRequestFullScreen();
			}
		};
*/

		$scope.$on('$destroy', function () {
			// Make sure that the clock and event timers are destroyed too
			timelineSvc.pause();
		});
	});