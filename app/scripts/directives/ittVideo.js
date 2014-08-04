'use strict';

// use only for master asset!

angular.module('com.inthetelling.story')
	.directive('ittVideo', function ($timeout, $interval, $rootScope, appState, timelineSvc) {

		var uniqueDirectiveID = 0; // Youtube wants to work via DOM IDs; this is a cheap way of getting unique ones

		return {
			restrict: 'A',
			replace: true,
			templateUrl: 'templates/video.html',
			controller: 'VideoController',
			scope: {
				video: "=ittVideo",
			},
			link: function (scope, element) {
				// console.log('ittVideo', scope);
				scope.appState = appState;
				scope.uid = ++uniqueDirectiveID;
				$timeout(function () {
					if (scope.video) {
						scope.initVideo(element);
					} else {
						// episode data is not here yet...
						var unwatch = scope.$watch(function () {
							return scope.video;
						}, function (isReady) {
							if (isReady) {
								unwatch();
								scope.initVideo(element);
							}
						});
					}
				});

				scope.videoClick = function () {
					if (appState.timelineState === "paused") {
						timelineSvc.play();
					} else {
						timelineSvc.pause();
					}
				};

				scope.spaceWatcher = $rootScope.$on('userKeypress.SPACE', scope.videoClick);

				// watch buffered amount on an interval
				scope.bufferInterval = $interval(function () {
					if (!scope.getBufferPercent) {
						return;
					}
					var pct = scope.getBufferPercent();
					if (pct > 98) {
						$interval.cancel(scope.bufferInterval);
					}
				}, 200);

				scope.$on('$destroy', function () {
					scope.spaceWatcher();
					$interval.cancel(scope.bufferInterval);

				});
			},

		};
	});
