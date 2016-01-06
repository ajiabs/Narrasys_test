/**
 * Created by githop on 1/6/16.
 */

(function () {
	'use strict';

	describe('Directive: ittYoutube', function () {
		beforeEach(module('com.inthetelling.story'));

		var embedUrl = '//www.youtube.com/embed/6wKqH6vlGHU';
		var embedId = '568bf8746d571a053a000113';
		var directiveTemplate = '<itt-youtube embed-url="' + embedUrl + ' " embed-id="' + embedId + '"></itt-youtube>';
		var scope, compile;

		beforeEach(inject(function ($rootScope, $compile) {
			scope = $rootScope.$new();
			compile = $compile;
		}));

		function createTestDirective() {
			var ittYoutubeElement, compiled;
			ittYoutubeElement = angular.element(directiveTemplate);
			compiled = compile(ittYoutubeElement)(scope);
			scope.$digest();
			return compiled;
		}

		describe('inputs: ', function() {
			it('should bind the passed in embed-url param to the controller scope', function() {
				var el = createTestDirective();

				var ctrl = el.isolateScope().ittYoutubeCtrl;

				expect(ctrl.embedUrl).toBe(embedUrl);
			});

			it('should bind the passed in embed-id param to the controller scope', function() {
				var el = createTestDirective();

				var ctrl = el.isolateScope().ittYoutubeCtrl;

				expect(ctrl.embedId).toBe(embedId);
			});
		});

		describe('DOM results: ', function() {
			it('should create a div for the youtube iframe API and set the ID with the embed-id param', function() {

				var el = createTestDirective();

				var playerDiv = el.html();
				var renderedTemplate = '<div id="568bf8746d571a053a000113"></div>';
				expect(playerDiv).toBe(renderedTemplate);
			});
		});



	});
})();



