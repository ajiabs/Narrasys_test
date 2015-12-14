'use strict';
export default function ittItemDetailModal(appState) {
	'ngInject';
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
}
