/**
 * Created by githop on 12/7/15.
 */

(function() {
	'use strict';
	angular.module('com.inthetelling.story')
		.directive('ittYoutube', ittYoutube)
		.controller('ittYoutubeCtrl', ittYoutubeCtrl);

	function ittYoutube() {
		return {
			restrict: 'EA',
			template: '<div id="{{ittYoutubeCtrl.embedId}}"></div>',
			scope: {
				embedUrl: '@',
				onPlayerStateChange: '=?',
				onPlayerQualityChange: '=?',
				onReady: '=?',
				mainPlayer: '&',
				playerId: '&'
			},
			controller: 'ittYoutubeCtrl',
			controllerAs: 'ittYoutubeCtrl',
			bindToController: true
		};
	}

	function ittYoutubeCtrl($timeout, $scope, youTubePlayerManager, youtubeSvc) {
		var _ctrl = this;  //jshint ignore:line
		_ctrl.isMainPlayer = _ctrl.mainPlayer();
		_ctrl.ytVideoID = youtubeSvc.extractYoutubeId(_ctrl.embedUrl);
		var _playerId = _ctrl.playerId();

		if (_ctrl.onPlayerStateChange === undefined) {
			_ctrl.onPlayerStateChange = angular.noop;
		}

		if (_ctrl.onReady === undefined) {
			_ctrl.onReady = angular.noop;
		}

		if (_ctrl.onPlayerQualityChange === undefined) {
			_ctrl.onPlayerQualityChange = angular.noop;
		}

		youTubePlayerManager.setPlayerId(_playerId, _ctrl.mainPlayer())
			.then(function(divId) {
				_ctrl.embedId = divId;

				$timeout(function() {
					youTubePlayerManager.create(divId, _playerId, _ctrl.ytVideoID, _ctrl.onPlayerStateChange, _ctrl.onPlayerQualityChange, _ctrl.onReady);
				}, 0);
			});


		$scope.$on('$destroy', function() {
			youTubePlayerManager.destroy(_ctrl.embedId);
		});
	}

})();
