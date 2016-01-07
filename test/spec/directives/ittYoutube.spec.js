/**
 * Created by githop on 1/6/16.
 */

(function () {
	'use strict';

	describe('Directive: ittYoutube', function () {
		beforeEach(module('com.inthetelling.story'));

		var embedUrl = '//www.youtube.com/embed/6wKqH6vlGHU';
		var embedId = '568bf8746d571a053a000113';
		var mainPlayerTemplate = '<itt-youtube main-player="mainPlayerEmbed" embed-url="' + embedUrl + '"></itt-youtube>';
		var embedTemplate = '<itt-youtube embed-url="' + embedUrl + '"></itt-youtube>';
		var scope, compile;

		beforeEach(inject(function ($rootScope, $compile) {
			scope = $rootScope.$new();
			compile = $compile;
		}));

		function createTestDirective(template, main) {
			if (main) {
				scope.mainPlayerEmbed = embedId;
			}
			var ittYoutubeElement, compiled;
			ittYoutubeElement = angular.element(template);
			compiled = compile(ittYoutubeElement)(scope);
			scope.$digest();
			return compiled;
		}

		describe('DOM results: ', function() {
			it('should create a div for the youtube iframe and set the div accordingly', function() {

				var el = createTestDirective(mainPlayerTemplate, true);

				var playerDiv = el.html();

				var renderedTemplate = '<div id="' + embedId + '"></div>';
				expect(playerDiv).toBe(renderedTemplate);
			});
		});



	});
})();



