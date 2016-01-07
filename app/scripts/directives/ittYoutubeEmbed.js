/**
 * Created by githop on 12/7/15.
 */

(function() {
	'use strict';
	angular.module('com.inthetelling.story')
		.directive('ittYoutube', ittYoutube);

	function ittYoutube() {
		return {
			restrict: 'EA',
			template: '<div id="{{ittYoutubeCtrl.embedId}}"></div>',
			scope: {
				embedUrl: '@',
				onPlayerStateChange: '=?',
				onReady: '=?',
				mainPlayer: '=mainPlayer'
			},
			controller: ittYoutubeCtrl,
			controllerAs: 'ittYoutubeCtrl',
			bindToController: true
		};

		function ittYoutubeCtrl($timeout, youTubePlayerManager, youtubeSvc) {
			var _ctrl = this;  //jshint ignore:line
			var embedId;
			var isMainPlayer;
			_ctrl.ytVideoID = youtubeSvc.extractYoutubeId(_ctrl.embedUrl);


			if (_ctrl.onPlayerStateChange === undefined) {
				_ctrl.onPlayerStateChange = angular.noop;
			}

			if (_ctrl.onReady === undefined) {
				_ctrl.onReady = angular.noop;
			}

			if (angular.isDefined(_ctrl.mainPlayer)) {
				embedId = _ctrl.mainPlayer;
				isMainPlayer = true;
			} else {
				isMainPlayer = false;
				embedId = _ctrl.ytVideoID;
			}

			youTubePlayerManager.setPlayerId(embedId, isMainPlayer)
			.then(function(divId) {
				_ctrl.embedId = divId;

				$timeout(function() {
					youTubePlayerManager.create(divId, _ctrl.ytVideoID, _ctrl.onPlayerStateChange, angular.noop, _ctrl.onReady);
				}, 0);
			});

		}

	}

})();
