'use strict';
/*

Directives for positioning items within content panes

ittContentPane
ittPositionContent
ittPositionOverlay
*/

angular.module('com.inthetelling.story')
	.directive('ittContentPane', function () {
		return {
			restrict: 'A',
			replace: 'true',
			scope: {
				items: '=ittContentPane'
			},
			template: '<div class="content" ng-class="{isNarrow: isNarrow()}"><div ng-repeat="item in items" ng-include="\'templates/v2/wrapper/_global.html\'" class="animate"></div></div>',
			link: function (scope, el) {
				console.log("contentpane", scope, el);
				scope.isNarrow = function () {
					return el.width() < 400;
				};
			}
		};
	})
	.directive('ittPositionContent', function () {
		return {
			restrict: 'E',
			require: 'ngModel',
			scope: {
				ngModel: '='
			},
			templateUrl: '/templates/producer/itempositioncontent.html',
			link: function (scope) {
				console.log("ipc");
				scope.sizeSet = 0;
				scope.posSet = 1;
				var labels = [
					["Left Sidebar", "Inline", "Right Sidebar"],
					["Burst left margin", "Burst margins", "Burst right margin"]
				];
				var vals = [
					["sidebarL", "inline", "sidebarR"],
					["burstL", "burst", "burstR"]
				];

				scope.toggleSize = function () {
					scope.sizeSet = (scope.sizeSet === 0) ? 1 : 0;
					setPos();
				}

				scope.zoneClick = function (x) {
					scope.posSet = x;
					setPos();
				}

				var setPos = function () {
					console.log("setPos", scope.sizeSet, scope.posSet);
					scope.posLabel = labels[scope.sizeSet][scope.posSet];
					scope.ngModel = vals[scope.sizeSet][scope.posSet];
				}

				for (var i = 0; i < vals.length; i++) {
					for (var j = 0; j < vals[i].length; j++) {
						if (vals[i][j] === scope.ngModel) {
							scope.sizeSet = i;
							scope.posSet = j;
						}
					}
				}
				setPos();
			}
		};
	})
	.directive('ittPositionOverlay', function () {
		return {
			restrict: 'E',
			require: 'ngModel',
			scope: {
				ngModel: '='
			},
			templateUrl: '/templates/producer/itempositionoverlay.html',
			link: function (scope) {
				console.log("ipo", scope.ngModel);

				var vals = ['tl', 'tr', 'bl', 'br', 'center', 'stretch', 'cover', 'contain'];
				var labels = ['Top left', 'Top right', 'Bottom left', 'Bottom right', 'Centered', 'Stretched', 'Cover', 'Contain'];

				var init = function () {
					for (var i = 0; i < vals.length; i++) {
						if (scope.ngModel === vals[i]) {
							scope.posLabel = labels[i];
							scope.centerType = vals[i];
						}
					}
					if (!scope.posLabel) {
						scope.ngModel = 'center';
						scope.centerType = 'center';
						scope.posLabel = labels[4];
					}

					scope.pinned = (scope.ngModel.length === 2); // HACKish
				}
				init();

				scope.zoneClick = function (x) {
					scope.ngModel = vals[x];
					scope.posLabel = labels[x];
					scope.pinned = (scope.ngModel.length === 2); // HACKish
					if (x > 3) {
						scope.centerType = 'center';
					}
				}

				scope.forceModel = function (evt) {
					// HACK we hijacked ng-model for this directive, so update it via an ng-click handler instead.
					scope.ngModel = evt.currentTarget.options[evt.currentTarget.selectedIndex].value;
					init();
				}

			}
		};
	})

;
