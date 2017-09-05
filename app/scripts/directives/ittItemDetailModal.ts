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
      scope.item = scope.item.item;
      if (!scope.item.animate) {
        scope.modalStyle = { 'transition': 'none' };
      }

      const baseStyle = { 'bottom': '0' };
      const yOffsets = { 'padding-top': '5%', 'margin-top': '40px' };
      const imgStyle = { 'overflow-y': 'auto', 'top': '40%', 'height': '85%', 'z-index': '11' };

      if (scope.item.isVideoUrl) {
        scope.modalStyle = angular.extend(scope.modalStyle, yOffsets);
      } else if (scope.item.producerItemType === 'image') {
        scope.modalStyle = angular.extend(scope.modalStyle, imgStyle, { 'margin-top': '6px' });
      } else {
        scope.modalStyle = angular.extend(scope.modalStyle, baseStyle, yOffsets);
      }

      scope.dismiss = function () {
        appState.itemDetail = false;
      };
    }

  };
}
