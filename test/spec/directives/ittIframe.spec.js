/**
 * Created by githop on 1/6/16.
 */


(function() {
	'use strict';

	describe('Directive: ittIframe', function() {
		beforeEach(module('com.inthetelling.story'));

		var pdfSrc = '.pdf';
		var nonPdfSrc = '.doc';
		var htmlContentType = 'text/html';
		var defaultSandbox = 'allow-forms allow-same-origin allow-scripts';
		var directiveTemplate;
		var scope, compile;

		beforeEach(inject(function($rootScope, $compile) {
			scope = $rootScope;
			compile = $compile;
		}));

		function createTestDirective(srcParam, contentTypeParam) {
			var element, compiled;
			var directiveTemplate = '<itt-iframe x-src="' + srcParam + '" contenttype="' + contentTypeParam + '"></itt-iframe>';
			element = angular.element(directiveTemplate);
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
		});

		describe('Sandbox Logic', function() {

			it('should keep sandbox attrs if contenttype is set ', function() {
				var el = createTestDirective(nonPdfSrc, htmlContentType);

				var ctrl = el.isolateScope().iframeCtrl;

				expect(ctrl.sandbox).toBe(defaultSandbox);
			});

		});
	});
})();
