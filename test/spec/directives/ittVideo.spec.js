///**
// * Created by githop on 1/8/16.
// */
//(function() {
//	'use strict';
//
//	describe('Directive Controller: ittVideo', function() {
//		beforeEach(module('com.inthetelling.story'));
//		var scope, compile;
//		var masterAsset = {
//			"_id": "55e6128627f858004e002826",
//			"_type": "Asset::Video",
//			"container_id": "55db5fd041f6dfbddf00154e",
//			"user_id": "52e6c809c9b715e92b000007",
//			"filename": "3580f76b-1146-4d40-8252-cff885beca01",
//			"original_filename": "KELL_Accounting Intro_FC_Final.mp4",
//			"extension": "mp4",
//			"content_type": "video/mp4",
//			"size": null,
//			"name": {
//				"en": "KELL Accounting Intro FC Final"
//			},
//			"description": {},
//			"url": "https://s3.amazonaws.com/itt.user.uploads/production/KISRb08Lc2tthMxLhFZEoQ/3580f76b-1146-4d40-8252-cff885beca01",
//			"episodes_count": 0,
//			"episode_poster_frames_count": 0,
//			"links_count": 0,
//			"annotations_count": 0,
//			"narratives_count": 0,
//			"timelines_count": 0,
//			"uploads_count": 0,
//			"plugins_count": 0,
//			"alternate_urls": [
//				"https://s3.amazonaws.com/itt.user.uploads/production/KISRb08Lc2tthMxLhFZEoQ/DqX0dXT5USEDHXUzwClUwQ.m3u8",
//				"https://s3.amazonaws.com/itt.user.uploads/production/KISRb08Lc2tthMxLhFZEoQ/DqX0dXT5USEDHXUzwClUwQ_416x234.webm",
//				"https://s3.amazonaws.com/itt.user.uploads/production/KISRb08Lc2tthMxLhFZEoQ/DqX0dXT5USEDHXUzwClUwQ_960x540.webm",
//				"https://s3.amazonaws.com/itt.user.uploads/production/KISRb08Lc2tthMxLhFZEoQ/DqX0dXT5USEDHXUzwClUwQ_416x234.mp4",
//				"https://s3.amazonaws.com/itt.user.uploads/production/KISRb08Lc2tthMxLhFZEoQ/DqX0dXT5USEDHXUzwClUwQ_960x540.mp4",
//				"https://www.youtube.com/embed/nxnNcS8FRB8"
//			],
//			"you_tube_url": null,
//			"frame_rate": "24000/1001",
//			"frame_rate_n": 24000,
//			"frame_rate_d": 1001,
//			"start_time": "0.000000",
//			"duration": "399.616000",
//			"width": 1280,
//			"height": 720,
//			"urls": {
//				"youtube": [
//					"//www.youtube.com/embed/nxnNcS8FRB8?enablejsapi=1&amp;controls=0&amp;modestbranding=1&amp;showinfo=0&amp;rel=0&amp;iv_load_policy=3&amp;wmode=transparent"
//				],
//				"mp4": [
//					"https://s3.amazonaws.com/itt.user.uploads/production/KISRb08Lc2tthMxLhFZEoQ/DqX0dXT5USEDHXUzwClUwQ_416x234.mp4?t=1452277268176",
//					"https://s3.amazonaws.com/itt.user.uploads/production/KISRb08Lc2tthMxLhFZEoQ/DqX0dXT5USEDHXUzwClUwQ_960x540.mp4?t=1452277268176"
//				],
//				"webm": [
//					"https://s3.amazonaws.com/itt.user.uploads/production/KISRb08Lc2tthMxLhFZEoQ/DqX0dXT5USEDHXUzwClUwQ_416x234.webm?t=1452277268176",
//					"https://s3.amazonaws.com/itt.user.uploads/production/KISRb08Lc2tthMxLhFZEoQ/DqX0dXT5USEDHXUzwClUwQ_960x540.webm?t=1452277268176"
//				]
//			},
//			"display_name": "KELL Accounting Intro FC Final"
//		};
//
//		var poster = undefined;
//
//		var directiveTemplate = '<div class="video contentLayer" itt-video="episode.masterAsset"></div>';
//
//		beforeEach(inject(function($rootScope, $compile) {
//			scope = $rootScope.$new();
//			compile = $compile;
//		}));
//
//
//		function createTestDirective() {
//			var element, compiled;
//			scope.episode = {masterAsset: masterAsset};
//			element = angular.element(directiveTemplate);
//			compiled = compile(element)(scope);
//			scope.$digest();
//			return compiled;
//		}
//
//		it('should be a thing', function() {
//			var el = createTestDirective();
//			//scope.$digest();
//			var ctrl = el.isolateScope();
//
//			ctrl.initVideo(el);
//			ctrl.play();
//
//
//			expect(ctrl.appState.timelineState).toBe(false);
//		});
//
//	});
//})();
//
//
