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
		controller: ['$scope', '$timeout', '$sce', '$rootScope', '$routeParams', 'playbackService', 'ittUtils', 'timelineSvc', videoCtrl],
		bindToController: true,
		controllerAs: '$ctrl'
	};

	//TODO: tackle isTranscoded somehow.
	function videoCtrl($scope, $timeout, $sce, $rootScope, $routeParams, playbackService, ittUtils, timelineSvc) {
		var ctrl = this; //jshint ignore:line
		ctrl.playbackService = playbackService;
		ctrl.videoClick = videoClick;
		ctrl.isTranscoded = function() { return true; };
		ctrl.playerIsPaused = playerIsPaused;
		ctrl.showUnstartedOverlay = showUnstartedOverlay;
		ctrl.showReplayOverlay = showReplayOverlay;

		$rootScope.$on('userKeypress.SPACE', videoClick);
		$scope.$on('$destroy', saveLastPlayerState);

		onInit();

		function onInit() {

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

			if (state === 'paused' || state === 'unstarted' || state === 'video cued') {
				playbackService.play(ctrl.playerId);
			} else {
				playbackService.pause(ctrl.playerId);
			}
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

		function saveLastPlayerState() {
			playbackService.startAtTime(ctrl.playerId);
		}
	}
}
