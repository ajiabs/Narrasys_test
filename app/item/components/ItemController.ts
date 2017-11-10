// @npUpgrade-item-false
ItemController.$inject = ['$scope', 'timelineSvc'];

export default function ItemController($scope, timelineSvc) {
  $scope.seek = function (t) {
    timelineSvc.seek(t, "clickedOnItem", $scope.item._id);
  };
  var KeyCodes = {
    ENTER: 13,
    SPACE: 32
  };

  $scope.seekOnKeyPress = function (t, $event) {
    var e = $event;
    var passThrough = true;
    switch (e.keyCode) {
      case KeyCodes.ENTER:
        $scope.seek(t);
        passThrough = false;
        break;
      case KeyCodes.SPACE:
        $scope.seek(t);
        passThrough = false;
        break;
      default:
        passThrough = true;
        break;
    }
    if (!passThrough) {
      $event.stopPropagation();
      $event.preventDefault();
    }
  };
}
