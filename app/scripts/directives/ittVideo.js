'use strict';
angular.module('com.inthetelling.story')
	.directive('ittVideo', ittVideo);

function ittVideo() {
	return {
		replace: false,
		templateUrl: 'templates/video.html',
		scope: {
			poster: "=?",
			mainPlayer: '=',
			mediaSrcArr: '=',
			playerId: '='
		},
		controller: ['$scope', '$timeout', '$interval', '$sce', '$rootScope', '$routeParams', 'playbackService', 'ittUtils', 'timelineSvc', 'modelSvc', 'dataSvc', 'appState', videoCtrl],
		bindToController: true,
		controllerAs: '$ctrl'
	};

	//TODO: tackle isTranscoded somehow.
	function videoCtrl($scope, $timeout, $interval, $sce, $rootScope, $routeParams, playbackService, ittUtils, timelineSvc, modelSvc, dataSvc, appState) {
		var ctrl = this; //jshint ignore:line

		//controller public properties
		ctrl.isTranscoded = false;
		ctrl.transcodedInterval = angular.noop;

		//controller public methods.
		ctrl.playbackService = playbackService;
		ctrl.videoClick = videoClick;
		ctrl.playerIsPaused = playerIsPaused;
		ctrl.showUnstartedOverlay = showUnstartedOverlay;
		ctrl.showReplayOverlay = showReplayOverlay;
		ctrl.setCssClass = setCssClass;
		ctrl.showMask = showMask;
		ctrl.appState = appState;
		var _existy = ittUtils.existy;

		//controller event bindings
		$rootScope.$on('userKeypress.SPACE', videoClick);
		$scope.$on('$destroy', onDestroy);

		onInit();

		function onInit() {
			//empty input passed in
			if (ctrl.mediaSrcArr.length === 0) {
				console.warn('No MediaSrc Array was passed to ittVideo');
				//check to see if video has transcoded every 10 seconds
				ctrl.transcodedInterval = $interval(checkTranscoded, 10 * 1000);
				return;
			}

			playbackService.seedPlayer(ctrl.mediaSrcArr, ctrl.playerId, ctrl.mainPlayer);
			ctrl.playerElement = $sce.trustAsHtml(playbackService.getPlayerDiv(ctrl.playerId));

			$timeout(function() {
				playbackService.createInstance(ctrl.playerId);

				if ($routeParams.t && ctrl.mainPlayer === true) {
					playbackService.setMetaProp('startAtTime', ittUtils.parseTime($routeParams.t), ctrl.playerId);
				}

			},0);
		}

		//video mask controls
		function videoClick() {
			var state = playbackService.getPlayerState(ctrl.playerId);

			if (state === 'ended') {
				timelineSvc.restartEpisode();
				return;
			}

			if (state === 'paused' || state === 'unstarted' || state === 'video cued' || state === 'player ready') {
				playbackService.play(ctrl.playerId);
			} else {
				playbackService.pause(ctrl.playerId);
			}
		}

		function setCssClass() {
			var cssClass = {};
			var embed = {'np--embed': ctrl.mainPlayer === false};
			var paused = {'play': playerIsPaused()};
			var firstplay  = {'firstplay': showUnstartedOverlay()};
			var replay = {'rewind': showReplayOverlay()};
			angular.extend(cssClass, embed, paused, firstplay, replay);
			return cssClass;
		}

		//if have less than iOS 10
		//if our video is youtube
		//hide the unstarted mask
		function showMask() {
			if (_existy(appState.iOSVersion) && appState.iOSVersion.length && playbackService.getMetaProp('videoType', ctrl.playerId) === 'youtube') {
				if (showUnstartedOverlay()) {
					return (appState.iOSVersion[0] > 9);
				}
			}
			return true;
		}

		function playerIsPaused() {
			return playbackService.getPlayerState(ctrl.playerId) === 'paused' && !showReplayOverlay();
		}

		function showUnstartedOverlay() {
			return playbackService.getMetaProp('hasBeenPlayed', ctrl.playerId) === false;
		}

		function showReplayOverlay() {
			var time = playbackService.getMetaProp('time', ctrl.playerId);
			var duration = playbackService.getMetaProp('duration', ctrl.playerId);
			return (ctrl.mainPlayer === true && time > 0 && time >= duration - 0.3);
		}

		function onDestroy() {
			playbackService.handle$Destroy(ctrl.playerId);
		}

		function checkTranscoded() {
			var currentEpisode = modelSvc.episodes[appState.episodeId];
			if (currentEpisode && currentEpisode.masterAsset && !modelSvc.isTranscoded(currentEpisode.masterAsset)) {

				dataSvc.getSingleAsset(currentEpisode.master_asset_id)
					.then(function(latestAsset) {
						modelSvc.cache('asset', latestAsset);
						var newAsset = modelSvc.assets[latestAsset._id];
						if (modelSvc.isTranscoded(newAsset)) {
							ctrl.isTranscoded = true;
							$interval.cancel(ctrl.transcodedInterval);
							//use the new mediaSrcArr from the server
							ctrl.mediaSrcArr = newAsset.mediaSrcArr;
							//do this so playerController re-initializes the episode.
							$rootScope.$broadcast('dataSvc.getEpisode.done');
							//re-init ittVideo, playbackService etc..
							onInit();
						}
					});
			} else {
				$interval.clear(ctrl.transcodedInterval);
			}
		}
	}
}
