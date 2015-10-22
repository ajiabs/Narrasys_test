'use strict';

// TODO youtube support for multiple playback speeds?
// TODO some scoping untidiness here; some of this should be moved to ittVideo

// TODO: counting stalls works ok-ish, but look into watching buffer % directly instead 
// so we can preemptively switch streams and not have to do all the intentionalStall nonsense

// NOTE iPhone has a separate video controller which doesn't send all the user events to the web side.
// This screws with all our stall watchers and babysitters since we can't distinguish between intententional pauses and unintended stalls.
// babysitters and stalls are disabled on phone therefore.

angular.module('com.inthetelling.story')
	.controller('VideoController', function ($q, $scope, $timeout, $interval, $window, $document, appState, timelineSvc, analyticsSvc) {
		// console.log("videoController instantiate");

		// init youtube
		//if (angular.element(document.head).find('script[src="//www.youtube.com/iframe_api"]').length === 0) {
		if (!appState.youtubeIsReady) {
			var apiTag = document.createElement('script');
			apiTag.src = "//www.youtube.com/iframe_api";
			angular.element($document[0].head).append(apiTag);
		}

		$window.onYouTubeIframeAPIReady = function () {
			appState.youtubeIsReady = true;
			// console.log("Youtube Service is ready");
		};

		$scope.initVideo = function (el) {
			// console.log("videoController.initVideo");

			// Adjust bitrate.  For now still depends on there being only two versions of the mp4 and webm:
			$scope.video.curStream = (appState.isTouchDevice ? 0 : 1);

			if ($scope.video.urls.youtube && $scope.video.urls.youtube.length) {
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
			// console.log("videoController initYoutube");
			var playerStates = ["ended", "playing", "paused", "buffering", "???", "cued"]; // convert YT codes to html5 state names
			// NOTE youtube is currently sending us playerState of 'buffering' when paused 

			$scope.YTPlayer = new window.YT.Player($scope.videoNode.id, {
				events: {
					'onStateChange': function (x) {
						if (x.data < 0) {
							return;
						}
						// console.log("state change:", playerStates[x.data], x.data);
						if (appState.isTouchDevice && appState.hasBeenPlayed === false) {
							// The first user-initiated click needs to go directly to youtube, not to our player.  
							// So we have to do some catchup here:
							$scope.YTPlayer.pauseVideo(); // block the direct user action, now that it's successfully inited YT for us
							timelineSvc.play(); // now our code can take over as per normal
						} else {
							$scope.playerState = playerStates[x.data];
							if ($scope.playerState === 'buffering') {
								$scope.stall();
							}
						}
					},

					onPlaybackQualityChange: function (x) {
						console.log("Playback quality changed: ", x.data);
						// TS-810 HACK HACKITY HACK
						// A significant number of our videos apparently have bad 360p encodes which won't play in Safari.
						// It's a youtube bug, but we can hack our way around it:
						if (x.data === 'medium' && /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)) {
							$scope.YTPlayer.setPlaybackQuality("large");
						}
					}

				}
			});
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

			$scope.stall = function () {
				// notify timelineSvc if the video stalls during playback
				if (appState.timelineState !== 'playing') {
					return;
				}
				if (appState.isIPhone) {
					return;
				}
				console.warn("Video stalled");
				if (!$scope.intentionalStall) {
					analyticsSvc.captureEpisodeActivity("stall");
				}
				timelineSvc.stall();
				var unwatch = $scope.$watch(function () {
					return $scope.playerState;
				}, function (newState) {
					if (newState !== 'buffering') {
						unwatch();
						timelineSvc.unstall();
					}
				});
			};

		}; // end of initYoutube

		$scope.initHTML5Video = function () {
			// console.log("initHTML5Video");
			// $scope.videoNode.addEventListener("loadedmetadata", function () {
			// 	console.log("video metadata has loaded");
			// }, false);
			$scope.videoNode.addEventListener('playing', function () {
				$scope.playerState = 'playing';
			}, false);

			// Chrome is failing to send these events, so screw it, we'll do it ourselves
			// $scope.videoNode.addEventListener('waiting', function () {
			// 	// triggered when buffering is stalled and there is no more buffered data
			// 	$scope.playerState = 'waiting';
			// 	$scope.stall();
			// }, false);
			// $scope.videoNode.addEventListener('stalled', function () {
			// 	// triggered when buffering is stalled -- playback may be continuing if there's buffered data
			// 	$scope.playerState = 'stalled';
			// }, false);
			$scope.videoNode.addEventListener('pause', function () {
				$scope.playerState = 'pause';
			}, false);

			$scope.changeVideoBandwidth = function () {
				// console.log("changeVideoBandwidth");
				var currentTime = $scope.currentTime();
				$scope.videoNode.pause();

				// TODO
				// according to the html5 spec, just changing the DOM shouldn't work.  But it does.
				// switch to the lower-bitrate stream
				$scope.video.curStream = 0;

				analyticsSvc.captureEpisodeActivity('lowBandwidth');
				// Need to wait a tick for the DOM to have updated before callign videoNode.load():
				$timeout(function () {
					$scope.videoNode.load();
					$scope.seek(currentTime);
					$scope.videoNode.play();
				});

				// TODO according to the html5 spec, the way we should change the video stream is like this. but iOS (at least) chokes on it:
				/*
								if ($scope.videoNode.currentSrc !== '') {
									var ext = $scope.videoNode.currentSrc.match(/\.(\w+)$/)[1];
									if ($scope.video.urls[ext][0] !== $scope.videoNode.currentSrc) {

										var currentTime = $scope.videoNode.currentTime;
										$scope.videoNode.pause();
										$scope.videoNode.src = $scope.video.urls[ext][0];
										$scope.videoNode.load();
										$scope.seek(currentTime);
										$timeout(function () {
											$scope.videoNode.play();
										});
									}
								}
				*/

			};

			$scope.babysitHTML5Video = function () {
				numberOfStalls = 0;
				if (appState.isIPhone) {
					return;
				}
				// native video will use this instead of $scope.stall and $scope.unstall.  May want to just standardize on this for YT as well
				$scope.babysitter = $interval(function () {
					// console.log($scope.videoNode.currentTime, appState.timelineState);
					if (appState.timelineState === 'playing') {
						if ($scope.lastPlayheadTime === $scope.currentTime()) {
							if (!$scope.intentionalStall) {
								analyticsSvc.captureEpisodeActivity("stall");
							}
							timelineSvc.stall();
							if (!$scope.intentionalStall && numberOfStalls++ === 2) {
								$scope.changeVideoBandwidth();
							}
							// console.log("numberOfStalls = ", numberOfStalls);
						}
						$scope.lastPlayheadTime = $scope.currentTime();
					} else if (appState.timelineState === 'buffering') {
						if ($scope.lastPlayheadTime !== $scope.currentTime()) {
							appState.timelineState = 'playing';
							timelineSvc.unstall();
						}
					}
				}, 333);
			};
			$scope.babysitHTML5Video();

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

		}; // end of initHTML5Video

		// DO NOT CALL ANY OF THE BELOW DIRECTLY!
		// Instead call via timelineSvc; otherwise the timeline won't know the video is playing
		var numberOfStalls = 0;
		$scope.intentionalStall = false;

		$scope.$on("$destroy", function () {
			$interval.cancel($scope.babysitter);
			$timeout.cancel($scope.stallGracePeriod);
			delete $scope.videoNode; // possibly unnecessary, but just for safety's sake
		});

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
			if ($scope.videoType === 'youtube') {
				$scope.YTPlayer.seekTo(appState.time, true); // in case t has drifted
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

		$scope.startAtTime = function (t) {
			if ($scope.videoType === 'youtube') {
				// HACK HACK HACK UNBELIEVABLE HACK
				// youtube recently started getting very confused if we try to seek before the video is playable.
				// there seems to be no reliable way to tell when it is safe, other than just playing the video and waiting 
				// until it actually starts.  SO THAT'S THE CUNNING PLAN
				// Have to mute the audio so it doesn't blip the first few frames of sound in the meanwhile

				$scope.setVolume(0);
				$scope.YTPlayer.playVideo();
				var unwatch = $scope.$watch(function () {
					return $scope.playerState;
				}, function (newPlayerState) {
					if (newPlayerState === 'playing') {
						unwatch();
						$scope.YTPlayer.seekTo(t, true);
						$scope.YTPlayer.pauseVideo();
						$scope.setVolume(100);
					}
				});

			} else {
				// native video does not have this problem
				$scope.seek(t, true);
			}
		};

		$scope.seek = function (t, intentionalStall, defer) {
			// console.log("videoController.seek", t, intentionalStall, defer);
			defer = defer || $q.defer();
			var videoNotReady = false;
			if (intentionalStall) {
				$scope.intentionalStall = true;
				// Keep this flag alive for a while, so we won't interpret user-triggered seeks as poor bandwidth
				$scope.stallGracePeriod = $timeout(function () {
					$scope.intentionalStall = false;
				}, 1500);
			}
			try {
				if ($scope.videoType === 'youtube') {
					var wasPlaying = (appState.timelineState === 'playing');
					$scope.YTPlayer.pauseVideo(); // pause before seek, otherwise YT keeps yammering on during the buffering phase
					$scope.YTPlayer.seekTo(t, true);
					$scope.YTPlayer.pauseVideo(); // and pause afterwards too, because YT always autoplays after seek
					if (wasPlaying) {
						$scope.YTPlayer.playVideo();
					}

					defer.resolve();
				} else {
					if ($scope.videoNode.readyState > 1) {
						$scope.videoNode.currentTime = t;
						defer.resolve();
					} else {
						// video is partially loaded but still not seek-ready
						$scope.intentionalStall = false;
						$timeout.cancel($scope.stallGracePeriod);
						videoNotReady = true;
					}
				}
			} catch (e) {
				// console.error("video error", e);
				$scope.intentionalStall = false;
				$timeout.cancel($scope.stallGracePeriod);
				videoNotReady = true;
			}
			if (videoNotReady) {

				// console.log("Video not ready");
				// TODO: throw error and stop looping if this goes on too long.
				// Or be less lazy and watch the loadedmetadata or youtube equivalent event
				$timeout(function () {
					$scope.seek(t, intentionalStall, defer);
				}, 100);
			}
			return defer.promise;
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
