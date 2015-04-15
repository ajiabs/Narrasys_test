'use strict';

angular.module('com.inthetelling.story')
	.controller('EventTestController', function ($scope, $routeParams, mockSvc, modelSvc, appState) {
		console.log('EventTestContrller');

		mockSvc.mockEpisode("ep1");
		appState.episodeId = "ep1";

		appState.product = 'producer';
		appState.lang = "en";

		// $scope.itemId = $routeParams["eventId"];

		// $scope.item = modelSvc.events[$routeParams.eventId];

		$scope.itemId = 'internal:editing';

		var items = [{
			_id: 'internal:editing',
			cur_episode_id: 'ep1',
			tmpl: {
				itemType: 'transcript',
				wrapper: 'default',
				template: 'default',
				position: 'tl',
				layout: 'overlay'
			},
			annotation: {
				en: "Hello there.  THis is some english text."
			},
		}];

		modelSvc.cache("event", items[0]);
		$scope.items = [
			modelSvc.events[items[0]._id]
		];

		console.log(modelSvc);

	})
	/* TODO move these somewhere sensible */

.directive('bindVal', function () {
	return {
		restrict: 'A',
		replace: true,
		scope: {
			val: '=bindVal'
		},
		template: '<div ng-class="{lorem: !val}" ng-bind-html="val"></div>',
		link: function (scope) {
			// console.log("scope.val", scope.val);
		}
	};
})

.directive('formField', function () {
	return {
		restrict: 'A',
		transclude: true,
		scope: {
			label: '@formField'
		},
		template: '<div class="field"><div class="label" ng-bind-html="label"></div><div class="input" ng-transclude></div></div>',
		link: function (scope) {
			// console.log("scope.label", scope);
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
				scope.ngModel = evt.currentTarget.options[evt.currentTarget.selectedIndex].value;
				init();

			}

		}
	};
})

.directive('ittItemColorForm', function ($timeout) {
	return {
		restrict: 'A',

		scope: true,
		templateUrl: '/templates/producer/itemcolorform.html',
		link: function (scope) {
			console.log("color form", scope.item);

			if (!scope.item.tmpl.style.textcolor1 && !scope.item.tmpl.style.textcolor2 && !scope.item.tmpl.style.textcolor3) {
				$timeout(function () {
					scope.defaultColors = true; // HACK color-picker wants to init as #FFF, timeout will override

				})
			}
			if (!scope.item.tmpl.style.bgcolor) {
				scope.noBg = true;
			}

			scope.$watch(function () {
				return [
					scope.item.tmpl.style.linkcolor,
					scope.item.tmpl.style.textcolor1,
					scope.item.tmpl.style.textcolor2,
					scope.item.tmpl.style.bgcolor
				]
			}, function (newV) {
				console.log("w1", newV);
				// scope.defaultColors = !(newV[0] || newV[1] || newV[2]);
				// scope.noBg = !(newV[3]);
			}, true);

			scope.$watch(function () {
				return scope.noBg;
			}, function (newV) {
				console.log("w2 ", newV);
				if (newV) {
					console.log("Deleting bgcolor");
					delete scope.item.tmpl.style.bgcolor;
				}
			});

			scope.$watch(function () {
				return scope.defaultColors;
			}, function (newV) {
				console.log("w3", newV);
				if (newV) {
					console.log("Resetting default colors");
					delete scope.item.tmpl.style.linkcolor;
					delete scope.item.tmpl.style.textcolor1;
					delete scope.item.tmpl.style.textcolor2;
				} else {
					//TODO set to episode defaults instead?
					console.log("initing  custom colors");
					scope.item.tmpl.style.linkcolor = "#0000FF";
					scope.item.tmpl.style.textcolor1 = "#000000";
					scope.item.tmpl.style.textcolor2 = "#000000"
				}
			});

		}
	};
});
