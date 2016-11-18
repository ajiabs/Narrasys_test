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
		controller: ['$timeout', '$sce', '$rootScope', '$routeParams', 'playbackService', 'playbackState', 'appState', 'ittUtils', 'timelineSvc', videoCtrl],
		bindToController: true,
		controllerAs: '$ctrl',
		link: link
	};

	//TODO: tackle isTranscoded somehow.
	function videoCtrl($timeout, $sce, $rootScope, $routeParams, playbackService, playbackState, appState, ittUtils, timelineSvc) {
		var ctrl = this; //jshint ignore:line
		ctrl.playbackState = playbackState;
		ctrl.appState = appState;
		ctrl.videoClick = videoClick;
		ctrl.isTranscoded = function() { return true; };
		ctrl.playerIsPaused = playerIsPaused;
		ctrl.showUnstartedOverlay = showUnstartedOverlay;
		ctrl.showReplayOverlay = showReplayOverlay;

		$rootScope.$on('userKeypress.SPACE', videoClick);

		onInit();

		function onInit() {

			playbackService.seedPlayer(ctrl.mediaSrcArr, ctrl.playerId, ctrl.mainPlayer);
			ctrl.playerElement = $sce.trustAsHtml(playbackService.getPlayerDiv(ctrl.playerId));
			$timeout(function() {
				playbackService.createInstance(ctrl.playerId);

				if ($routeParams.t && ctrl.mainPlayer === true) {
					playbackState.setStartAtTime(ittUtils.parseTime($routeParams.t), ctrl.playerId);
				}

			},0);

		}

		//video mask controls
		function playerIsPaused() {
			return playbackService.getPlayerState(ctrl.playerId) === 'paused' && !showReplayOverlay();
		}

		function videoClick() {
			var state = playbackService.getPlayerState(ctrl.playerId);

			if (state === 'ended') {
				timelineSvc.restartEpisode();
				return;
			}



			if (state === 'paused' || state === 'unstarted' || state === 'video cued') {
				playbackService.play(ctrl.playerId);
			} else {
				playbackService.pause(ctrl.playerId);
			}
		}

		function showUnstartedOverlay() {
			return playbackState.getHasBeenPlayed(ctrl.playerId) === false;
		}

		function showReplayOverlay() {
			return (playbackState.getTime() > 0 && playbackState.getTime() >= playbackState.getDuration() - 0.3);
		}


	}

	function link(scope) {
        //TODO: figure out if this is a good place to be calling reset
		scope.$on('$destroy', function() {
			if (scope.mainPlayer) {
				// playbackState.reset();
				console.log('ittVideo $destroyed');
			}
		});
		// scope.spaceWatcher = $rootScope.$on('userKeypress.SPACE', scope.videoClick);
		// // if the video is not yet transcoded poll for updates until it is
		// var pollCount = 0;
		// scope.pollInterval = $interval(function () {
		// 	pollCount++;
		// 	if (pollCount > 360) {
		// 		$interval.cancel(scope.pollInterval); // Give up after an hour, the user certainly will have
		// 	}
		// 	var currentEpisode = modelSvc.episodes[appState.episodeId];
        //
		// 	if (currentEpisode && currentEpisode.masterAsset && !modelSvc.isTranscoded(currentEpisode.masterAsset)) {
		// 		dataSvc.getSingleAsset(currentEpisode.master_asset_id).then(function (latestAsset) {
        //
		// 			if (modelSvc.isTranscoded(latestAsset)) {
		// 				$interval.cancel(scope.pollInterval);
		// 				modelSvc.cache('asset', latestAsset);
		// 			}
		// 		});
		// 	} else {
		// 		$interval.cancel(scope.pollInterval);
		// 	}
		// }, 10000);

		// scope.$on('$destroy', function () {
		// 	scope.spaceWatcher();
		// 	$interval.cancel(scope.pollInterval);
		// });
	}
}
