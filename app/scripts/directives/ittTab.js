/**
 * Created by githop on 12/12/15.
 */

'use strict';

export default function ittTab() {
	return {
		restrict: 'A',
		replace: false,
		transclude: true,
		scope: {
			isCur: "=ittTab"
		},
		template: '<div><div class="ittTabLabel" ng-class="{cur: isCur}"><a ng-click="$parent.tab(tabindex)">{{tablabel}}</a></div><div class="ittTabContents" ng-show="isCur" ng-transclude></div></div>',
		link: function (scope, element, attrs) {
			scope.tablabel = attrs.tablabel;
			scope.tabindex = attrs.tabindex;
		}
	};
}
