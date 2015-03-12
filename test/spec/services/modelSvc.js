'use strict';

describe('Service: modelSvc', function () {

	// load the service's module
	beforeEach(module('com.inthetelling.story'));

	// instantiate service
	var modelSvc;

	// For easier debugging of episode event data
	var dumpEpisode = function (epId) {
		console.log("EPISODE------ episode ", epId);
		var episode = modelSvc.episodes[epId];
		angular.forEach(modelSvc.episodes[epId].scenes, function (scene) {
			console.log("Scene: ", scene._id, scene.start_time, scene.end_time);
			angular.forEach(scene.items, function (event) {
				console.log("  Evt: ", event._id, event.start_time, event.end_time);
			});
		});
	};

	var setupSceneContentsTest = function (data) {
		var episodeId = data[0].episode_id;
		// make a stub for the episode:
		modelSvc.cache("episode", {
			"_id": episodeId,
			"master_asset_id": "masterasset",
			"title": "Test Episode",
			"status": "Published",
			"templateUrl": "templates/episode/purdue.html",
			"styles": []
		});

		for (var i = 0; i < data.length; i++) {
			data[i].templateUrl = data[i].templateUrl || '';
			data[i].cur_episode_id = data[i].episode_id;
			modelSvc.cache("event", data[i]);
		}
		modelSvc.resolveEpisodeEvents(episodeId);
		return episodeId;
	};

	// used in the real eposide event data tests:
	var tallySceneContents = function (epId) {
		var eventsThatExist = {};
		var eventsInEpisode = {};
		var episode = modelSvc.episodes[epId];

		// loop through modelSvc.events, find all events with this ID
		angular.forEach(modelSvc.events, function (evt) {
			if (evt.cur_episode_id === epId) {
				eventsThatExist[evt._id] = evt;
			}
		});

		// loop through episode, count all scenes and their child events
		for (var i = 0; i < episode.scenes.length; i++) {
			var scene = episode.scenes[i];
			eventsInEpisode[scene._id] = scene;
			for (var j = 0; j < scene.items.length; j++) {
				var evt = scene.items[j];
				eventsInEpisode[evt._id] = evt;
			}
		}

		return Object.keys(eventsInEpisode).length;

	}

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
			"styles": []
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
				"episode_id": "EP1",
				"cur_episode_id": "EP1"
			});
		}

	}));

	it('modelSvc should exist', function () {
		expect(modelSvc).toNotEqual(undefined);
	});

	it('test rig beforeEach should have cached 11 scenes', function () {
		expect(Object.keys(modelSvc.events).length).toEqual(11);
	});

	it('addLandingScreen should not cause duplicates', function () {
		modelSvc.addLandingScreen("EP1");
		modelSvc.addLandingScreen("EP1");
		modelSvc.addLandingScreen("EP1");
		modelSvc.resolveEpisodeEvents("EP1");
		expect(modelSvc.episodes.EP1.scenes.length).toEqual(11);
		expect(modelSvc.episodes.EP1.scenes[0].start_time).toEqual(-0.01);
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
			"episode_id": "EP1",
			"cur_episode_id": "EP1",
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
			"episode_id": "EP1",
			"cur_episode_id": "EP1",
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
			"episode_id": "EP1",
			"cur_episode_id": "EP1"
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
			"episode_id": "EP1",
			"cur_episode_id": "EP1"
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
			"episode_id": "EP1",
			"cur_episode_id": "EP1"
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
			"episode_id": "EP1",
			"cur_episode_id": "EP1"
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
			"episode_id": "EP1",
			"cur_episode_id": "EP1"
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
			"cur_episode_id": "EP1",
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
			"cur_episode_id": "EP1",
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
			"cur_episode_id": "EP1",
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
			"cur_episode_id": "EP1",
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
			"cur_episode_id": "EP1",
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
			"cur_episode_id": "EP1",
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
			"cur_episode_id": "EP1",
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
			"cur_episode_id": "EP1",
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
			"cur_episode_id": "EP1",
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

	it('Multiple items whose start time match a scene start should all end up in that scene', function () {
		modelSvc.cache("event", {
			"_id": "annotation1",
			"_type": "Annotation",
			"start_time": 10,
			"end_time": 15,
			"templateUrl": "templates/item/default.html",
			"episode_id": "EP1",
			"cur_episode_id": "EP1",
		});
		modelSvc.cache("event", {
			"_id": "annotation2",
			"_type": "Annotation",
			"start_time": 10,
			"end_time": 12,
			"templateUrl": "templates/item/default.html",
			"episode_id": "EP1",
			"cur_episode_id": "EP1",
		});
		modelSvc.cache("event", {
			"_id": "annotation3",
			"_type": "Annotation",
			"start_time": 10,
			"end_time": 13,
			"templateUrl": "templates/item/default.html",
			"episode_id": "EP1",
			"cur_episode_id": "EP1",
		});
		modelSvc.resolveEpisodeEvents("EP1");
		expect(modelSvc.events.annotation1.start_time).toEqual(10);
		expect(modelSvc.events.annotation1.end_time).toEqual(15);

		expect(modelSvc.episodes.EP1.scenes[0].items.length).toEqual(0); // landing
		expect(modelSvc.episodes.EP1.scenes[1].items.length).toEqual(0); // 0-10
		expect(modelSvc.episodes.EP1.scenes[2].items.length).toEqual(3); // 10-20
		expect(modelSvc.episodes.EP1.scenes[3].items.length).toEqual(0); // 20-30
	});

	/* BEGIN resolveVideo tests: */
	/* NOTE some of these will fail in Chrome (we add fake params to the url in chrome to allow playback in multiple windows) */
	it('resolveVideoAsset should cope with missing alternate_urls', function () {
		modelSvc.cache("asset", {
			_id: "vid1",
			_type: "Asset::Video",
			url: "foo.mp4",
		});
		expect(modelSvc.assets["vid1"].urls).toEqual({
			"mp4": ["foo.mp4"],
			"webm": ["foo.webm"],
			"m3u8": ["foo.m3u8"],
			"youtube": []
		});
	});

	it('resolveVideoAsset should drop the original url if there is an alternate_urls array', function () {
		modelSvc.cache("asset", {
			_id: "vid1",
			_type: "Asset::Video",
			url: "foo.mp4",
			alternate_urls: [
				"bar.webm"
			]
		});
		expect(modelSvc.assets["vid1"].urls).toEqual({
			"mp4": [],
			"webm": ["bar.webm"],
			"m3u8": [],
			"youtube": []
		});
	});

	it('resolveVideoAsset should cope with missing alternate_urls when there is a you_tube_url', function () {
		modelSvc.cache("asset", {
			_id: "vid1",
			_type: "Asset::Video",
			url: "foo.mp4",
			you_tube_url: "https://www.youtube.com/watch?v=AAAAAAAAAAA"
		});
		expect(modelSvc.assets["vid1"].urls).toEqual({
			"mp4": ["foo.mp4"],
			"webm": ["foo.webm"],
			"m3u8": ["foo.m3u8"],
			"youtube": ['//www.youtube.com/embed/AAAAAAAAAAA']
		});
	});

	it('resolveVideoAsset should cope with missing alternate_urls when base url is youtube', function () {
		modelSvc.cache("asset", {
			_id: "vid1",
			_type: "Asset::Video",
			url: "https://www.youtube.com/watch?v=AAAAAAAAAAA",
		});
		expect(modelSvc.assets["vid1"].urls).toEqual({
			"mp4": [],
			"webm": [],
			"m3u8": [],
			"youtube": ['//www.youtube.com/embed/AAAAAAAAAAA']
		});
	});

	it('resolveVideoAsset should ignore bad you_tube_urls', function () {
		modelSvc.cache("asset", {
			_id: "vid1",
			_type: "Asset::Video",
			url: "https://www.youtube.com/",
			you_tube_url: "https://www.youtube.com/embed/broken",
		});
		expect(modelSvc.assets["vid1"].urls).toEqual({
			"mp4": [],
			"webm": [],
			"m3u8": [],
			"youtube": []
		});
	});

	it('resolveVideoAsset should ignore bad youtube alternate_urls', function () {
		modelSvc.cache("asset", {
			_id: "vid1",
			_type: "Asset::Video",
			url: "https://www.youtube.com/",
			alternate_urls: [
				'http://youtube.com/embed/broken'
			]
		});
		expect(modelSvc.assets["vid1"].urls).toEqual({
			"mp4": [],
			"webm": [],
			"m3u8": [],
			"youtube": []
		});
	});

	it('resolveVideoAsset should not extrapolate url filetypes if there is an alternate_urls array', function () {
		modelSvc.cache("asset", {
			_id: "vid1",
			_type: "Asset::Video",
			url: "foo.mp4",
			alternate_urls: [
				'bar.mp4'
			]
		});
		expect(modelSvc.assets["vid1"].urls).toEqual({
			"mp4": ["bar.mp4"],
			"webm": [],
			"m3u8": [],
			"youtube": []
		});
	});

	it('resolveVideoAsset for videos should prioritize alternate_urls over yout_tube_url', function () {
		modelSvc.cache("asset", {
			_id: "vid1",
			_type: "Asset::Video",
			url: "https://www.youtube.com/watch?v=AAAAAAAAAAA",
			alternate_urls: [
				"https://www.youtube.com/watch?v=BBBBBBBBBBB"
			]
		});
		expect(modelSvc.assets["vid1"].urls).toEqual({
			"mp4": [],
			"webm": [],
			"m3u8": [],
			"youtube": ['//www.youtube.com/embed/BBBBBBBBBBB']
		});
	});

	it('resolveVideoAsset should sort alternate_urls correctly by size', function () {
		modelSvc.cache("asset", {
			_id: "vid1",
			_type: "Asset::Video",
			url: "foo.mp4",
			alternate_urls: [
				"bar1000x1000.mp4",
				"bar123x123.webm",
				"bar250x250.mp4",
				"bar321x321.webm",
				"bar500x400.mp4"
			]
		});
		expect(modelSvc.assets["vid1"].urls).toEqual({
			mp4: ['bar250x250.mp4', 'bar500x400.mp4', 'bar1000x1000.mp4'],
			webm: ['bar123x123.webm', 'bar321x321.webm'],
			m3u8: [],
			youtube: []
		});
	});

	/* BEGIN real event data tests */
	// TODO check real event data and ensure it's not dropping any scenes on the floor
	describe("Testing real episode event data", function () {

		it('resolveEpisodeEvents should assign all events to scenes (1)', function () {
			var data = mockEpisodeEvents1;
			var episodeId = setupSceneContentsTest(data);
			expect(tallySceneContents(episodeId)).toEqual(data.length);
		});
		it('resolveEpisodeEvents should assign all events to scenes (2)', function () {
			var data = mockEpisodeEvents2;
			var episodeId = setupSceneContentsTest(data);
			expect(tallySceneContents(episodeId)).toEqual(data.length);
		});
		it('resolveEpisodeEvents should assign all events to scenes (3)', function () {
			var data = mockEpisodeEvents3;
			var episodeId = setupSceneContentsTest(data);
			expect(tallySceneContents(episodeId)).toEqual(data.length);
		});
		it('resolveEpisodeEvents should assign all events to scenes (4)', function () {
			var data = mockEpisodeEvents4;
			var episodeId = setupSceneContentsTest(data);
			expect(tallySceneContents(episodeId)).toEqual(data.length);
		});
		it('resolveEpisodeEvents should assign all events to scenes (5)', function () {
			var data = mockEpisodeEvents5;
			var episodeId = setupSceneContentsTest(data);
			expect(tallySceneContents(episodeId)).toEqual(data.length);
		});
		it('resolveEpisodeEvents should assign all events to scenes (6)', function () {
			var data = mockEpisodeEvents5;
			var episodeId = setupSceneContentsTest(data);
			expect(tallySceneContents(episodeId)).toEqual(data.length);
		});
	});
	/* END real event data tests */

});
