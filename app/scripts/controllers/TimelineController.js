'use strict';

angular.module('com.inthetelling.player')
	.controller('TimelineController', function ($scope, timelineSvc) {

		$scope.play = timelineSvc.play;
		$scope.pause = timelineSvc.pause;

		$scope.setSpeed = function (n) {
			timelineSvc.setSpeed(n);
		};

		$scope.$on('$destroy', function () {
			// Make sure that the clock and event timers are destroyed too
			timelineSvc.pause();
		});
	});
