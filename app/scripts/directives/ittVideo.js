'use strict';
angular.module('com.inthetelling.story')
	.directive('ittVideo', ittVideo);

function ittVideo(playbackState) {
	return {
		replace: false,
		templateUrl: 'templates/video.html',
		scope: {
			poster: "=?",
			mainPlayer: '=',
			mediaSrcArr: '=',
			playerId: '='
		},
		controller: ['$timeout', '$sce', '$rootScope', '$routeParams', 'playbackService', 'playbackState', 'appState', 'ittUtils', videoCtrl],
		bindToController: true,
		controllerAs: '$ctrl',
		link: link
	};

	//TODO: tackle isTranscoded somehow.
	function videoCtrl($timeout, $sce, $rootScope, $routeParams, playbackService, playbackState, appState, ittUtils) {
		var ctrl = this; //jshint ignore:line
		ctrl.playbackState = playbackState;
		ctrl.appState = appState;
		ctrl.videoClick = videoClick;
		ctrl.isTranscoded = isTranscoded;
		ctrl.playerIsPaused = playerIsPaused;

		$rootScope.$on('userKeypress.SPACE', videoClick);

		onInit();

		function onInit() {

			playbackService.seedPlayer(ctrl.mediaSrcArr, ctrl.playerId, ctrl.mainPlayer);
			ctrl.playerElement = $sce.trustAsHtml(playbackService.getPlayerDiv(ctrl.playerId));
			$timeout(function() {
				playbackService.createInstance(ctrl.playerId);

				if ($routeParams.t && ctrl.mainPlayer === true) {
					console.log('time param', $routeParams.t);

					playbackState.setStartAtTime(ittUtils.parseTime($routeParams.t), ctrl.playerId);
				}

			},0);

		}

		function playerIsPaused() {
			return playbackService.getPlayerState(ctrl.playerId) === 'paused';
		}

		function videoClick() {

			var state = playbackService.getPlayerState(ctrl.playerId);
			if (state === 'paused' || state === 'unstarted' || state === 'video cued') {
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

		scope.$on('$destroy', playbackState.reset);
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
