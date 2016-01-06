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
				embedId: '@',
				onPlayerStateChange: '=?',
				onReady: '=?'
			},
			controller: ittYoutubeCtrl,
			controllerAs: 'ittYoutubeCtrl',
			bindToController: true
		};

		function ittYoutubeCtrl($timeout, youTubePlayerManager) {
			var _ctrl = this;  //jshint ignore:line
			if (_ctrl.onPlayerStateChange === undefined) {
				_ctrl.onPlayerStateChange = angular.noop;
			}

			if (_ctrl.onReady === undefined) {
				_ctrl.onReady = angular.noop;
			}

			$timeout(function() {
				youTubePlayerManager.create(_ctrl.embedId, _ctrl.embedUrl, _ctrl.onPlayerStateChange, angular.noop, _ctrl.onReady);
			}, 0);


		}

	}

})();
