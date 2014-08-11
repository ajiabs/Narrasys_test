'use strict';

angular.module('com.inthetelling.story')
	.directive('ittItemDetailModal', function (appState) {
		return {
			restrict: 'A',
			replace: true,
			scope: {
				item: '=ittItemDetailModal'
			},
			templateUrl: 'templates/item/modal.html',
			link: function (scope) {
				// console.log('ittItemDetailModal', scope, element, attrs);

				scope.dismiss = function () {
					appState.itemDetail = false;
				};
			}

		};
	});
