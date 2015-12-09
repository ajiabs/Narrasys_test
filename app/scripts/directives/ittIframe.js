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

				//helpers
				function _doSandbox() {
					elm.removeAttr('sandbox');
					$compile(elm)(scope);
				}

				function _undoSandbox() {
					elm.attr('sandbox', 'allow-forms allow-same-origin allow-scripts');
				}

				//case: pdf direct link
				if (scope.item.type === 'Link' && scope.item.url.match(/.pdf/)) {
					scope.item.source = scope.item.url;
					_doSandbox();
					//case: uploaded asset
				} else if (scope.item.type === 'Link' && angular.isDefined(scope.item.asset)) {

					//the upload is a PDF
					if (scope.item.asset.content_type === 'application/pdf') {
						scope.item.source = scope.item.asset.url;
						_doSandbox();
					}

					//the upload is an image
					if (scope.item.asset._type === 'Asset::Image') {
						scope.item.source = scope.item.asset.url;
						_undoSandbox();
					}

				} else {
					scope.item.source = scope.item.url;
					_undoSandbox();
				}

			}

			//may be able to pull this off without a watch, looking into using $apply for this.
			scope.$watch(function() {
				//this works because optional third param set to true will check for object equality rather than reference
				//eg angular.equals(newVal, newVal);
				return [scope.item.url, scope.item.asset.url];
			}, function(newVal, oldVal) {
				if (newVal[0] !== oldVal[0] || newVal[1] !== oldVal[1]) {
					renderTemplate();
				}
			}, true);
		}

	}
})();
