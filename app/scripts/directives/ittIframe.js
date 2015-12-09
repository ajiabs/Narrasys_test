'use strict';
/**
 *
 * Created by githop on 12/8/15.
 */

angular.module('com.inthetelling.story')
	.directive('ittIframe', function ($compile) {

		var getTemplate = function (itemObj) {
			var wSandbox = '<iframe src="{{item.souce}}" sandbox="allow-forms allow-same-origin allow-scripts"></iframe>';
			var noSandbox = '<iframe src="{{item.source}}"></iframe>';
			var template;

			// console.log('item passed to directive', itemObj);
			if (itemObj.type === 'Link' && itemObj.url.match(/.pdf/)) {
				template = noSandbox;
			} else {
				template = wSandbox;
			}
			itemObj.source = itemObj.url;
			return template;
		};

		return {
			restrict: 'EA',
			scope: {
				item: '='
			},
			link: function (scope, element) {
				element.html(getTemplate(scope.item)).show();
				$compile(element.contents())(scope);
			}
		};
	});
