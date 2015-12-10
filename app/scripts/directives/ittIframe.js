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
			template: '<iframe ng-src="{{ctrl.item.asset.url || ctrl.item.url}}" ng-attr-sandbox="{{ctrl.sandbox}}"></iframe>',
			controller: iframeCtrl,
			controllerAs: 'ctrl',
			bindToController: true
		};

		function iframeCtrl() {
			var ctrl = this;
			var _sandboxAttrs = "allow-forms allow-same-origin allow-scripts";

			if (ctrl.item.type === 'Link' && ctrl.item.url.match(/.pdf/)) {
				ctrl.sandbox = undefined;

			} else if (ctrl.item.type === 'Link' && angular.isDefined(ctrl.item.asset)) {

				if (ctrl.item.asset.content_type === 'application/pdf') {
					ctrl.sandbox = undefined;
				}

				if (ctrl.item.asset._type === 'Asset::Image') {
					ctrl.sandbox = _sandboxAttrs;
				}

			} else {
				ctrl.sandbox = _sandboxAttrs;
			}
		}
	}
})();
