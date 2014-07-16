'use strict';

// use only for master asset!

angular.module('com.inthetelling.story')
	.directive('ittVideo', function($timeout, $rootScope, appState, timelineSvc) {

		var uniqueDirectiveID = 0; // Youtube wants to work via DOM IDs; this is a cheap way of getting unique ones

		return {
			restrict: 'A',
			replace: true,
			templateUrl: 'templates/video.html',
			controller: 'VideoController',
			scope: {
				video: "=ittVideo",
			},
			link: function(scope, element, attrs) {
				// console.log('ittVideo', scope);
				scope.appState = appState;
				scope.uid = ++uniqueDirectiveID;

				$timeout(function() {
					if (scope.video) {
						scope.initVideo(element);
					} else {
						// episode data not here yet...
						var episodeWatcher = scope.$watch(function() {
							return scope.video;
						}, function(a, b) {
							if (a) {
								// console.log("Registering video", a);
								scope.initVideo(element);
								episodeWatcher(); // stop watching;
							} else {
								// console.log("waiting", scope);
							}
						});
					}
				});

				scope.videoClick = function() {
					if (appState.timelineState === "paused") {
						timelineSvc.play();
					} else {
						timelineSvc.pause();
					}
				};

				$rootScope.$on('userKeypress.SPACE', scope.videoClick);

			},

		};
	});
