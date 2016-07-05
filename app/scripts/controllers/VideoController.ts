'use strict';

// TODO youtube support for multiple playback speeds?
// TODO some scoping untidiness here; some of this should be moved to ittVideo

// TODO: counting stalls works ok-ish, but look into watching buffer % directly instead
// so we can preemptively switch streams and not have to do all the intentionalStall nonsense

// NOTE iPhone has a separate video controller which doesn't send all the user events to the web side.
// This screws with all our stall watchers and babysitters since we can't distinguish between intententional pauses and unintended stalls.
// babysitters and stalls are disabled on phone therefore.
VideoController.$inject = ['$q', '$scope', '$rootScope', '$timeout', '$interval', '$window', '$document', 'appState', 'timelineSvc', 'analyticsSvc', 'youTubePlayerManager'];

export default function VideoController($q, $scope, $rootScope, $timeout, $interval, $window, $document, appState, timelineSvc, analyticsSvc, youTubePlayerManager) {
	//exported functions / props
	angular.extend($scope, {
		initVideo: initVideo,
		intentionalStall: false,
		play: play,
		pause: pause,
		startAtTime: startAtTime,
		seek: seek,
		setSpeed: setSpeed,
		currentTime: currentTime,
		toggleMute: toggleMute,
		setVolume: setVolume,
		playerStateChange: onPlayerStateChange,
		onReady: onReady
	});


	//private properties
	var _eventListeners = {};
	var _numberOfStalls = 0;
	var _YTPlayer;
	var _babysitter;
	var playerStates = {
		'-1': 'unstarted',
		'0': 'ended',
		'1': 'playing',
		'2': 'paused',
		'3': 'buffering',
		'5': 'video cued'
	};

	//called from link fn of ittVideo
	function initVideo(el) {
		// console.log("videoController.initVideo", el);

		// Adjust bitrate.  For now still depends on there being only two versions of the mp4 and webm:
		$scope.video.curStream = (appState.isTouchDevice ? 0 : 1);

		if ($scope.video.urls.youtube && $scope.video.urls.youtube.length) {
			$scope.videoType = 'youtube';
			appState.videoType = $scope.videoType;
			$scope.videoNode = {id: $scope.video._id};
		} else {
			$scope.videoType = "video"; // as in html5 <video> tagx
			appState.videoType = $scope.videoType;
			$scope.videoNode = el.find('video')[0];
			initHTML5Video();
		}
	}

	function onReady() {
		_initYoutube();
	}

	function onPlayerStateChange(event) {
		var state = event.data;

		//console.log('player state changin? videoCtrl', state);
		if (state < 0) {
			return;
		}
		if (appState.isTouchDevice && appState.hasBeenPlayed === false) {
			// The first user-initiated click needs to go directly to youtube, not to our player.
			// So we have to do some catchup here:
			youTubePlayerManager.pause($scope.videoNode.id); // block the direct user action, now that it's successfully inited YT for us
			timelineSvc.play(); // now our code can take over as per normal
		} else {
			$scope.playerState = playerStates[parseInt(state, 10)];
			if ($scope.playerState === 'buffering') {
				_stall();
			}

			if ($scope.playerState === 'ended') {
				//end of video
				console.log('end of video!!');
				youTubePlayerManager.stop($scope.videoNode.id);
			}
		}
	}

	function _stall() {
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
	}


	function _initYoutube() {
		// NOTE youtube is currently sending us playerState of 'buffering' when paused

		timelineSvc.registerVideo($scope);

		//but we still need to wait for youtube to Do More Stuff, apparently:
		$scope.$watch(function () {
			return youTubePlayerManager.getVideoLoadedFraction($scope.videoNode.id);
		}, function (cur) {
			if (cur) {
				appState.bufferedPercent = youTubePlayerManager.getVideoLoadedFraction($scope.videoNode.id) * 100;
				//unwatch();
			}
		});


	} // end of initYoutube


	function initHTML5Video() {
		// console.log("initHTML5Video");
		// $scope.videoNode.addEventListener("loadedmetadata", function () {
		// 	console.log("video metadata has loaded");
		// }, false);
		_eventListeners.playing = $scope.videoNode.addEventListener('playing', function () {
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
		_eventListeners.pause = $scope.videoNode.addEventListener('pause', function () {
			$scope.playerState = 'pause';
		}, false);

		function _changeVideoBandwidth() {
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

		}

		function _babysitHTML5Video() {
			_numberOfStalls = 0;
			if (appState.isIPhone) {
				return;
			}
			// native video will use this instead of $scope.stall and $scope.unstall.  May want to just standardize on this for YT as well
			_babysitter = $interval(function () {
				// console.log($scope.videoNode.currentTime, appState.timelineState);
				if (appState.timelineState === 'playing') {
					if ($scope.lastPlayheadTime === $scope.currentTime()) {
						if (!$scope.intentionalStall) {
							analyticsSvc.captureEpisodeActivity("stall");
						}
						timelineSvc.stall();
						if (!$scope.intentionalStall && _numberOfStalls++ === 2) {
							_changeVideoBandwidth();
						}
						// console.log("numberOfStalls = ", _numberOfStalls);
					}
					$scope.lastPlayheadTime = $scope.currentTime();
				} else if (appState.timelineState === 'buffering') {
					if ($scope.lastPlayheadTime !== $scope.currentTime()) {
						appState.timelineState = 'playing';
						timelineSvc.unstall();
					}
				}
			}, 333);
		}

		_babysitHTML5Video();

		//this gets defined on scope twice, once in a watch, not sure which one is the one we want if we called it on the scope
		$scope.getBufferPercent = function () {
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

	} // end of initHTML5Video

	// DO NOT CALL ANY OF THE BELOW DIRECTLY!
	// Instead call via timelineSvc; otherwise the timeline won't know the video is playing


	// play doesn't start immediately -- need to return a promise so timelineSvc can wait until the video is actually playing
	function play() {
		var defer = $q.defer();
		if ($scope.videoType === 'youtube') {
			youTubePlayerManager.play($scope.videoNode.id);
		} else {
			$scope.videoNode.play();
			if (appState.embedYTPlayerAvailable) {
				youTubePlayerManager.pauseEmbeds();
			}
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
	}

	function pause() {
		if ($scope.videoType === 'youtube') {
			// in case t has drifted
			youTubePlayerManager.seekTo($scope.videoNode.id, appState.time, true);
			youTubePlayerManager.pause($scope.videoNode.id);
		} else {
			$scope.videoNode.pause();
			try {
				$scope.videoNode.currentTime = appState.time; // in case t has drifted
			} catch (e) {
				// this is harmless when it fails; because it can't be out of synch if it doesn't yet exist
			}
		}
	}

	function startAtTime(t) {
		if ($scope.videoType === 'youtube') {
			var unwatch;
			if (appState.isTouchDevice && appState.hasBeenPlayed === false) {
				// iOS  doesn't init the YT player until after the user has interacted with it, so we can't set the start time now.
				// So we'll cheat, and just wait until we can set the time to do so.  This unfortunately leaves the video at frame 1
				// until the user hits play, which is why we're using a different technique for non-touchscreens below
				unwatch = $scope.$watch(function () {
					return appState.hasBeenPlayed;
				}, function (newState) {
					if (newState) {
						unwatch();
						youTubePlayerManager.seekTo($scope.videoNode.id, t, true);
						//youTubePlayerManager.play($scope.videoNode.id);
					}
				});
			} else {
				// HACK Non-touchscreens:
				// youtube recently started getting very confused if we try to seek before the video is playable.
				// there seems to be no reliable way to tell when it is safe, other than just playing the video and waiting
				// until it actually starts.  SO THAT'S THE CUNNING PLAN
				// Have to mute the audio so it doesn't blip the first few frames of sound in the meanwhile
				$scope.setVolume(0);
				youTubePlayerManager.play($scope.videoNode.id);
				unwatch = $scope.$watch(function () {
					return playerStates[youTubePlayerManager.playerState($scope.videoNode.id)];
				}, function (newPlayerState) {
					if (newPlayerState === 'playing') {
						unwatch();
						youTubePlayerManager.seekTo($scope.videoNode.id, t, true);
						youTubePlayerManager.pause($scope.videoNode.id);
						$scope.setVolume(100);
					}
				});
			}
		} else {
			// native video does not have this problem
			$scope.seek(t, true);
		}
	}

	function seek(t, intentionalStall, defer) {
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
				youTubePlayerManager.pause($scope.videoNode.id); // pause before seek, otherwise YT keeps yammering on during the buffering phase
				youTubePlayerManager.seekTo($scope.videoNode.id, t, true);
				youTubePlayerManager.pause($scope.videoNode.id); // and pause afterwards too, because YT always autoplays after seek
				if (wasPlaying) {
					youTubePlayerManager.play($scope.videoNode.id);
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
	}

	function setSpeed(speed) {
		// console.log("VIDEO SPEED=", speed);
		if (speed <= 0) {
			// console.error("videoController doesn't handle reverse speeds...");
			return;
		}
		if ($scope.videoType === 'youtube') {
			// TODO (youtube doesn't seem to support this yet, or else we're not encoding the videos properly for it)
			// console.log("Available speeds from youtube: ", _YTPlayer.getAvailablePlaybackRates());
		} else {
			$scope.videoNode.playbackRate = speed;
		}
	}

	function currentTime() {
		if ($scope.videoType === 'youtube') {
			return youTubePlayerManager.getCurrentTime($scope.videoNode.id);
		} else {
			return $scope.videoNode.currentTime;
		}
	}

	function toggleMute() {
		// console.log("toggleMute");
		if ($scope.videoType === 'youtube') {
			if (youTubePlayerManager.isMuted($scope.videoNode.id)) {
				youTubePlayerManager.unMute($scope.videoNode.id);
			} else {
				youTubePlayerManager.mute($scope.videoNode.id);
			}
		} else {
			$scope.videoNode.muted = !($scope.videoNode.muted);
		}
	}

	function setVolume(vol) { // 0..100
		if ($scope.videoType === 'youtube') {
			youTubePlayerManager.setVolume($scope.videoNode.id, vol);
		} else {
			$scope.videoNode.volume = (vol / 100);
		}
	}

	function _destroyMe() {
		//_destroyWatcher();
		$interval.cancel(_babysitter);
		$timeout.cancel($scope.stallGracePeriod);
		timelineSvc.unregisterVideo();
		if ($scope.videoType === 'youtube') {
			if (_YTPlayer) {
				_YTPlayer = undefined;
			}
		} else {
			if ($scope.videoNode) {
				// Overkill, because TS-813
				$scope.videoNode.removeEventListener('playing', _eventListeners.playing);
				$scope.videoNode.removeEventListener('pause', _eventListeners.pause);
				$scope.videoNode.pause();
				$scope.videoNode.src = "";
				$scope.videoNode.remove();
				delete $scope.videoNode;
			}
		}
	}

	$scope.$on('$destroy', _destroyMe);
}
