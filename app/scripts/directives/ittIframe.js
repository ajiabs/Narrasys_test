/**
 *
 * Created by githop on 12/8/15.
 */

(function(){
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittIframe', ittIframe);

	function ittIframe() {
		return {
			restrict: 'EA',
			scope: {
				item: '='
			},
			replace: true,
			template: '<iframe ng-src="{{ctrl.item.url || ctrl.item.asset.url}}" ng-attr-sandbox="{{ctrl.sandbox}}"></iframe>',
			controller: iframeCtrl,
			controllerAs: 'ctrl',
			bindToController: true
		};

		function iframeCtrl() {
			var ctrl = this; //jshint ignore:line
							 // (not a strict violation, trust me!)

			var _sandboxAttrs = 'allow-forms allow-same-origin allow-scripts';

			//root item's URL is a PDF
			if (ctrl.item.type === 'Link' && ctrl.item.url.match(/.pdf/)) {
				ctrl.sandbox = undefined;

				//it could be an uploaded asset, with its own URL
			} else if (ctrl.item.type === 'Link' && angular.isDefined(ctrl.item.asset)) {

				//uploaded PDF asset
				if (ctrl.item.asset.content_type === 'application/pdf') {
					ctrl.sandbox = undefined;
				}

				//uploaded IMG asset
				if (ctrl.item.asset._type === 'Asset::Image') {
					ctrl.sandbox = _sandboxAttrs;
				}

			} else {
				//root item's URL is not a PDF ->sandbox it!
				ctrl.sandbox = _sandboxAttrs;
			}
		}
	}
})();
