/**
 *
 * Created by githop on 12/8/15.
 */

(function(){
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

			function renderTemplate() {
				if (scope.item.type === 'Link' && scope.item.url.match(/.pdf/)) {
					scope.item.source = scope.item.url;
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
