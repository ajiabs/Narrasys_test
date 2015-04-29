'use strict';

angular.module('com.inthetelling.story')
	.controller('EventTestController', function ($scope, $routeParams, mockSvc, modelSvc, appState) {
		console.log('EventTestContrller');

		// mockSvc.mockEpisode("ep1");
		appState.episodeId = "ep1";
		appState.product = 'producer';
		appState.lang = "en";

		modelSvc.cache("asset", {
			"_id": "asset",
			"_type": "Asset::Image",
			"url": "http://placehold.it/350x350",
			"extension": "jpg",
			"name": "350x350 placeholder",
		});

		modelSvc.cache("episode", {
			"_id": "ep1",
			"masterAsset": {
				duration: 100
			},
			"title": {
				en: "Test Episode"
			},
			"languages": [{
				code: 'en',
				default: true
			}]
		});

		var emptyStubs = {
			'transcript': {
				annotation: {
					en: ""
				},
				annotator: {
					en: "John Doe"
				},
				asset_id: 'asset' // TMP
			},
			'annotation': {
				annotation: {
					en: ""
				},
				annotator: {
					en: ""
				},
			},
			'image': {},
			'file': {},
			'link': {},
			'video': {},
			'question': {},
			'plugin': {},
			'scene': {}
		};

		$scope.itemType = $routeParams["eventType"] || 'transcript';
		$scope.itemId = 'internal:editing';
		var thisItem = emptyStubs[$scope.itemType];
		thisItem._id = $scope.itemId;
		thisItem.cur_episode_id = "ep1";
		thisItem.tmpl = {
			itemType: $scope.itemType,
		};
		thisItem.editing = true; // TODO ensure this gets set in the real editor/producer!

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
			thisItem, {
				_id: 'foo2',
				cur_episode_id: 'ep1',
				tmpl: {
					itemType: 'transcript',
				},
				annotation: {
					en: ""
				},
				annotator: {
					en: "John Doe"
				}
			}
		];

		console.log(items);
		$scope.items = [];
		for (var i = 0; i < items.length; i++) {
			modelSvc.cache("event", items[i]);
			$scope.items.push(modelSvc.events[items[i]._id]);
		};

	})

;
