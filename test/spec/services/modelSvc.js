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

	it('items should land in the correct scene array', function () {
		modelSvc.cache("event", {
			"_id": "annotation1",
			"_type": "Annotation",
			"start_time": 10,
			"end_time": 12,
			"templateUrl": "templates/item/default.html",
			"episode_id": "EP1"
		});
		modelSvc.resolveEpisodeEvents("EP1");
		expect(modelSvc.episodes.EP1.scenes[1].items.length).toEqual(0);
		expect(modelSvc.episodes.EP1.scenes[2].items.length).toEqual(1);
		expect(modelSvc.episodes.EP1.scenes[3].items.length).toEqual(0);
	});

	it('items with the same start and end time, which match a scene boundary, should not wind up in two scenes', function () {
		modelSvc.cache("event", {
			"_id": "annotation1",
			"_type": "Annotation",
			"start_time": 10,
			"end_time": 10,
			"templateUrl": "templates/item/default.html",
			"episode_id": "EP1"
		});
		modelSvc.resolveEpisodeEvents("EP1");
		expect(modelSvc.episodes.EP1.scenes[1].items.length).toEqual(0);
		expect(modelSvc.episodes.EP1.scenes[2].items.length).toEqual(1);
		expect(modelSvc.episodes.EP1.scenes[3].items.length).toEqual(0);
		expect(modelSvc.events.annotation1.start_time).toEqual(10);
		expect(modelSvc.events.annotation1.end_time).toEqual(10);
	});

	it('items whose start and end match a scene\'s start and end should not end up in two scenes', function () {
		modelSvc.cache("event", {
			"_id": "annotation1",
			"_type": "Annotation",
			"start_time": 10,
			"end_time": 20,
			"templateUrl": "templates/item/default.html",
			"episode_id": "EP1"
		});
		modelSvc.resolveEpisodeEvents("EP1");
		expect(modelSvc.episodes.EP1.scenes[1].items.length).toEqual(0);
		expect(modelSvc.episodes.EP1.scenes[2].items.length).toEqual(1);
		expect(modelSvc.episodes.EP1.scenes[3].items.length).toEqual(0);
		expect(modelSvc.events.annotation1.start_time).toEqual(10);
		expect(modelSvc.events.annotation1.end_time).toEqual(20);
	});

	it('Items bumped to next scene should not end up in both scenes', function () {
		modelSvc.cache("event", {
			"_id": "annotation1",
			"_type": "Annotation",
			"start_time": 9.9,
			"end_time": 11,
			"templateUrl": "templates/item/default.html",
			"episode_id": "EP1"
		});
		modelSvc.resolveEpisodeEvents("EP1");
		expect(modelSvc.episodes.EP1.scenes[1].items.length).toEqual(0);
		expect(modelSvc.episodes.EP1.scenes[2].items.length).toEqual(1);
		expect(modelSvc.episodes.EP1.scenes[3].items.length).toEqual(0);
		expect(modelSvc.events.annotation1.start_time).toEqual(10);
		expect(modelSvc.events.annotation1.end_time).toEqual(11);
	});
	it('truncated items should not end up in both scenes', function () {
		modelSvc.cache("event", {
			"_id": "annotation1",
			"_type": "Annotation",
			"start_time": 9,
			"end_time": 10.5,
			"templateUrl": "templates/item/default.html",
			"episode_id": "EP1"
		});
		modelSvc.resolveEpisodeEvents("EP1");
		expect(modelSvc.episodes.EP1.scenes[1].items.length).toEqual(1);
		expect(modelSvc.episodes.EP1.scenes[2].items.length).toEqual(0);
		expect(modelSvc.episodes.EP1.scenes[3].items.length).toEqual(0);
		expect(modelSvc.events.annotation1.start_time).toEqual(9);
		expect(modelSvc.events.annotation1.end_time).toEqual(10);
	});

	it('Episode annotators should generate consistent keys', function () {
		modelSvc.cache("event", {
			"_id": "an1",
			"_type": "Annotation",
			"start_time": 1,
			"episode_id": "EP1",
			"templateUrl": "templates/item/default.html",
			"annotator": {
				en: "Mister Smith",
				es: "BB",
				aa: "AA",
				et: "CC"
			}
		});

		modelSvc.resolveEpisodeEvents("EP1");

		// key should be the default language, or english,  followed by other available languages 
		expect(modelSvc.episodes.EP1.annotators["Mister Smith"].key).toEqual("Mister Smith / AA / BB / CC");
	});

	it('Episode annotators should combine annotators correctly', function () {
		modelSvc.cache("event", {
			"_id": "an1",
			"_type": "Annotation",
			"start_time": 1,
			"episode_id": "EP1",
			"templateUrl": "templates/item/default.html",
			"annotator": {
				en: "Mister Smith",
			}
		});
		modelSvc.cache("event", {
			"_id": "an2",
			"_type": "Annotation",
			"start_time": 1,
			"episode_id": "EP1",
			"templateUrl": "templates/item/default.html",
			"annotator": {
				en: "Mister Smith",
				aa: "AA",
			}
		});
		modelSvc.cache("event", {
			"_id": "an3",
			"_type": "Annotation",
			"start_time": 1,
			"episode_id": "EP1",
			"templateUrl": "templates/item/default.html",
			"annotator": {
				en: "Mister Smith",
				bb: "BB"
			}
		});

		modelSvc.resolveEpisodeEvents("EP1");

		// Those translations should be merged into a single key
		expect(Object.keys(modelSvc.episodes.EP1.annotators)).toEqual(["Mister Smith"]);
		expect(modelSvc.episodes.EP1.annotators["Mister Smith"].key).toEqual("Mister Smith / AA / BB");

	});

	it('Episode annotators should not try to combine "undefined" keys', function () {
		modelSvc.cache("event", {
			"_id": "an1",
			"_type": "Annotation",
			"start_time": 1,
			"episode_id": "EP1",
			"templateUrl": "templates/item/default.html",
			"annotator": {
				es: "AA",
			}
		});
		modelSvc.cache("event", {
			"_id": "an2",
			"_type": "Annotation",
			"start_time": 1,
			"episode_id": "EP1",
			"templateUrl": "templates/item/default.html",
			"annotator": {
				zh: "BB",
			}
		});
		modelSvc.cache("event", {
			"_id": "an3",
			"_type": "Annotation",
			"start_time": 1,
			"episode_id": "EP1",
			"templateUrl": "templates/item/default.html",
			"annotator": {
				pt: "CC",
			}
		});

		modelSvc.resolveEpisodeEvents("EP1");
		expect(Object.keys(modelSvc.episodes.EP1.annotators)).toEqual(["AA", "BB", "CC"]);

	});

	it('Episode annotators should replace old keys as translations are added', function () {
		modelSvc.cache("event", {
			"_id": "an1",
			"_type": "Annotation",
			"start_time": 1,
			"episode_id": "EP1",
			"templateUrl": "templates/item/default.html",
			"annotator": {
				en: "Mister Smith",
			}
		});

		modelSvc.resolveEpisodeEvents("EP1");

		modelSvc.cache("event", {
			"_id": "an2",
			"_type": "Annotation",
			"start_time": 1,
			"episode_id": "EP1",
			"templateUrl": "templates/item/default.html",
			"annotator": {
				en: "Mister Smith",
				zh: "BB"
			}
		});
		modelSvc.resolveEpisodeEvents("EP1");
		expect(Object.keys(modelSvc.episodes.EP1.annotators)).toEqual(["Mister Smith"]);
		expect(modelSvc.episodes.EP1.annotators["Mister Smith"]).toEqual({
			name: {
				en: 'Mister Smith',
				zh: 'BB'
			},
			annotation_image_id: undefined,
			key: 'Mister Smith / BB'
		});
	});

});
