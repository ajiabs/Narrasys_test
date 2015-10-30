'use strict';

// use only for master asset!

angular.module('com.inthetelling.story')
	.directive('ittVideo', function ($timeout, $interval, $rootScope, appState, timelineSvc, dataSvc, modelSvc) {
		var uniqueDirectiveID = 0; // Youtube wants to work via DOM IDs; this is a cheap way of getting unique ones

		return {
			restrict: 'A',
			replace: true,
			templateUrl: 'templates/video.html',
			controller: 'VideoController',
			scope: {
				video: "=ittVideo",
				poster: "="
			},
			link: function (scope, element) {
				// console.log('ittVideo', scope.video);

				scope.appState = appState;
				scope.uid = ++uniqueDirectiveID;

				$timeout(function () {
					scope.initVideo(element);
				}); // in controller

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
					if (pct > 98) { // close enough
						$interval.cancel(scope.bufferInterval);
						appState.bufferedPercent = 100;
					}
				}, 200);

				// if the video is not yet transcoded poll for updates until it is
				var pollCount = 0;
				scope.pollInterval = $interval(function () {
					pollCount++;
					if (pollCount > 360) {
						$interval.cancel(scope.pollInterval); // Give up after an hour, the user certainly will have
					}
					var currentEpisode = modelSvc.episodes[appState.episodeId];

					if (currentEpisode && currentEpisode.masterAsset && !modelSvc.isTranscoded(currentEpisode.masterAsset)) {
						dataSvc.getSingleAsset(currentEpisode.master_asset_id).then(function (latestAsset) {

							if (modelSvc.isTranscoded(latestAsset)) {
								$interval.cancel(scope.pollInterval);
								modelSvc.cache('asset', latestAsset);
							}
						});
					} else {
						$interval.cancel(scope.pollInterval);
					}
				}, 10000);

				scope.$on('$destroy', function () {
					scope.spaceWatcher();
					$interval.cancel(scope.bufferInterval);
					$interval.cancel(scope.pollInterval);
				});
			},

		};
	});
