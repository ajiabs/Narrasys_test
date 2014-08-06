'use strict';

// TODO youtube support for multiple playback speeds?
// TODO: $destroy is never called for this controller, therefore videoNode lingers.  
// Move that to the directive

angular.module('com.inthetelling.story')
	.controller('VideoController', function ($q, $scope, $timeout, $window, $document, appState, timelineSvc) {
		// console.log("videoController instantiate");

		// init youtube
		var apiTag = document.createElement('script');
		apiTag.src = "//www.youtube.com/iframe_api";
		angular.element($document[0].head).append(apiTag);
		$window.onYouTubeIframeAPIReady = function () {
			appState.youtubeIsReady = true;
			// console.log("Youtube Service is ready");
		};

		$scope.initVideo = function (el) {
			console.log("videoController.initVideo");
			if ($scope.video.urls.youtube) {
				$scope.videoType = 'youtube';
				appState.videoType = $scope.videoType;
				$scope.videoNode = el.find('iframe')[0];
				if (appState.youtubeIsReady) {
					$scope.initYoutube($scope.videoNode.id);
				} else {
					var unwatch = $scope.$watch(function () {
						return appState.youtubeIsReady;
					}, function (itIsReady) {
						if (itIsReady) {
							$scope.initYoutube($scope.videoNode.id);
							unwatch();
						}
					});
				}
			} else {
				$scope.videoType = "video"; // as in html5 <video> tagx
				appState.videoType = $scope.videoType;
				$scope.videoNode = el.find('video')[0];
				$scope.initHTML5Video();
			}
		};

		$scope.initYoutube = function () {
			console.log("videoController initYoutube");
			var playerStates = ["ended", "playing", "paused", "buffering", "", "cued"]; // convert YT codes to html5 state names
			$scope.YTPlayer = new window.YT.Player($scope.videoNode.id, {
				events: {
					'onStateChange': function (x) {
						$scope.playerState = playerStates[x.data];
						if ($scope.playerState === 'buffering') {
							$scope.stall();
						}
					}
				}
			});
			console.log("YTPlayer", $scope.YTPlayer.playVideo);
			// but we still need to wait for youtube to Do More Stuff, apparently:
			var unwatch = $scope.$watch(function () {
				return $scope.YTPlayer.playVideo !== undefined;
			}, function (isReady) {
				if (isReady) {
					unwatch();

					$scope.getBufferPercent = function () {
						appState.bufferedPercent = $scope.YTPlayer.getVideoLoadedFraction() * 100;
						return appState.bufferedPercent;
					};

					timelineSvc.registerVideo($scope);
				}
			});
		};

		$scope.initHTML5Video = function () {
			// TODO: notify timelineSvc of (at least) 'stalled' and 'waiting' so it doesn't wind up out of synch
			$scope.videoNode.addEventListener('playing', function () {
				$scope.playerState = 'playing';
			}, false);
			$scope.videoNode.addEventListener('waiting', function () {
				// triggered when buffering is stalled and there is no more buffered data
				$scope.playerState = 'waiting';
				$scope.stall();
			}, false);
			$scope.videoNode.addEventListener('stalled', function () {
				// triggered when buffering is stalled -- playback may be continuing if there's buffered data
				$scope.playerState = 'stalled';
			}, false);
			$scope.videoNode.addEventListener('pause', function () {
				$scope.playerState = 'pause';
			}, false);

			$scope.getBufferPercent = function () {
				// console.log("getBufferPercent");
				if ($scope.videoNode.buffered.length > 0) {
					var bufStart = $scope.videoNode.buffered.start($scope.videoNode.buffered.length - 1);
					var bufEnd = $scope.videoNode.buffered.end($scope.videoNode.buffered.length - 1);

					if (bufEnd < 0) {
						bufEnd = bufEnd - bufStart;
						bufStart = 0;
					}
					appState.bufferedPercent = bufEnd / appState.duration * 100;
					return appState.bufferedPercent;
				} else {
					return 0;
				}
			};

			timelineSvc.registerVideo($scope);

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

		$scope.stall = function () {
			// notify timelineSvc if the video stalls during playback
			if (appState.timelineState !== 'playing') {
				return;
			}
			// console.warn("Video stalled");
			timelineSvc.stall();
			var unwatch = $scope.$watch(function () {
				return $scope.playerState;
			}, function (newState) {
				if (newState !== 'buffering' && newState !== 'waiting') {
					unwatch();
					timelineSvc.unstall();
				}
			});
		};

		// play doesn't start immediately -- need to return a promise so timelineSvc can wait until the video is actually playing
		$scope.play = function () {
			var defer = $q.defer();
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
					defer.resolve();
				}
			});
			return defer.promise;
		};

		$scope.pause = function () {
			// console.log("VIDEO PAUSE");
			if ($scope.videoType === 'youtube') {
				$scope.YTPlayer.seekTo(appState.time, true);
				$scope.YTPlayer.pauseVideo();
			} else {
				$scope.videoNode.pause();
			}
			try {
				$scope.videoNode.currentTime = appState.time; // in case t has drifted
			} catch (e) {
				// this is harmless when it fails; because it can't be out of synch if it doesn't yet exist
			}
		};

		$scope.seek = function (t) {
			// console.log("VIDEO seek to ", t);
			try {
				if ($scope.videoType === 'youtube') {
					$scope.YTPlayer.seekTo(t, true);
					$scope.YTPlayer.pauseVideo(); // youtube always autoplays on seek.  We want timelineSvc to control that instead
				} else {
					$scope.videoNode.currentTime = t;
				}
			} catch (e) {
				// video not ready yet // TODO: throw error and stop looping if this goes on too long
				$timeout(function () {
					$scope.seek(t);
				}, 100);
			}
		};

		$scope.setSpeed = function (speed) {
			// console.log("VIDEO SPEED=", speed);
			if (speed <= 0) {
				// console.error("videoController doesn't handle reverse speeds...");
				return;
			}

			if ($scope.videoType === 'youtube') {
				// TODO (youtube doesn't seem to support this yet, or else we're not encoding the videos properly for it)
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
