/**
 * Created by githop on 6/16/16.
 */

export default function ittEditPencil() {
  return {
    restrict: 'EA',
    transclude: true,
    scope: {
      canAccess: '=?',
      force: '=?',
      onEdit: '&'
    },
    template: [
      '<div>',
      '	<span class="pencil__content" ng-transclude></span>',
      '	<span style="text-indent: 0">',
      '		<span class="edit-pencil" ng-click="sendEdit($event)" ng-if="showPencil || force"></span>',
      '	</span>',
      '</div>'
    ].join(' '),
    link: function (scope, elm) {
      scope.showPencil = false;

      scope.sendEdit = sendEdit;
      elm.mouseenter(mouseenter);
      elm.mouseleave(mouseleave);

      function sendEdit($ev) {
        scope.showPencil = false;
        scope.onEdit({$event: $ev});
      }

      function mouseenter() {
        if (scope.canAccess === true) {
          scope.$apply(function () {
            scope.showPencil = true;
          });
        }
      }

      function mouseleave() {
        if (scope.canAccess === true) {
          scope.$apply(function () {
            scope.showPencil = false;
          });
        }
      }

    }
  };
}

