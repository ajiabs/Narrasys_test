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
			videoUrl: '=',
			playerId: '='
		},
		controller: ['playbackService', 'playbackState', 'appState', 'timelineSvc', 'youtubeSvc', videoCtrl],
		bindToController: true,
		controllerAs: '$ctrl',
		link: link
	};

	//TODO: tackle isTranscoded somehow.
	function videoCtrl(playbackService, playbackState, appState, timelineSvc, youtubeSvc) {
		var ctrl = this;
		ctrl.playbackState = playbackState;
		ctrl.appState = appState;
		ctrl.videoClick = videoClick;
		ctrl.isTranscoded = isTranscoded;

		onInit();


		function onInit() {
			var urlInfo = _parseVideoUrl(ctrl.videoUrl, ctrl.mainPlayer);

			ctrl.videoDuration = urlInfo.videoDuration;
			ctrl.useMask = urlInfo.useMask;
			ctrl.parsedSrc = urlInfo.parsedSrc;
			ctrl.videoType = urlInfo.videoType;

			console.log('urlInfo', urlInfo, ctrl.playerId);
			playbackService.setPlayer(urlInfo.videoType, ctrl.playerId);
		}

		function videoClick() {
			if (playbackState.getTimelineState() === "paused") {
				timelineSvc.play();
			} else {
				timelineSvc.pause();
			}
		}

		function isTranscoded() {
			return true;
		}


		/**
		 *
		 * @param {String} url
		 * @param {Boolean} mainPlayer
		 * @return {Object} Object with useMask, videoType, parsedSrc, videoDuration properties
		 * @description parses the input video URL and returns an object which can be used to bind to the scope
		 * @private
		 */
		function _parseVideoUrl(url, mainPlayer) {
			var videoType, useMask, parsedSrc, vidDuration;
			//URL is a string (must be an embed video), see if it's from youtube
			if (Object.prototype.toString.call(url) === '[object String]') {
				if (youtubeSvc.isYoutubeUrl(url)) {
					videoType = 'youtube';
					useMask = false;
					console.log('embed!!');
				} else {
					videoType = 'html5';
					useMask = true;
				}
				parsedSrc = url;
			} else {
				//settings only necessary for main video
				if (mainPlayer) {
					useMask = true;
					//URL, as an object, should have a duration property set earlier in the modelSvc
					vidDuration = url.duration;
				}
				//URL must be an object, derive type of source by looking at urls array
				if (url.urls.youtube && url.urls.youtube.length) {
					videoType = 'youtube';
					parsedSrc = url.urls.youtube[0];
				} else {
					videoType = 'html5';
					console.log('html5 vid!', videoType);
					parsedSrc = url.urls;
				}
			}
			return {
				useMask: useMask,
				videoType: videoType,
				parsedSrc: parsedSrc,
				videoDuration: vidDuration
			}
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
