/**
 * Created by githop on 1/6/16.
 */


(function() {
	'use strict';

	describe('Directive: ittIframe', function() {
		beforeEach(module('com.inthetelling.story'));

		var pdfSrc = '.pdf';
		var nonPdfSrc = '.doc';
		var youtubeSrc = '//www.youtube.com/embed/6wKqH6vlGHU';
		var htmlContentType = 'text/html';
		var defaultSandbox = 'allow-forms allow-same-origin allow-scripts';
		var scope, compile;
		beforeEach(inject(function($rootScope, $compile) {
			scope = $rootScope;
			compile = $compile;
		}));


		function createTestDirective(srcParam, contentTypeParam) {
			var element, compiled, template;

			template = '<itt-iframe x-src="' + srcParam + '"></itt-iframe>';

			if (contentTypeParam !== undefined) {
				template = '<itt-iframe x-src="' + srcParam + '" contenttype="'+ contentTypeParam +'"></itt-iframe>';
			}

			element = angular.element(template);
			compiled = compile(element)(scope);
			scope.$digest();
			return compiled;
		}

		describe('inputs: ', function() {
			it('should bind the src param to the controller scope', function() {
				var el = createTestDirective(pdfSrc);

				var ctrl = el.isolateScope().iframeCtrl;

				expect(ctrl.src).toBe(pdfSrc);
			});

			it('should set detect when the link is to youtube', function() {
				var el = createTestDirective(youtubeSrc);

				var ctrl = el.isolateScope().iframeCtrl;

				expect(ctrl.isYoutube).toBe(true);
			});

			describe('optional params', function() {

				it('should bind the contenttype param to the controller scope', function() {
					var el = createTestDirective(nonPdfSrc, htmlContentType);

					expect(el.isolateScope().iframeCtrl.contenttype).toBe(htmlContentType);
				});
			});

		});

		describe('Sandbox Logic', function() {

			it('should keep sandbox attrs if contenttype is set ', function() {
				var el = createTestDirective(nonPdfSrc, htmlContentType);

				var ctrl = el.isolateScope().iframeCtrl;

				expect(ctrl.sandbox).toBeUndefined();
			});

			it('should remove sandbox attrs for PDFs', function() {
				var el = createTestDirective(pdfSrc);

				var ctrl = el.isolateScope().iframeCtrl;

				expect(ctrl.sandbox).toBe(undefined);
			});

		});
	});
})();
