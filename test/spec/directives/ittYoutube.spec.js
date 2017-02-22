// /**
//  * Created by githop on 1/6/16.
//  */
//
// (function () {
// 	'use strict';
//
// 	describe('Directive: ittYoutube', function () {
// 		beforeEach(module('com.inthetelling.story'));
//
// 		var embedUrl = '//www.youtube.com/embed/6wKqH6vlGHU';
// 		var embedId = '568bf8746d571a053a000113';
// 		var mainPlayerTemplate = '<itt-youtube main-player="mainPlayerEmbed" player-id="mainPlayerId" embed-url="' + embedUrl + '"></itt-youtube>';
// 		var embedTemplate = '<itt-youtube embed-url="' + embedUrl + '"></itt-youtube>';
// 		var scope, compile;
//
// 		beforeEach(inject(function ($rootScope, $compile) {
// 			scope = $rootScope.$new();
// 			compile = $compile;
// 		}));
//
// 		function createTestDirective(template, main) {
// 			if (main) {
// 				scope.mainPlayerEmbed = true;
// 				scope.mainPlayerId = embedId;
// 			}
// 			var ittYoutubeElement, compiled;
// 			ittYoutubeElement = angular.element(template);
// 			compiled = compile(ittYoutubeElement)(scope);
// 			scope.$digest();
// 			return compiled;
// 		}
//
// 		describe('DOM results: ', function() {
// 			describe('case: the main embed player. (with the main-player attribute)', function() {
// 				it('should create a player div and set the ID with the value passed from main-player param', function() {
//
// 					var el = createTestDirective(mainPlayerTemplate, true);
//
// 					var playerDiv = el.html();
// 					var renderedTemplate = '<div id="' + embedId + '"></div>';
//
// 					expect(playerDiv).toBe(renderedTemplate);
// 				});
// 			});
//
// 			describe('case: an embed player. (main-player attribute omitted)', function() {
//
// 				var first, second, _ctrl0, _ctrl1;
// 				beforeEach(function() {
// 					var el0  = createTestDirective(embedTemplate, false);
// 					var el1 = createTestDirective(embedTemplate, false);
// 					_ctrl0 = el0.isolateScope().ittYoutubeCtrl;
// 					_ctrl1 = el0.isolateScope().ittYoutubeCtrl;
// 					first = el0.html();
// 					second = el1.html();
// 				});
//
// 				it('should parse the embedUrl param to get the youtube video ID (using youtubeUrlService)', function() {
// 					expect(_ctrl0.ytVideoID).toBe('6wKqH6vlGHU');
// 				});
//
// 				it('should make identical embedIds unique by prefixing the input videoID with a random string', function() {
// 					expect(first).not.toBe(second);
// 				});
//
// 				it('should use the same youtube videoID for embed players', function() {
// 					expect(_ctrl0.ytVideoID).toBe(_ctrl1.ytVideoID);
// 				});
// 			});
//
// 		});
// 	});
// })();
//
//
//
