/**
 * Created by githop on 1/25/16.
 */

(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittHtml5Video', ittHtml5Video)
		.controller('ittHtml5VideoCtrl', ittHtml5VideoCtrl);

	var STATES = {
		'-1': 'unstarted',
		'0': 'ended',
		'1': 'playing',
		'2': 'paused',
		'3': 'buffering',
		'5': 'video cued'
	};

	function ittHtml5Video() {
		return {
			restrict: 'EA',
			template:[
				'<div ng-click="ittHtml5Video.togglePlayback($event)">',
					'<video class="html5Embed" id="{{ittHtml5Video.playerId}}">',
						'<source class="mpeg4" ng-src="{{ittHtml5Video.src}}" type="video/mp4"/>',
					'</video>',
					'<div class="embedMask" ng-class="{ play: ittHtml5Video.showOverlay() }"></div>',
				'</div>'
			].join(''),
			scope: {
				src: '@',
				playerId: '@'
			},
			controller: 'ittHtml5VideoCtrl',
			controllerAs: 'ittHtml5Video',
			bindToController: true
		};
	}

	function ittHtml5VideoCtrl($timeout, html5PlayerManager) {
		var ctrl = this; // jshint ignore:line

		ctrl.overlay = true;
		ctrl.togglePlayback = togglePlayback;
		ctrl.showOverlay = showOverlay;

		$timeout(function(){
			html5PlayerManager.create(ctrl.playerId);
		},0);

		function showOverlay() {
			var playerState = STATES[parseInt(html5PlayerManager.getPlayerState(ctrl.playerId))];
			var value = (playerState === 'unstarted' || playerState === 'paused');
			return value;
		}

		function togglePlayback() {
			var playerState = STATES[parseInt(html5PlayerManager.getPlayerState(ctrl.playerId))];

			if (playerState === 'unstarted' || playerState === 'paused') {
				html5PlayerManager.play(ctrl.playerId);
				ctrl.overlay = false;
			} else {
				html5PlayerManager.pause(ctrl.playerId);
				ctrl.overlay = true;
			}
		}

	}



})();
