'use strict';

// TODO youtube doesn't (always?) support mutiple playback rates; need to hide those controls when not available
// TODO wrap try/catch around all controls in case player isn't ready yet

// TODO watch for stall/buffering events and tell timeline to wait until video is ready again?

angular.module('com.inthetelling.story')
	.controller('VideoController', function ($q, $scope, $timeout, $window, $document, appState, timelineSvc) {

		// console.log("videoController instantiate");

		// init youtube
		var apiTag = document.createElement('script');
		apiTag.src = "//www.youtube.com/iframe_api";
		angular.element($document[0].head).append(apiTag);
		$window.onYouTubeIframeAPIReady = function () {
			$scope.youtubeIsReady = true;
			// console.log("Youtube Service is ready");
		};

		$scope.$on("$destroy", function () {
			// console.log("Destroying videoController and youtube player", $scope.YTPlayer);
			$scope.YTPlayer = undefined;
			// TODO tell youtubeSvc to destroy its instance as well? Also timelineSvc?  
		});

		$scope.initVideo = function (el) {
			if ($scope.video.youtube) {
				$scope.videoType = 'youtube';
				$scope.videoNode = el.find('iframe')[0];
				if ($scope.youtubeIsReady) {
					$scope.initYoutube($scope.videoNode.id);
				} else {
					var unwatch = $scope.$watch(function () {
						return $scope.youtubeIsReady;
					}, function (itis) {
						if (itis) {
							$scope.initYoutube($scope.videoNode.id);
							unwatch();
						}
					});
				}
			} else {
				$scope.videoType = "video"; // as in html5 <video> tagx
				$scope.videoNode = el.find('video')[0];
				$scope.initHTML5Video();
			}
			timelineSvc.registerVideo($scope);
			appState.videoType = $scope.videoType;
		};

		$scope.initYoutube = function () {
			// console.log("videoController initYoutube");
			var playerStates = ["ended", "playing", "paused", "buffering", "", "cued"];
			$scope.YTPlayer = new window.YT.Player($scope.videoNode.id, {
				events: {
					'onStateChange': function (x) {
						$scope.playerState = playerStates[x.data];
						// console.log("Player state change: ", $scope.playerState);
					}
				}
			});
			// console.log("YT player is ", $scope.YTPlayer, $scope.videoNode.id);
		};

		$scope.initHTML5Video = function () {
			// TODO: notify timelineSvc of (at least) 'stalled' and 'waiting' so it doesn't wind up out of synch
			$scope.videoNode.addEventListener('playing', function (evt) {
				$scope.playerState = 'playing';
			}, false);
			$scope.videoNode.addEventListener('waiting', function (evt) {
				$scope.playerState = 'waiting';
			}, false);
			$scope.videoNode.addEventListener('stalled', function (evt) {
				$scope.playerState = 'stalled';
			}, false);
			$scope.videoNode.addEventListener('pause', function (evt) {
				$scope.playerState = 'pause';
			}, false);

			/* For future reference, all html5 events:
				loadstart
				canplaythrough
				canplay
				loadeddata
				loadedmetadata
				abort
				emptied
				error
				stalled
				suspend
				waiting
				pause
				play
				volumechange
				playing
				seeked
				seeking
				durationchange
				progress
				ratechange
				timeupdate
				ended
				webkitbeginfullscreen
				webkitendfullscreen
			*/
		};

		// DO NOT CALL ANY OF THE BELOW DIRECTLY!
		// Instead call via timelineSvc; otherwise the timeline won't know the video is playing 

		// play doesn't start immediately! Need to return a promise so timelineSvc can wait until the video is actually playing
		$scope.play = function () {
			var playDefer = $q.defer();

			if ($scope.videoType === 'youtube') {
				$scope.YTPlayer.playVideo();
			} else {
				$scope.videoNode.play();
			}

			var unwatch = $scope.$watch(function () {
				return $scope.playerState;
			}, function (newPlayerState) {
				if (newPlayerState === 'playing') {
					unwatch();
					playDefer.resolve();
				}
			});

			return playDefer.promise;
		};

		$scope.pause = function () {
			// console.log("VIDEO PAUSE");
			if ($scope.videoType === 'youtube') {
				$scope.YTPlayer.seekTo(appState.time, true);
				$scope.YTPlayer.pauseVideo();
			} else {
				$scope.videoNode.pause();

				try {
					$scope.videoNode.currentTime = appState.time; // in case t has drifted
				} catch (e) {
					// this is harmless when it fails; because it can't be out of synch if it doesn't yet exist
				}
			}
		};

		$scope.seek = function (t) {
			// console.log("VIDEO seek to ", t);
			try {
				if ($scope.videoType === 'youtube') {
					$scope.YTPlayer.seekTo(t, true);
					if (appState.timelineState === 'paused') {
						$scope.pause(); // youtube autoplays on seek.
					}
				} else {
					$scope.videoNode.currentTime = t;
				}
			} catch (e) {
				// video not ready yet // TODO: watch for endless loops!
				$timeout(function () {
					$scope.seek(t);
				}, 100);
			}
		};

		$scope.setSpeed = function (speed) {
			// console.log("VIDEO SPEED=", speed);
			if (speed <= 0) {
				// console.error("TODO: videoController doesn't handle reverse speeds...");
				return;
			}

			if ($scope.videoType === 'youtube') {
				// TODO
				// console.log("Available speeds from youtube: ", $scope.YTPlayer.getAvailablePlaybackRates());
			} else {
				$scope.videoNode.playbackRate = speed;
			}
		};

		$scope.currentTime = function () {
			if ($scope.videoType === 'youtube') {
				return $scope.YTPlayer.getCurrentTime();
			} else {
				return $scope.videoNode.currentTime;
			}
		};

		$scope.toggleMute = function () {
			// console.log("toggleMute");
			if ($scope.videoType === 'youtube') {
				if ($scope.YTPlayer.isMuted()) {
					$scope.YTPlayer.unMute();
				} else {
					$scope.YTPlayer.mute();
				}
			} else {
				$scope.videoNode.muted = !($scope.videoNode.muted);
			}
		};

		$scope.setVolume = function (vol) { // 0..100
			if ($scope.videoType === 'youtube') {
				$scope.YTPlayer.setVolume(vol);
			} else {
				$scope.videoNode.volume = (vol / 100);
			}
		};

	});
