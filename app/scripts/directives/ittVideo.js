'use strict';
angular.module('com.inthetelling.story')
	.directive('ittVideo', ittVideo);

function ittVideo($interval, $rootScope, appState, dataSvc, modelSvc) {
	return {
		replace: false,
		templateUrl: 'templates/video.html',
		scope: {
			poster: "=?",
			mainPlayer: '=',
			mediaSrcArr: '=',
			playerId: '='
		},
		controller: ['$timeout', '$sce', 'playbackService', 'playbackState', 'appState', videoCtrl],
		bindToController: true,
		controllerAs: '$ctrl',
		link: link
	};

	//TODO: tackle isTranscoded somehow.
	function videoCtrl($timeout, $sce, playbackService, playbackState, appState) {
		var ctrl = this;
		ctrl.playbackState = playbackState;
		ctrl.appState = appState;
		ctrl.videoClick = videoClick;
		ctrl.isTranscoded = isTranscoded;
		ctrl.playerIsPaused = playerIsPaused;

		onInit();

		function onInit() {

			playbackService.setPlayer(ctrl.mediaSrcArr, ctrl.playerId, ctrl.mainPlayer);

			ctrl.playerElement = $sce.trustAsHtml(playbackService.getPlayerDiv(ctrl.playerId));


			$timeout(function() {
				playbackService.createInstance(ctrl.playerId);
			},0);

		}

		function playerIsPaused() {
			return playbackService.getPlayerState(ctrl.playerId) === 'paused';
		}

		function videoClick() {
			console.log('videoClick');
			var state = playbackService.getPlayerState(ctrl.playerId);

			if (state === 'paused' || state === 'unstarted') {
				playbackService.play(ctrl.playerId);
			} else {
				playbackService.pause(ctrl.playerId);
			}
		}

		function isTranscoded() {
			return true;
		}
	}

	function link(scope) {
		scope.spaceWatcher = $rootScope.$on('userKeypress.SPACE', scope.videoClick);
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
			$interval.cancel(scope.pollInterval);
		});
	}
}
