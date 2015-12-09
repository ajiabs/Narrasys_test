/**
 *
 * Created by githop on 12/8/15.
 */

(function(){
	'use strict';

	angular.module('com.inthetelling.story')
		.directive('ittIframe', ittIframe);

	function ittIframe($compile) {
		return {
			restrict: 'EA',
			scope: {
				item: '='
			},
			replace: true,
			template: '<iframe ng-src="{{item.source}}"></iframe>',
			link: link
		};

		function link(scope, elm) {

			renderTemplate();

			//console.log('directive scope.item', scope.item);

			function renderTemplate() {

				//case: pdf direct link
				if (scope.item.type === 'Link' && scope.item.url.match(/.pdf/)) {
					scope.item.source = scope.item.url;
					elm.removeAttr('sandbox');
					$compile(elm)(scope);
					//case: uploaded pdf asset
				} else if (
					scope.item.type === 'Link' &&
					angular.isDefined(scope.item.asset) &&
					scope.item.asset.content_type === 'application/pdf'
				) {
					scope.item.source = scope.item.asset.url;
					elm.removeAttr('sandbox');
					$compile(elm)(scope);
				} else {
					scope.item.source = scope.item.url;
					elm.attr('sandbox', 'allow-forms allow-same-origin allow-scripts');
				}
			}

			scope.$watch(function() {
				return scope.item.url;
			}, function(newVal, oldVal) {
				if (newVal !== oldVal) {
					renderTemplate();
				}
			});
		}

	}
})();
