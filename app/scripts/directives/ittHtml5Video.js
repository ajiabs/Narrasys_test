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
			'<source class="m3u8" ng-if="ittHtml5Video.urls.m3u8[0]" ng-src="{{ittHtml5Video.m3u8[0]}}" type="application/x-mpegURL" />',
			'<source class="mpeg4" ng-if="ittHtml5Video.urls.mp4[ittHtml5Video.curStream]" ng-src="{{ittHtml5Video.urls.mp4[ittHtml5Video.curStream]}}" type="video/mp4" />',
			'<source class="webm" ng-if="ittHtml5Video.urls.webm[ittHtml5Video.curStream]" ng-src="{{ittHtml5Video.urls.webm[ittHtml5Video.curStream]}}" type="video/webm" />',
					'</video>',
					'<div class="embedMask" ng-class="{ play: ittHtml5Video.showOverlay() }"></div>',
				'</div>'
			].join(''),
			scope: {
				src: '&',
				playerId: '@'
			},
			controller: 'ittHtml5VideoCtrl',
			controllerAs: 'ittHtml5Video',
			bindToController: true
		};
	}

	function ittHtml5VideoCtrl($timeout, html5PlayerManager, appState) {
		var ctrl = this; // jshint ignore:line

		ctrl.overlay = true;
		ctrl.togglePlayback = togglePlayback;
		ctrl.showOverlay = showOverlay;
		ctrl.curStream = (appState.isTouchDevice ? 0 : 1);

		$timeout(function(){
			html5PlayerManager.create(ctrl.playerId);
		},0);

		_handleSrcUrl();

		function _handleSrcUrl() {
			//a single source url, determine video type and format as our url obj.
			ctrl.urls = ctrl.src();
			if (typeof ctrl.urls === 'string') {
				if (ctrl.urls.match(/.webm/) || ctrl.urls.match(/.mp4/) || ctrl.urls.match(/.m3u8/)) { //allowed formats
					//duplicate ctrl.src in arrays to ensure playback regardless of curStream
					switch(true) {
						case /.webm/.test(ctrl.urls):
							ctrl.urls = {webm: [ctrl.urls, ctrl.urls]};
							break;
						case /.mp4/.test(ctrl.urls):
							ctrl.urls = {mp4: [ctrl.urls, ctrl.urls]};
							break;
						case /.m3u8/.test(ctrl.urls):
							ctrl.urls = {m3u8: [ctrl.urls, ctrl.urls]};
					}
				}
			}
		}

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
