'use strict';

// TODO: Still getting caught in endless loops on route changes... I think timelinesvc is still holding on to the old video reference?

// TODO prevent direct user input to video (clicks, keyboard input) -- all control shoudl go through timelineSvc
// TODO youtube doesn't (always?) support mutiple playback rates; need to hide those controls when not available
// TODO wrap try/catch around all controls in case player isn't ready yet

angular.module('com.inthetelling.player')
	.controller('VideoController', function ($scope, $timeout, $window, $document, modelSvc, timelineSvc, youtubeSvc) {

		console.log("videoController instantiate");

		$scope.$on("$destroy", function () {
			console.log("Destroying videoController and youtube player", $scope.YTPlayer);
			$scope.YTPlayer = undefined;
			// TODO tell youtubeSvc to destroy its instance as well? Also timelineSvc?  
		});

		$scope.registerVideo = function (el) {
			if ($scope.video.youtube) {
				$scope.videoType = "youtube";
				$scope.YTPlayer = youtubeSvc.createPlayer(el.find('iframe')[0]);
				timelineSvc.registerVideo($scope, el.find('iframe')[0]);
			} else {
				$scope.videoType = "video";
				timelineSvc.registerVideo($scope, el.find('video')[0]);
			}
			console.log($scope.videoType);
		};

		// these should only be called by timelineSvc
		// todo different behavior for youtube vs native <video>

		$scope.play = function (el) {
			console.log("VIDEO PLAY", el);
			if ($scope.videoType === 'youtube') {
				$scope.YTPlayer.playVideo();
			} else {
				el.play();
			}

		};

		$scope.pause = function (el) {
			console.log("VIDEO PAUSE");
			if ($scope.videoType === 'youtube') {
				$scope.YTPlayer.seekTo(modelSvc.appState.time, true);
				$scope.YTPlayer.pauseVideo();
			} else {
				el.currentTime = modelSvc.appState.time; // in case t has drifted
				el.pause();
			}
		};

		$scope.seek = function (el, t) {
			console.log("VIDEO seek to ", t);
			try {
				if ($scope.videoType === 'youtube') {

					// NOPE, this didn't work.
					// if (!$scope.YTPlayer) {
					// 	$scope.YTPlayer = youtubeSvc.init(el.find('iframe')[0]); // THis happens on route changes.  TODO may  need to do this on other functions too?
					// }
					console.log($scope.YTPlayer);
					$scope.YTPlayer.seekTo(t, true);
					if (modelSvc.appState.timelineState === 'paused') {
						$scope.pause(el); // youtube autoplays on seek.
					}
				} else {
					el.currentTime = t;
				}
			} catch (e) {
				// video not ready yet // TODO: watch for endless loops!
				$timeout(function () {
					$scope.seek(el, t);
				}, 100);
			}

		};

		$scope.setSpeed = function (el, speed) {
			console.log("VIDEO SPEED=", speed);
			if (speed <= 0) {
				console.error("TODO: videoController doesn't handle reverse speeds...");
				return;
			}

			if ($scope.videoType === 'youtube') {
				// TODO
				console.log("SPEEDS: ", $scope.YTPlayer.getAvailablePlaybackRates());
			} else {
				el.playbackRate = speed;
			}
		};

		$scope.currentTime = function (el) {
			if ($scope.videoType === 'youtube') {
				return $scope.YTPlayer.getCurrentTime();
			} else {
				return el.currentTime;
			}
		};
	});
