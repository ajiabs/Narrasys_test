'use strict';

describe('Controller: EpisodeController', function () {

	// load the controller's module
	beforeEach(module('com.inthetelling.player'));

	// Create mock data
	// Note: Several tests are directly tied to the order and number of items in the events collection
	// TODO: Abstract mock data into mocks folder. Load through karma.config. Reuse same mock data for modelFactory service tests.
	var episode, scene1, scene2, scene1_item1, scene1_item2, scene2_item1, scene2_item2, mockData;
	beforeEach(function() {
		episode = {
			"title": "Episode",
			"category": "Category",
			"cover": "Cover",
			"template": "Template",
			"videos": {
				"webm": "Webm",
				"mpeg4": "Mpeg4"
			}
		};
		scene1 = {
			"type": "scene",
			"title": "Scene 1",
			"start": 1,
			"end": 100,
			"description": "Description",
			"src": "Src",
			"template": "Template"
		};
		scene2 = {
			"type": "scene",
			"title": "Scene 2",
			"start": 100,
			"end": 200,
			"description": "Description",
			"src": "Src",
			"template": "Template"
		};
		scene1_item1 = {
			"type": "transcript",
			"annotation": "Scene 1 Item 1 Annotation",
			"start": 1,
			"end": 50,
			"template": "Template",
			"author":{
				"name": "Name",
				"src":"Src"
			}
		};
		scene1_item2 = {
			"type": "transcript",
			"annotation": "Scene 1 Item 2 Annotation",
			"start": 50,
			"end": 100,
			"template": "Template",
			"author":{
				"name": "Name",
				"src":"Src"
			}
		};
		scene2_item1 = {
			"type": "transcript",
			"annotation": "Scene 2 Item 1 Annotation",
			"start": 100,
			"end": 150,
			"template": "Template",
			"author":{
				"name": "Name",
				"src":"Src"
			}
		};
		scene2_item2 = {
			"type": "transcript",
			"annotation": "Scene 2 Item 2 Annotation",
			"start": 150,
			"end": 200,
			"template": "Template",
			"author":{
				"name": "Name",
				"src":"Src"
			}
		};
		mockData = {
			"episode": episode,
			"events": [
				scene1,
				scene2,
				scene1_item1,
				scene1_item2,
				scene2_item1,
				scene2_item2
			]
		};
	});

	// mock out route params
	var routeParams;
	beforeEach(function() {
		routeParams = {
			epId: "test"
		};
	});

	// Initialize the httpBackend, scope, and controller
	var scope,
		EpisodeController;
	beforeEach(inject(function ($controller, $rootScope, $httpBackend) {
		$httpBackend.expectGET("server-mock/data/episode-" + routeParams.epId + ".json").respond(mockData);
		scope = $rootScope.$new();
		EpisodeController = $controller('EpisodeController', {
			$scope: scope,
			$routeParams: routeParams
		});
		$rootScope.$digest(); // Hack for "No pending request to flush" angular bug (https://groups.google.com/forum/#!topic/angular/BXtFWLtKrGM)
		$httpBackend.flush();
	}));

	it('should attach an episode model to the scope', function () {
		expect(typeof scope.episode).toBe("object");
		expect(scope.episode.title).toBe(mockData.episode.title);
	});

	it('should attach two scene models each containing two item models to the scope', function () {
		expect(scope.scenes.length).toBe(2);
		expect(scope.scenes[0].title).toBe(scene1.title);
		expect(scope.scenes[0].items.length).toBe(2);
		expect(scope.scenes[0].items[0].annotation).toBe(scene1_item1.annotation);
		expect(scope.scenes[0].items[1].annotation).toBe(scene1_item2.annotation);
		expect(scope.scenes[1].title).toBe(scene2.title);
		expect(scope.scenes[1].items.length).toBe(2);
		expect(scope.scenes[1].items[0].annotation).toBe(scene2_item1.annotation);
		expect(scope.scenes[1].items[1].annotation).toBe(scene2_item2.annotation);
	});
  
});
