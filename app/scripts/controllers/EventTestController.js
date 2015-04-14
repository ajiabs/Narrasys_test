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
		template: 'FOO:<input ng-model="ngModel">BAR',
		link: function (scope) {
			console.log("ittPP", scope.ngModel);
		}
	};
})

.directive('ittItemColorForm', function () {
	return {
		restrict: 'A',

		scope: true,
		templateUrl: '/templates/producer/itemcolorform.html',
		link: function (scope) {
			console.log("color form", scope.item);
		}
	};
});
