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

.directive('bindVal', function () {
	return {
		restrict: 'A',
		replace: true,
		scope: {
			val: '=bindVal'
		},
		template: '<div ng-class="{lorem: !val}">{{val}}</div>',
		link: function (scope, el) {
			console.log("scope.val", scope.val)
		}

	}

});
