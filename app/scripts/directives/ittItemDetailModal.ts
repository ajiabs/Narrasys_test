/**
 * @ngdoc directive
 * @name iTT.directive:ittItemDetailModal
 * @restrict 'A'
 * @scope
 * @description
 * For opening modals with event objects.
 * Currently resides in player.html and is passed the item data via appState.
 * Modal is invoked via forceModal() $scope method in ittItem.
 * forceModal() accepts a bool as param, and sets the item on the appState.
 * The modal transition is animated based upon the boolean param passed to forceModal()
 * @requires iTT.service:appState
 * @param {Object} item Event object to display in modal
 */

ittItemDetailModal.$inject = ['appState'];
export default function ittItemDetailModal(appState) {
	return {
		restrict: 'A',
		replace: true,
		scope: {
			item: '=ittItemDetailModal'
		},
		templateUrl: 'templates/item/modal.html',
		link: function (scope) {
			var modalSmooth = {
				'transition': 'none'
			};
			if (!scope.item.animate) {
				scope.modalSmooth = modalSmooth;
			}

			scope.item = scope.item.item;
			scope.dismiss = function () {
				appState.itemDetail = false;
			};
		}

	};
}
