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
        scope.modalStyle = {'transition': 'none'};
      }

      var baseStyle = {'bottom': '0', 'padding-top': '5%'};
      var imgStyle = {'overflow-y': 'auto', 'top': '40%', 'height': '85%', 'z-index': '11'};

      if (scope.item.isVideoUrl) {
        scope.modalStyle = angular.extend(scope.modalStyle, {'padding-top': '5%'});
      } else if (scope.item.producerItemType === 'image') {
        scope.modalStyle = angular.extend(scope.modalStyle, imgStyle);
      } else {
        scope.modalStyle = angular.extend(scope.modalStyle, baseStyle);
      }

      scope.dismiss = function () {
        appState.itemDetail = false;
      };
    }

  };
}
