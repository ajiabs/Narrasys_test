'use strict';

angular.module('com.inthetelling.player')
	.controller('TimelineController', function($scope, timelineSvc, modelSvc) {

		$scope.play = timelineSvc.play;
		$scope.pause = timelineSvc.pause;

		$scope.setSpeed = function(n) {
			timelineSvc.setSpeed(n);
		};

		$scope.markerPercent = function(t) {
			return t / modelSvc.appState.duration * 100;
		};

		// Yeah, this is a little odd.  Letting timelineSvc manage all video-related functions,
		// including sound, so we can maintain state across multiple videos.
		$scope.toggleMute = function() {
			timelineSvc.toggleMute();
		};
		$scope.setVolume = function(volume) {
			timelineSvc.setVolume(volume);
		};


		$scope.$on('$destroy', function() {
			// Make sure that the clock and event timers are destroyed too
			timelineSvc.pause();
		});
	});
