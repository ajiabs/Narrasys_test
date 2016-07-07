/**
 * Created by githop on 7/6/16.
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
			// console.log("tabsCtrl", tabsCtrl);
			tabsCtrl.addPane(scope);
		}
	};
}
