'use strict';
import {
  mockEpisodeEvents1,
  mockEpisodeEvents2,
  mockEpisodeEvents3,
  mockEpisodeEvents4,
  mockEpisodeEvents5,
  mockEpisodeEvents6,
  mockEpisodeEvents7
} from '../../../../test/mock/mock-episodes';

describe('Service: modelSvc', () => {

  // load the service's module
  beforeEach(angular.mock.module('np.client'));

  // instantiate service
  var modelSvc;
  var youtubeSvc;
  // For easier debugging of episode event data
  // var dumpEpisode = function (epId) {
  // 	console.log("------------------------ EPISODE ", epId);
  // 	var episode = modelSvc.episodes[epId];
  // 	angular.forEach(modelSvc.episodes[epId].scenes, function (scene) {
  // 		console.log("Scene: ", scene._id, scene.start_time, scene.end_time);
  // 		angular.forEach(scene.items, function (event) {
  // 			console.log("  Evt: ", event._id, event.start_time, event.end_time);
  // 		});
  // 	});
  // };

  var setupSceneContentsTest = function (data) {
    var episodeId = data[0].episode_id;
    // make a stub for the episode:
    modelSvc.cache('episode', {
      '_id': episodeId,
      'master_asset_id': 'masterasset',
      'title': 'Test Episode',
      'status': 'Published',
      'templateUrl': 'templates/episode/purdue.html',
      'styles': [],
      'template': {
        pro_episode_template: false
      }
    });

    for (var i = 0; i < data.length; i++) {
      data[i].templateUrl = data[i].templateUrl || '';
      data[i].cur_episode_id = data[i].episode_id;
      modelSvc.cache('event', data[i]);
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
    // dumpEpisode(epId);
    return Object.keys(eventsInEpisode).length;
  };

  beforeEach(angular.mock.inject(function (_modelSvc_, _youtubeUrlService_) {
    modelSvc = _modelSvc_;
    youtubeSvc = _youtubeUrlService_; // only to retrieve embed params

    // data to test against
    modelSvc.cache('episode', {
      '_id': 'EP1',
      'master_asset_id': 'masterasset',
      'template': {
        pro_episode_template: false
      }
    });
    modelSvc.addLandingScreen('EP1');

    // one scene every ten seconds
    for (var i = 0; i < 10; i++) {
      modelSvc.cache('event', {
        '_id': 'scene' + i,
        '_type': 'Scene',
        'title': 'Scene ' + i,
        'start_time': i * 10,
        'end_time': (i * 10 + 10),
        'templateUrl': 'templates/item/default.html',
        'episode_id': 'EP1',
        'cur_episode_id': 'EP1'
      });
    }

    modelSvc.resolveEpisodeEvents('EP1');
    var masterAsset = {
      duration: modelSvc.episodes['EP1'].scenes[modelSvc.episodes['EP1'].scenes.length - 1].end_time
    };
    modelSvc.episodes['EP1'].masterAsset = masterAsset;

    // and an empty episode:
    modelSvc.cache('episode', {
      '_id': 'EP2',
      'master_asset_id': 'masterasset',
      'template': {
        pro_episode_template: false
      }
    });

  }));

  it('modelSvc should exist', () => {
    expect(modelSvc).not.toBe(undefined);
  });

  it('test rig beforeEach should have cached 11 scenes', () => {
    expect(Object.keys(modelSvc.events).length).toEqual(11);
  });

  it('addLandingScreen should not cause duplicates', () => {
    modelSvc.addLandingScreen('EP1');
    modelSvc.addLandingScreen('EP1');
    modelSvc.addLandingScreen('EP1');
    modelSvc.resolveEpisodeEvents('EP1');
    expect(modelSvc.episodes.EP1.scenes.length).toEqual(11);
    expect(modelSvc.episodes.EP1.scenes[0].start_time).toEqual(-0.01);
    expect(modelSvc.episodes.EP1.scenes[1].start_time).toEqual(0);
    expect(modelSvc.episodes.EP1.scenes[2].start_time).toEqual(10);
  });

  it('events should not get attached to the landing screen', () => {

    modelSvc.cache('event', {
      '_id': 'TEST',
      '_type': 'Annotation',
      'start_time': 0,
      'end_time': 0.0001,
      'templateUrl': 'templates/item/default.html',
      'episode_id': 'EP1',
      'cur_episode_id': 'EP1',
    });
    modelSvc.addLandingScreen('EP1');
    modelSvc.cache('event', {
      '_id': 'TEST2',
      '_type': 'Annotation',
      'start_time': 0,
      'end_time': 0.0001,
      'templateUrl': 'templates/item/default.html',
      'episode_id': 'EP1',
      'cur_episode_id': 'EP1',
    });
    modelSvc.resolveEpisodeEvents('EP1');

    expect(modelSvc.episodes.EP1.scenes[0].items.length).toEqual(0); // landing
    expect(modelSvc.episodes.EP1.scenes[1].items.length).toEqual(2); // scene 0

  });

  it('addEndingScreen should extend the duration of the last real scene to the master asset duration', () => {
    modelSvc.episodes.EP1.masterAsset = {
      duration: 110
    };
    modelSvc.addEndingScreen('EP1');
    expect(modelSvc.episodes.EP1.scenes[10].end_time).toEqual(109.9);
  });

  it('addEndingScreen should truncate the duration of the last real scene to the master asset duration', () => {
    modelSvc.episodes.EP1.masterAsset = {
      duration: 95
    };
    modelSvc.addEndingScreen('EP1');
    expect(modelSvc.episodes.EP1.scenes[10].end_time).toEqual(94.9);
  });

  it('addEndingScreen should not cause duplicates, even if the duration changes', () => {
    var sceneCount = modelSvc.episodes.EP1.scenes.length;
    modelSvc.addEndingScreen('EP1');
    modelSvc.episodes.EP1.masterAsset = {
      duration: 105
    };
    modelSvc.addEndingScreen('EP1');
    modelSvc.episodes.EP1.masterAsset = {
      duration: 115
    };
    modelSvc.addEndingScreen('EP1');
    modelSvc.episodes.EP1.masterAsset = {
      duration: 95
    };
    modelSvc.addEndingScreen('EP1'); //resolve isn't called because we short circuit, so the end_time doesn't get fixed
    modelSvc.resolveEpisodeEvents('EP1');

    //TODO: add separate tests for modelSvc.scenes testing of start and end times
    //expect(modelSvc.episodes.EP1.scenes[modelSvc.episodes.EP1.scenes.length-1].end_time).toEqual(95);

    //only one should get added
    expect(modelSvc.episodes.EP1.scenes.length).toEqual(sceneCount + 1);
  });

  it('Events near end of episode should not get dropped', () => {
    modelSvc.episodes.EP1.masterAsset = {
      duration: 100
    };
    modelSvc.cache('event', {
      '_id': 'TEST',
      '_type': 'Annotation',
      'start_time': 99.99,
      'end_time': 100,
      'templateUrl': 'templates/item/default.html',
      'episode_id': 'EP1',
      'cur_episode_id': 'EP1',
    });
    modelSvc.resolveEpisodeEvents('EP1');

    expect(modelSvc.episodes.EP1.scenes[10].items.length).toEqual(1); // annotation1 should be attached to the scene running from 90-99.9
  });

  it('Events near or at end of episode should not get attached to the ending screen', () => {
    modelSvc.episodes.EP1.masterAsset = {
      duration: 100
    };
    modelSvc.cache('event', {
      '_id': 'TEST',
      '_type': 'Annotation',
      'start_time': 99.9,
      'end_time': 100,
      'templateUrl': 'templates/item/default.html',
      'episode_id': 'EP1',
      'cur_episode_id': 'EP1',
    });
    modelSvc.cache('event', {
      '_id': 'TEST2',
      '_type': 'Annotation',
      'start_time': 99.9,
      'end_time': 100,
      'templateUrl': 'templates/item/default.html',
      'episode_id': 'EP1',
      'cur_episode_id': 'EP1',
    });
    modelSvc.cache('event', {
      '_id': 'TEST3',
      '_type': 'Annotation',
      'start_time': 99.89,
      'end_time': 110,
      'templateUrl': 'templates/item/default.html',
      'episode_id': 'EP1',
      'cur_episode_id': 'EP1',
    });
    modelSvc.cache('event', {
      '_id': 'TEST4',
      '_type': 'Annotation',
      'start_time': 99.99,
      'end_time': 110,
      'templateUrl': 'templates/item/default.html',
      'episode_id': 'EP1',
      'cur_episode_id': 'EP1',
    });
    modelSvc.addEndingScreen('EP1');
    modelSvc.resolveEpisodeEvents('EP1');

    expect(modelSvc.episodes.EP1.scenes[10].items.length).toEqual(4); // annotation1 should be attached to the scene running from 90-99.9
    expect(modelSvc.episodes.EP1.scenes[11].items.length).toEqual(0); // not the ending scene
  });

  it('addEndingScreen should not do anything to episodes without scenes', () => {
    modelSvc.episodes.EP2.masterAsset = {
      duration: 100
    };
    modelSvc.addEndingScreen('EP2');
    expect(modelSvc.episodes.EP2.scenes).toBe(undefined);
  });
  it('addEndingScreen should not do anything to episodes with only a landing screen', () => {

    modelSvc.episodes.EP2.masterAsset = {
      duration: 100
    };
    modelSvc.addLandingScreen('EP2');
    modelSvc.addEndingScreen('EP2');
    modelSvc.resolveEpisodeEvents('EP2');
    expect(modelSvc.episodes.EP2.scenes.length).toEqual(1);
  });
  it('resolveEpisodeEvents should correct gaps between scenes', () => {
    modelSvc.events.scene2.end_time = 29;
    modelSvc.resolveEpisodeEvents('EP1');
    expect(modelSvc.events.scene2.end_time).toEqual(30);
  });

  it('resolveEpisodeEvents should correct overlapping scenes', () => {
    modelSvc.events.scene3.end_time = 41;
    modelSvc.resolveEpisodeEvents('EP1');
    expect(modelSvc.events.scene3.end_time).toEqual(40);
  });

  it('resolveEpisodeEvents should correct events that start before their scene does', () => {
    modelSvc.cache('event', {
      '_id': 'annotation1',
      '_type': 'Annotation',
      'start_time': 29.99,
      'end_time': 35,
      'templateUrl': 'templates/item/default.html',
      'episode_id': 'EP1',
      'cur_episode_id': 'EP1',
    });
    modelSvc.resolveEpisodeEvents('EP1');
    expect(modelSvc.events.annotation1.start_time).toEqual(30);
    expect(modelSvc.events.annotation1.end_time).toEqual(35);
  });

  it('resolveEpisodeEvents should truncate events that end after their scene does', () => {
    modelSvc.cache('event', {
      '_id': 'annotation1',
      '_type': 'Annotation',
      'start_time': 28,
      'end_time': 35,
      'templateUrl': 'templates/item/default.html',
      'episode_id': 'EP1',
      'cur_episode_id': 'EP1',
    });
    modelSvc.resolveEpisodeEvents('EP1');
    expect(modelSvc.events.annotation1.start_time).toEqual(28);
    expect(modelSvc.events.annotation1.end_time).toEqual(30);
  });

  it('items should land in the correct scene array', () => {
    modelSvc.cache('event', {
      '_id': 'annotation1',
      '_type': 'Annotation',
      'start_time': 10,
      'end_time': 12,
      'templateUrl': 'templates/item/default.html',
      'episode_id': 'EP1',
      'cur_episode_id': 'EP1'
    });
    modelSvc.resolveEpisodeEvents('EP1');
    expect(modelSvc.episodes.EP1.scenes[1].items.length).toEqual(0);
    expect(modelSvc.episodes.EP1.scenes[2].items.length).toEqual(1);
    expect(modelSvc.episodes.EP1.scenes[3].items.length).toEqual(0);
  });

  it('items with the same start and end time, which match a scene boundary, should not wind up in two scenes', () => {
    modelSvc.cache('event', {
      '_id': 'annotation1',
      '_type': 'Annotation',
      'start_time': 10,
      'end_time': 10,
      'templateUrl': 'templates/item/default.html',
      'episode_id': 'EP1',
      'cur_episode_id': 'EP1'
    });
    modelSvc.resolveEpisodeEvents('EP1');
    expect(modelSvc.episodes.EP1.scenes[1].items.length).toEqual(0);
    expect(modelSvc.episodes.EP1.scenes[2].items.length).toEqual(1);
    expect(modelSvc.episodes.EP1.scenes[3].items.length).toEqual(0);
    expect(modelSvc.events.annotation1.start_time).toEqual(10);
    expect(modelSvc.events.annotation1.end_time).toEqual(10);
  });

  it('items whose start and end match a scene\'s start and end should not end up in two scenes', () => {
    modelSvc.cache('event', {
      '_id': 'annotation1',
      '_type': 'Annotation',
      'start_time': 10,
      'end_time': 20,
      'templateUrl': 'templates/item/default.html',
      'episode_id': 'EP1',
      'cur_episode_id': 'EP1'
    });
    modelSvc.resolveEpisodeEvents('EP1');
    expect(modelSvc.episodes.EP1.scenes[1].items.length).toEqual(0);
    expect(modelSvc.episodes.EP1.scenes[2].items.length).toEqual(1);
    expect(modelSvc.episodes.EP1.scenes[3].items.length).toEqual(0);
    expect(modelSvc.events.annotation1.start_time).toEqual(10);
    expect(modelSvc.events.annotation1.end_time).toEqual(20);
  });

  it('Items bumped to next scene should not end up in both scenes', () => {
    modelSvc.cache('event', {
      '_id': 'annotation1',
      '_type': 'Annotation',
      'start_time': 9.9,
      'end_time': 11,
      'templateUrl': 'templates/item/default.html',
      'episode_id': 'EP1',
      'cur_episode_id': 'EP1'
    });
    modelSvc.resolveEpisodeEvents('EP1');
    expect(modelSvc.episodes.EP1.scenes[1].items.length).toEqual(0);
    expect(modelSvc.episodes.EP1.scenes[2].items.length).toEqual(1);
    expect(modelSvc.episodes.EP1.scenes[3].items.length).toEqual(0);
    expect(modelSvc.events.annotation1.start_time).toEqual(10);
    expect(modelSvc.events.annotation1.end_time).toEqual(11);
  });

  it('truncated items should not end up in both scenes', () => {
    modelSvc.cache('event', {
      '_id': 'annotation1',
      '_type': 'Annotation',
      'start_time': 9,
      'end_time': 10.5,
      'templateUrl': 'templates/item/default.html',
      'episode_id': 'EP1',
      'cur_episode_id': 'EP1'
    });
    modelSvc.resolveEpisodeEvents('EP1');
    expect(modelSvc.episodes.EP1.scenes[1].items.length).toEqual(1);
    expect(modelSvc.episodes.EP1.scenes[2].items.length).toEqual(0);
    expect(modelSvc.episodes.EP1.scenes[3].items.length).toEqual(0);
    expect(modelSvc.events.annotation1.start_time).toEqual(9);
    expect(modelSvc.events.annotation1.end_time).toEqual(10);
  });

  it('Episode annotators should generate consistent keys', () => {
    modelSvc.cache('event', {
      '_id': 'an1',
      '_type': 'Annotation',
      'start_time': 1,
      'episode_id': 'EP1',
      'cur_episode_id': 'EP1',
      'templateUrl': 'templates/item/default.html',
      'annotator': {
        en: 'Mister Smith',
        es: 'BB',
        aa: 'AA',
        et: 'CC'
      }
    });

    modelSvc.resolveEpisodeEvents('EP1');

    // key should be the default language, or english,  followed by other available languages
    expect(modelSvc.episodes.EP1.annotators['Mister Smith'].key).toEqual('Mister Smith / AA / BB / CC');
  });

  it('Episode annotators should combine annotators correctly', () => {
    modelSvc.cache('event', {
      '_id': 'an1',
      '_type': 'Annotation',
      'start_time': 1,
      'episode_id': 'EP1',
      'cur_episode_id': 'EP1',
      'templateUrl': 'templates/item/default.html',
      'annotator': {
        en: 'Mister Smith',
      }
    });
    modelSvc.cache('event', {
      '_id': 'an2',
      '_type': 'Annotation',
      'start_time': 1,
      'episode_id': 'EP1',
      'cur_episode_id': 'EP1',
      'templateUrl': 'templates/item/default.html',
      'annotator': {
        en: 'Mister Smith',
        aa: 'AA',
      }
    });
    modelSvc.cache('event', {
      '_id': 'an3',
      '_type': 'Annotation',
      'start_time': 1,
      'episode_id': 'EP1',
      'cur_episode_id': 'EP1',
      'templateUrl': 'templates/item/default.html',
      'annotator': {
        en: 'Mister Smith',
        bb: 'BB'
      }
    });

    modelSvc.resolveEpisodeEvents('EP1');

    // Those translations should be merged into a single key
    expect(Object.keys(modelSvc.episodes.EP1.annotators)).toEqual(['Mister Smith']);
    expect(modelSvc.episodes.EP1.annotators['Mister Smith'].key).toEqual('Mister Smith / AA / BB');
  });

  it('Episode annotators should not try to combine "undefined" keys', () => {
    modelSvc.cache('event', {
      '_id': 'an1',
      '_type': 'Annotation',
      'start_time': 1,
      'episode_id': 'EP1',
      'cur_episode_id': 'EP1',
      'templateUrl': 'templates/item/default.html',
      'annotator': {
        es: 'AA',
      }
    });
    modelSvc.cache('event', {
      '_id': 'an2',
      '_type': 'Annotation',
      'start_time': 1,
      'episode_id': 'EP1',
      'cur_episode_id': 'EP1',
      'templateUrl': 'templates/item/default.html',
      'annotator': {
        zh: 'BB',
      }
    });
    modelSvc.cache('event', {
      '_id': 'an3',
      '_type': 'Annotation',
      'start_time': 1,
      'episode_id': 'EP1',
      'cur_episode_id': 'EP1',
      'templateUrl': 'templates/item/default.html',
      'annotator': {
        pt: 'CC',
      }
    });

    modelSvc.resolveEpisodeEvents('EP1');
    expect(Object.keys(modelSvc.episodes.EP1.annotators)).toEqual(['AA', 'BB', 'CC']);
  });

  it('Episode annotators should replace old keys as translations are added', () => {
    modelSvc.cache('event', {
      '_id': 'an1',
      '_type': 'Annotation',
      'start_time': 1,
      'episode_id': 'EP1',
      'cur_episode_id': 'EP1',
      'templateUrl': 'templates/item/default.html',
      'annotator': {
        en: 'Mister Smith',
      }
    });

    modelSvc.resolveEpisodeEvents('EP1');

    modelSvc.cache('event', {
      '_id': 'an2',
      '_type': 'Annotation',
      'start_time': 1,
      'episode_id': 'EP1',
      'cur_episode_id': 'EP1',
      'templateUrl': 'templates/item/default.html',
      'annotator': {
        en: 'Mister Smith',
        zh: 'BB'
      }
    });
    modelSvc.resolveEpisodeEvents('EP1');
    expect(Object.keys(modelSvc.episodes.EP1.annotators)).toEqual(['Mister Smith']);
    expect(modelSvc.episodes.EP1.annotators['Mister Smith']).toEqual({
      name: {
        en: 'Mister Smith',
        zh: 'BB'
      },
      annotation_image_id: undefined,
      key: 'Mister Smith / BB'
    });
  });

  it('Multiple items whose start time match a scene start should all end up in that scene', () => {
    modelSvc.cache('event', {
      '_id': 'annotation1',
      '_type': 'Annotation',
      'start_time': 10,
      'end_time': 15,
      'templateUrl': 'templates/item/default.html',
      'episode_id': 'EP1',
      'cur_episode_id': 'EP1',
    });
    modelSvc.cache('event', {
      '_id': 'annotation2',
      '_type': 'Annotation',
      'start_time': 10,
      'end_time': 12,
      'templateUrl': 'templates/item/default.html',
      'episode_id': 'EP1',
      'cur_episode_id': 'EP1',
    });
    modelSvc.cache('event', {
      '_id': 'annotation3',
      '_type': 'Annotation',
      'start_time': 10,
      'end_time': 13,
      'templateUrl': 'templates/item/default.html',
      'episode_id': 'EP1',
      'cur_episode_id': 'EP1',
    });
    modelSvc.resolveEpisodeEvents('EP1');
    expect(modelSvc.events.annotation1.start_time).toEqual(10);
    expect(modelSvc.events.annotation1.end_time).toEqual(15);

    expect(modelSvc.episodes.EP1.scenes[0].items.length).toEqual(0); // landing
    expect(modelSvc.episodes.EP1.scenes[1].items.length).toEqual(0); // 0-10
    expect(modelSvc.episodes.EP1.scenes[2].items.length).toEqual(3); // 10-20
    expect(modelSvc.episodes.EP1.scenes[3].items.length).toEqual(0); // 20-30
  });

  /* BEGIN resolveVideo tests: */
  /* NOTE some of these will fail in Chrome (we add fake params to the url in chrome to allow playback in multiple windows) */
  it('resolveVideoAsset should cope with missing alternate_urls', () => {


    modelSvc.cache('asset', {
      _id: 'vid1',
      _type: 'Asset::Video',
      url: 'foo.mp4'
    });
    const urls = modelSvc.assets['vid1'].urls;

    expect(urls.mp4).toMatch(/\.mp4/);
    expect(urls.webm).toMatch(/\.webm/);
    // expect(urls.m3u8).toMatch(/\.m3u8/);
  });

  it('resolveVideoAsset should drop the original url if there is an alternate_urls array', () => {
    modelSvc.cache('asset', {
      _id: 'vid1',
      _type: 'Asset::Video',
      url: 'foo.mp4',
      alternate_urls: [
        'bar.webm'
      ]
    });

    const urls = modelSvc.assets['vid1'].urls;
    expect(urls.webm).toMatch(/bar\.webm/);
  });

  it('resolveVideoAsset should cope with missing alternate_urls when there is a you_tube_url', () => {
    modelSvc.cache('asset', {
      _id: 'vid1',
      _type: 'Asset::Video',
      url: 'foo.mp4',
      you_tube_url: 'https://www.youtube.com/watch?v=AAAAAAAAAAA'
    });
    const urls = modelSvc.assets['vid1'].mediaSrcArr[0];
    expect(urls).toBe('//www.youtube.com/embed/AAAAAAAAAAA' + youtubeSvc.embedParams());
  });

  it('resolveVideoAsset should cope with missing alternate_urls when base url is youtube', () => {
    modelSvc.cache('asset', {
      _id: 'vid1',
      _type: 'Asset::Video',
      url: 'https://www.youtube.com/watch?v=AAAAAAAAAAA'
    });
    const urls = modelSvc.assets['vid1'].mediaSrcArr[0];
    expect(urls).toBe('//www.youtube.com/embed/AAAAAAAAAAA' + youtubeSvc.embedParams());
  });

  it('resolveVideoAsset should ignore bad you_tube_urls', () => {
    modelSvc.cache('asset', {
      _id: 'vid1',
      _type: 'Asset::Video',
      url: 'https://www.youtube.com/',
      you_tube_url: 'https://www.youtube.com/embed/broken'
    });

    expect(modelSvc.assets['vid1'].urls.youtube.length).toBe(0);
  });

  it('resolveVideoAsset should ignore bad youtube alternate_urls', () => {
    modelSvc.cache('asset', {
      _id: 'vid1',
      _type: 'Asset::Video',
      url: 'https://www.youtube.com/',
      alternate_urls: [
        'http://youtube.com/embed/broken'
      ]
    });
    expect(modelSvc.assets['vid1'].urls.youtube.length).toBe(0);
  });

  it('resolveVideoAsset should not extrapolate url filetypes if there is an alternate_urls array', () => {
    modelSvc.cache('asset', {
      _id: 'vid1',
      _type: 'Asset::Video',
      url: 'foo.mp4',
      alternate_urls: [
        'bar.mp4'
      ]
    });
    const urls = modelSvc.assets['vid1'].urls;
    expect(urls.mp4).toMatch(/bar\.mp4/);
  });

  // it('resolveVideoAsset for videos should prioritize alternate_urls over yout_tube_url', () => {
  //   modelSvc.cache('asset', {
  //     _id: 'vid1',
  //     _type: 'Asset::Video',
  //     url: 'https://www.youtube.com/watch?v=AAAAAAAAAAA',
  //     alternate_urls: [
  //       'https://www.youtube.com/watch?v=BBBBBBBBBBB'
  //     ]
  //   });
  //   expect(modelSvc.assets['vid1'].urls).toEqual({
  //     'mp4': [],
  //     'webm': [],
  //     'youtube': ['//www.youtube.com/embed/BBBBBBBBBBB' + youtubeSvc.embedParams()],
  //     'kaltura': []
  //   });
  // });

  it('resolveVideoAsset should sort alternate_urls correctly by size', () => {
    modelSvc.cache('asset', {
      _id: 'vid1',
      _type: 'Asset::Video',
      url: 'foo.mp4',
      alternate_urls: [
        'bar1000x1000.mp4',
        'bar123x123.webm',
        'bar250x250.mp4',
        'bar321x321.webm',
        'bar500x400.mp4'
      ]
    });

    const urls = modelSvc.assets['vid1'].urls;
    expect(urls.mp4[0]).toMatch(/bar250x250.mp4/);
    expect(urls.mp4[1]).toMatch(/bar500x400.mp4/);
    expect(urls.mp4[2]).toMatch(/bar1000x1000.mp4/);
  });

  describe('Event Hierarchy', () => {

    var epId;
    beforeEach(() => {
      epId = 'stubEpi';
      modelSvc.cache('episode', {
        '_id': epId,
        'master_asset_id': 'masterasset',
        'title': 'Test Episode',
        'status': 'Published',
        'styles': [],
        'template': {
          'pro_episode_template': false
        }
      });

      var data = mockEpisodeEvents7;

      for (var i = 0; i < data.length; i++) {
        data[i]._id = epId + i;
        data[i].cur_episode_id = epId;
        data[i].episode_id = epId;
        modelSvc.cache('event', data[i]);
      }

      modelSvc.resolveEpisodeEvents(epId);
    });

    it('should sort Chapters to the top', () => {

      expect(modelSvc.episodes.stubEpi.items[0]._type).toEqual('Chapter');
      expect(modelSvc.episodes.stubEpi.items[1].chapter_marker).toEqual(true);
    });

    xit('should sort H1 annotations ahead of H2', () => {
      expect(modelSvc.episodes.stubEpi.items[2].templateUrl).toEqual('templates/item/text-h1.html');
      expect(modelSvc.episodes.stubEpi.items[3].templateUrl).toEqual('templates/item/text-h2.html');
    });

    xit('should sort Annotations (H1, H2) ahead of Transcripts', () => {
      expect(modelSvc.episodes.stubEpi.items[3].producerItemType).toEqual('annotation');
      expect(modelSvc.episodes.stubEpi.items[4].producerItemType).toEqual('transcript');
    });

    xit('should sort transcripts ahead of Links', () => {
      expect(modelSvc.episodes.stubEpi.items[4].producerItemType).toEqual('transcript');
      expect(modelSvc.episodes.stubEpi.items[5].producerItemType).toEqual('link');
    });

    xit('should sort Links ahead of Uploads', () => {
      expect(modelSvc.episodes.stubEpi.items[5].producerItemType).toEqual('link');
      expect(modelSvc.episodes.stubEpi.items[6].producerItemType).toEqual('file');
    });

    xit('should sort Documents ahead of Images', () => {
      expect(modelSvc.episodes.stubEpi.items[6].producerItemType).toEqual('file');
      expect(modelSvc.episodes.stubEpi.items[7].producerItemType).toEqual('image');
    });

    xit('should put definition, pullquotes, text-as-transmedia, at the bottom', () => {
      expect(modelSvc.episodes.stubEpi.items[8].templateUrl).toMatch(/text-definition|pullquote-noattrib/);
    });
  });


  /* BEGIN real event data tests */
  // TODO check real event data and ensure it's not dropping any scenes on the floor
  describe('Testing real episode event data', () => {
    xit('resolveEpisodeEvents should assign all events to scenes (1)', () => {
      var data = mockEpisodeEvents1;
      var episodeId = setupSceneContentsTest(data);
      expect(tallySceneContents(episodeId)).toEqual(data.length);
    });
    xit('resolveEpisodeEvents should assign all events to scenes (2)', () => {
      var data = mockEpisodeEvents1;
      var episodeId = setupSceneContentsTest(data);
      expect(tallySceneContents(episodeId)).toEqual(data.length);
    });
    it('resolveEpisodeEvents should assign all events to scenes (3)', () => {
      var data = mockEpisodeEvents3;
      var episodeId = setupSceneContentsTest(data);
      expect(tallySceneContents(episodeId)).toEqual(data.length);
    });
    it('resolveEpisodeEvents should assign all events to scenes (4)', () => {
      var data = mockEpisodeEvents4;
      var episodeId = setupSceneContentsTest(data);
      expect(tallySceneContents(episodeId)).toEqual(data.length);
    });
    it('resolveEpisodeEvents should assign all events to scenes (5)', () => {
      var data = mockEpisodeEvents5;
      var episodeId = setupSceneContentsTest(data);
      expect(tallySceneContents(episodeId)).toEqual(data.length);
    });
    it('resolveEpisodeEvents should assign all events to scenes (6)', () => {
      var data = mockEpisodeEvents5;
      var episodeId = setupSceneContentsTest(data);
      expect(tallySceneContents(episodeId)).toEqual(data.length);
    });

    xit('resolveEpisodeEvents should tally up when there are synthetic scenes (1)', () => {
      var data = mockEpisodeEvents1;
      var episodeId = setupSceneContentsTest(data);

      modelSvc.addLandingScreen(episodeId);
      var episode = modelSvc.episodes[episodeId];
      episode.masterAsset = {
        duration: episode.scenes[episode.scenes.length - 1].end_time
      };
      modelSvc.addEndingScreen(episodeId);
      modelSvc.resolveEpisodeEvents(episodeId);
      expect(tallySceneContents(episodeId)).toEqual(data.length + 2);
    });
    it('resolveEpisodeEvents should tally up when there are synthetic scenes (2)', () => {
      var data = mockEpisodeEvents2;
      var episodeId = setupSceneContentsTest(data);

      modelSvc.addLandingScreen(episodeId);
      var episode = modelSvc.episodes[episodeId];
      episode.masterAsset = {
        duration: episode.scenes[episode.scenes.length - 1].end_time
      };
      modelSvc.addEndingScreen(episodeId);
      modelSvc.resolveEpisodeEvents(episodeId);
      expect(tallySceneContents(episodeId)).toEqual(data.length + 2);
    });

    it('resolveEpisodeEvents should tally up when there are synthetic scenes (3)', () => {
      var data = mockEpisodeEvents3;
      var episodeId = setupSceneContentsTest(data);

      modelSvc.addLandingScreen(episodeId);
      var episode = modelSvc.episodes[episodeId];
      episode.masterAsset = {
        duration: episode.scenes[episode.scenes.length - 1].end_time
      };
      modelSvc.addEndingScreen(episodeId);
      modelSvc.resolveEpisodeEvents(episodeId);
      expect(tallySceneContents(episodeId)).toEqual(data.length + 2);
    });

    it('resolveEpisodeEvents should tally up when there are synthetic scenes (4)', () => {
      var data = mockEpisodeEvents4;
      var episodeId = setupSceneContentsTest(data);

      modelSvc.addLandingScreen(episodeId);
      var episode = modelSvc.episodes[episodeId];
      episode.masterAsset = {
        duration: episode.scenes[episode.scenes.length - 1].end_time
      };
      modelSvc.addEndingScreen(episodeId);
      modelSvc.resolveEpisodeEvents(episodeId);
      expect(tallySceneContents(episodeId)).toEqual(data.length + 2);
    });

    it('resolveEpisodeEvents should tally up when there are synthetic scenes (5)', () => {
      var data = mockEpisodeEvents5;
      var episodeId = setupSceneContentsTest(data);

      modelSvc.addLandingScreen(episodeId);
      var episode = modelSvc.episodes[episodeId];
      episode.masterAsset = {
        duration: episode.scenes[episode.scenes.length - 1].end_time
      };
      modelSvc.addEndingScreen(episodeId);
      modelSvc.resolveEpisodeEvents(episodeId);
      expect(tallySceneContents(episodeId)).toEqual(data.length + 2);
    });

  });
  /* END real event data tests */
});
