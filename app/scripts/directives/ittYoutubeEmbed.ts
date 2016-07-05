/**
 * Created by githop on 12/7/15.
 */
import {IPlayer} from '../interfaces/IPlayer';
/**
 * @ngdoc directive
 * @name iTT.directive:ittYoutube
 * @restrict 'EA'
 * @scope
 * @description
 * Directive used to render the actual youtube iframe and link
 * YT instances with the youTubePlayerManager service
 * {@link https://github.com/InTheTelling/client/blob/master/app/scripts/directives/ittYoutubeEmbed.js source}
 * @requires $timeout
 * @requires $scope
 * @requires iTT.service:youTubePlayerManager
 * @requires youtubeSvc
 * @param {String} embedUrl The URL to the youtube video
 * @param {Function=} onPlayerStateChange Callback used to control player state
 * @param {Function=} onPlayerQualityChange Callback used to change player quality
 * @param {Function=} onReady Callback fired when YT instance is ready
 * @param {Boolean} mainPlayer Set to false for embed players
 * @param {String} playerId ID, either main video asset ID or event ID, used to set PID of YT Instance inside _players Object
 * @example
 * <pre>
 *     //for the main player
 *     <itt-youtube embed-url="path/to/url" main-player="true" player-id="<ID>"></itt-youtube>
 * </pre>
 */
// angular.module('com.inthetelling.story')
// 	.directive('ittYoutube', ittYoutube)
// 	.controller('ittYoutubeCtrl', ittYoutubeCtrl);

export function ittYoutube() {
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
ittYoutubeCtrl.$inject = ['$timeout', '$scope', 'youTubePlayerManager', 'youtubeSvc'];
export function ittYoutubeCtrl($timeout: ng.ITimeoutService, $scope: ng.IScope, youTubePlayerManager: IPlayer, youtubeSvc) {
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
		.then(function (divId) {
			_ctrl.embedId = divId;

			$timeout(function () {
				youTubePlayerManager.create(divId, _playerId, _ctrl.ytVideoID, _ctrl.onPlayerStateChange, _ctrl.onPlayerQualityChange, _ctrl.onReady);
			}, 0);
		});


	$scope.$on('$destroy', function () {
		youTubePlayerManager.destroy(_ctrl.embedId);
	});
}
