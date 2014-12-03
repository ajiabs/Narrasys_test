'use strict';

/* 

No sneaky changing the tab order or number of tabs after init allowed. 

Possibly boneheaded parts of this: 

	- jQuery (.find())
	- depends on magic classNames 'cur' and 'ittTab'  
	- depends on the directive user to keep track of tabindex :P

TODO: a forceTemplate sort of deal for different tab layouts

How to use:

<div class="ittTabs" itt-tabs>
	<div class="ittTab" itt-tab="tabs[0]" x-tabindex="0" x-tablabel="Label 1">
	Tab contents 1
	</div>
	<div class="ittTab cur" itt-tab="tabs[1]" x-tabindex="1" x-tablabel="Label 2">
	Tab contents 2 (Note that you can force this to start as the visible tab by giving it class 'cur')
	</div>
	<div class="ittTab" itt-tab="tabs[2]" x-tabindex="2" x-tablabel="Label 3">
	Tab contents 3
	</div>
</div>


*/

angular.module('com.inthetelling.story')
	.directive('ittTabs', function () {
		return {
			restrict: 'A',
			replace: true,
			link: function (scope, element) {
				scope.tabs = [];
				var hasCur = false;
				var tabNodes = element.find('.ittTab');
				for (var i = 0; i < tabNodes.length; i++) {
					scope.tabs[i] = ($(tabNodes[i]).hasClass('cur'));
					if (scope.tabs[i]) {
						hasCur = true;
					}
				}
				if (!hasCur) {
					scope.tabs[0] = true;
				}

				/* -- */

				scope.tab = function (tab) {
					for (var i = 0; i < tabNodes.length; i++) {
						scope.tabs[i] = false;
					}
					scope.tabs[tab] = true;
					console.log(scope.tabs);
				};
				console.log(scope.tabs);
			}
		};
	})
	.directive('ittTab', function () {
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
	});
