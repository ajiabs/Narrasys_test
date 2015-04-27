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
				_id: 'foo1',
				cur_episode_id: 'ep1',
				tmpl: {
					itemType: 'transcript',
				},
				annotation: {
					en: "This is a sample transcript not being edited"
				},
				annotator: {
					en: "John Doe"
				}
			},

			{
				_id: 'internal:editing',
				cur_episode_id: 'ep1',
				tmpl: {
					itemType: 'transcript',
				},
				annotation: {
					en: ""
				},
				annotator: {
					en: "John Doe"
				},
				asset_id: 'asset2' // TMP
			}, {
				_id: 'foo2',
				cur_episode_id: 'ep1',
				tmpl: {
					itemType: 'transcript',
				},
				annotation: {
					en: "This is a sample transcript not being edited"
				},
				annotator: {
					en: "John Doe"
				}
			}
		];

		$scope.items = [];
		for (var i = 0; i < items.length; i++) {
			modelSvc.cache("event", items[i]);
			$scope.items.push(modelSvc.events[items[i]._id]);
		};

		console.log(modelSvc);

	})
	/* TODO move these somewhere sensible */

;
