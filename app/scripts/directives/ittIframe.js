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
			link: link
		};

		function getTemplate(itemObj) {
			var wSandbox = '<iframe ng-src="{{item.souce}}" sandbox="allow-forms allow-same-origin allow-scripts"></iframe>';
			var noSandbox = '<iframe ng-src="{{item.source}}"></iframe>';
			var template;

			if (itemObj.type === 'Link' && itemObj.url.match(/.pdf/)) {
				template = noSandbox;
				itemObj.source = itemObj.url;
			} else {
				template = wSandbox;
				itemObj.source = itemObj.url;
			}

			return template;
		}

		function link(scope, element) {
			element.html(getTemplate(scope.item)).show();
			$compile(element.contents())(scope);
		}

	}
})();
