// @npUpgrade-player-false
/**
 * Created by githop on 3/30/17.
 */

export default function ittTab() {
  return {
    template: '<div ng-show="selected"><ng-transclude></ng-transclude></div>',
    require: '^^ittTabs',
    transclude: true,
    scope: {
      title: '@'
    },
    link: function (scope, elm, attrs, tabsCtrl) {
      tabsCtrl.addPane(scope);
    }
  };
}
