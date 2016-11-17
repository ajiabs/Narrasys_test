// /**
//  * Created by githop on 1/25/16.
//  */
//
// (function () {
// 	'use strict';
// 	/**
// 	 * @ngdoc directive
// 	 * @name iTT.directive:ittHtml5Video
// 	 * @restrict 'EA'
// 	 * @scope
// 	 * @description
// 	 * Directive used to render html5 videos
// 	 * @requires $timeout
// 	 * @requires iTT.service:html5PlayerManager
// 	 * @requires iTT.service:appState
// 	 * @param {String | Object} videoUrl The URL to the youtube video. can be a string (for embeds), or an object (for the main video).
// 	 * @param {Boolean} mainPlayer Whether or not the player is to be used as the main video or embed.
// 	 * @param {String} playerId ID either main video asset ID or event ID
// 	 * @example
// 	 * <pre>
// 	 *     //for the main player
// 	 *     <itt-html5-video video-url="<OBJECT or URL>" main-player=true player-id="<ID>"></itt-html5-video>
// 	 * </pre>
// 	 *
// 	 */
// 	angular.module('com.inthetelling.story')
// 		.directive('ittHtml5Video', ittHtml5Video)
// 		.controller('ittHtml5VideoCtrl', ittHtml5VideoCtrl);
//
// 	var STATES = {
// 		'-1': 'unstarted',
// 		'0': 'ended',
// 		'1': 'playing',
// 		'2': 'paused',
// 		'3': 'buffering',
// 		'5': 'video cued'
// 	};
//
// 	function ittHtml5Video() {
// 		return {
// 			restrict: 'EA',
// 			template: [
// 				'<div ng-click="$ctrl.togglePlayback($event)">',
// 				'	<div class="embedMask" ng-if="!$ctrl.mainPlayer" ng-class="{ play: $ctrl.showOverlay() }"></div>',
// 				'	<video class="html5Embed" id="{{$ctrl.playerId}}">',
// 				'		<source class="m3u8" ng-if="$ctrl.urls.m3u8[0]" ng-src="{{$ctrl.m3u8[0]}}" type="application/x-mpegURL" />',
// 				'		<source class="mpeg4" ng-if="$ctrl.urls.mp4[$ctrl.curStream]" ng-src="{{$ctrl.urls.mp4[$ctrl.curStream]}}" type="video/mp4" />',
// 				'		<source class="webm" ng-if="$ctrl.urls.webm[$ctrl.curStream]" ng-src="{{$ctrl.urls.webm[$ctrl.curStream]}}" type="video/webm" />',
// 				'		<source class="mp3" ng-if="$ctrl.urls.mp3[$ctrl.curStream]" ng-src="{{$ctrl.urls.mp3[$ctrl.curStream]}}" type="audio/mpeg" />',
// 				'		<p>Oh no! Your browser does not support the HTML5 Video element.</p>',
// 				'	</video>',
// 				'</div>'
// 			].join(''),
// 			scope: {
// 				videoUrl: '=',
// 				mainPlayer: '=',
// 				playerId: '='
// 			},
// 			controller: 'ittHtml5VideoCtrl',
// 			controllerAs: '$ctrl',
// 			bindToController: true
// 		};
// 	}
//
// 	function ittHtml5VideoCtrl($timeout, html5PlayerManager, appState) {
// 		var ctrl = this; // jshint ignore:line
//
// 		ctrl.overlay = true;
// 		ctrl.togglePlayback = togglePlayback;
// 		ctrl.showOverlay = showOverlay;
// 		ctrl.curStream = (appState.isTouchDevice ? 0 : 1);
//
// 		$timeout(function () {
// 			html5PlayerManager.create(ctrl.playerId, ctrl.mainPlayer);
// 		}, 0);
//
// 		function stateChange(state) {
// 			console.log('embed player', state);
// 		}
//
// 		_handleSrcUrl();
//
// 		function _handleSrcUrl() {
// 			//a single source url, determine video type and format as our url obj.
// 			ctrl.urls = ctrl.videoUrl;
//
// 			if (typeof ctrl.urls === 'string') {
// 				if (ctrl.urls.match(/.webm/) || ctrl.urls.match(/.mp4/) || ctrl.urls.match(/.m3u8/) || ctrl.urls.match(/.mp3/)) { //allowed formats
// 					//duplicate ctrl.src in arrays to ensure playback regardless of curStream
// 					switch (true) {
// 						case /.webm/.test(ctrl.urls):
// 							ctrl.urls = {webm: [ctrl.urls, ctrl.urls]};
// 							break;
// 						case /.mp4/.test(ctrl.urls):
// 							ctrl.urls = {mp4: [ctrl.urls, ctrl.urls]};
// 							break;
// 						case /.m3u8/.test(ctrl.urls):
// 							ctrl.urls = {m3u8: [ctrl.urls, ctrl.urls]};
// 							break;
// 						case /.mp3/.test(ctrl.urls):
// 							ctrl.urls = {mp3: [ctrl.urls, ctrl.urls]};
// 							break;
// 					}
// 				}
// 			}
// 		}
//
// 		function showOverlay() {
// 			var playerState = STATES[parseInt(html5PlayerManager.getPlayerState(ctrl.playerId))];
// 			var value = (playerState === 'unstarted' || playerState === 'paused');
// 			return value;
// 		}
//
// 		function togglePlayback(ev) {
// 			var playerState = STATES[parseInt(html5PlayerManager.getPlayerState(ctrl.playerId))];
// 			console.log('state', playerState);
// 			if (playerState === 'unstarted' || playerState === 'paused') {
// 				html5PlayerManager.play(ctrl.playerId);
// 				ctrl.overlay = false;
// 			} else {
// 				html5PlayerManager.pause(ctrl.playerId);
// 				ctrl.overlay = true;
// 			}
// 		}
//
// 	}
//
//
// })();
