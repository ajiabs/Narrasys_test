'use strict';

describe('Service: modelSvc', function () {

	// load the service's module
	beforeEach(module('com.inthetelling.story'));

	// instantiate service
	var modelSvc;
	beforeEach(inject(function (_modelSvc_) {
		modelSvc = _modelSvc_;

		// data to test against
		modelSvc.cache("episode", {
			"_id": "EP1",
			"created_at": "2014-04-10T02:02:15Z",
			"description": "The Business Case for Sustainability",
			"master_asset_id": "masterasset",
			"title": "Test Episode",
			"status": "Published",
			"templateUrl": "templates/episode/purdue.html",
			"styles": [
				"", "", ""
			]
		});
		modelSvc.addLandingScreen("EP1");

		// one scene every ten seconds
		for (var i = 0; i < 10; i++) {
			modelSvc.cache("event", {
				"_id": "scene" + i,
				"_type": "Scene",
				"title": "Scene " + i,
				"start_time": i * 10,
				"end_time": (i * 10 + 10),
				"templateUrl": "templates/item/default.html",
				"episode_id": "EP1"
			});
		}
	}));

	it('addLandingScreen should not cause duplicates', function () {
		modelSvc.addLandingScreen("EP1");
		modelSvc.addLandingScreen("EP1");
		modelSvc.addLandingScreen("EP1");
		modelSvc.resolveEpisodeEvents("EP1");
		expect(modelSvc.episodes.EP1.scenes.length).toEqual(11);
		expect(modelSvc.episodes.EP1.scenes[0].start_time).toEqual(0);
		expect(modelSvc.episodes.EP1.scenes[1].start_time).toEqual(0);
		expect(modelSvc.episodes.EP1.scenes[2].start_time).toEqual(10);
	});

	it('resolveEpisodeEvents should correct gaps between scenes', function () {
		modelSvc.events.scene2.end_time = 29;
		modelSvc.resolveEpisodeEvents("EP1");
		expect(modelSvc.events.scene2.end_time).toEqual(30);
	});

	it('resolveEpisodeEvents should correct overlapping scenes', function () {
		modelSvc.events.scene3.end_time = 41;
		modelSvc.resolveEpisodeEvents("EP1");
		expect(modelSvc.events.scene3.end_time).toEqual(40);
	});

	it('resolveEpisodeEvents should correct events that start before their scene does', function () {
		modelSvc.cache("event", {
			"_id": "annotation1",
			"_type": "Annotation",
			"start_time": 29.99,
			"end_time": 35,
			"templateUrl": "templates/item/default.html",
			"episode_id": "EP1"
		});
		modelSvc.resolveEpisodeEvents("EP1");
		expect(modelSvc.events.annotation1.start_time).toEqual(30);
		expect(modelSvc.events.annotation1.end_time).toEqual(35);
	});

	it('resolveEpisodeEvents should truncate events that end after their scene does', function () {
		modelSvc.cache("event", {
			"_id": "annotation1",
			"_type": "Annotation",
			"start_time": 28,
			"end_time": 35,
			"templateUrl": "templates/item/default.html",
			"episode_id": "EP1"
		});
		modelSvc.resolveEpisodeEvents("EP1");
		expect(modelSvc.events.annotation1.start_time).toEqual(28);
		expect(modelSvc.events.annotation1.end_time).toEqual(30);
	});

});
