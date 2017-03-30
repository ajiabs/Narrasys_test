/**
 * Created by githop on 9/28/16.
 */

export default function ittTooltip() {
  return {
    restrict: 'EA',
    transclude: true,
    scope: {
      tipText: '@',
      css: '@?'
    },
    template: [
      '<span class="ittTooltip">',
      '	<ng-transclude></ng-transclude>',
      '	<span ng-if="showTip" class="{{css ? css : \'ittTooltip__text\'}}" style="text-indent: 0;">{{tipText}}</span>',
      '</span>'
    ].join(''),
    link: function (scope, elm) {
      elm.mouseenter(onMouseenter);
      function onMouseenter() {
        scope.$apply(function () {
          scope.showTip = true;
        });
      }

      elm.mouseleave(onMouseleave);
      function onMouseleave() {
        scope.$apply(function () {
          scope.showTip = false;
        });
      }
    }
  };
}
