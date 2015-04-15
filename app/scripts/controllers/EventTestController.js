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
				wrapper: 'inset',
				template: 'default'
			},
			annotation: {
				en: "HI THERE"
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

.directive('ittPositionPicker', function () {
	return {
		restrict: 'E',
		require: 'ngModel',
		scope: {
			ngModel: '='
		},
		template: '<input ng-model="ngModel">',
		link: function (scope) {
			console.log("ittPP", scope.ngModel);
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
