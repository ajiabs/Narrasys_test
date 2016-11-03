/**
 * Created by githop on 12/7/15.
 */

(function() {
	'use strict';
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
	 * @param {String} videoUrl The URL to the youtube video
	 * @param {Boolean} mainPlayer Whether or not the player is to be used as the main video or embed.
	 * @param {String} playerId ID either main video asset ID or event ID, used to set PID of YT Instance inside _players Object
	 * @example
	 * <pre>
	 *     //for the main player
	 *     <itt-youtube video-url="path/to/url" main-player="true" player-id="<ID>"></itt-youtube>
	 * </pre>
	 */
	angular.module('com.inthetelling.story')
		.directive('ittYoutube', ittYoutube)
		.controller('ittYoutubeCtrl', ittYoutubeCtrl);

	function ittYoutube() {
		return {
			restrict: 'EA',
			template: '<div id="{{$ctrl.embedId}}"></div>',
			scope: {
				videoUrl: '@',
				mainPlayer: '=',
				playerId: '='
			},
			controller: 'ittYoutubeCtrl',
			controllerAs: '$ctrl',
			bindToController: true
		};
	}

	function ittYoutubeCtrl($scope, youTubePlayerManager, youtubeSvc) {
		var ctrl = this;  //jshint ignore:line

		ctrl.ytVideoID = youtubeSvc.extractYoutubeId(ctrl.videoUrl);
		ctrl.embedId = youTubePlayerManager.setPlayerId(ctrl.playerId, ctrl.mainPlayer);
		youTubePlayerManager.create(ctrl.embedId, ctrl.playerId, ctrl.ytVideoID);

		$scope.$on('$destroy', function() {
			youTubePlayerManager.destroy(ctrl.embedId);
		});
	}

})();
