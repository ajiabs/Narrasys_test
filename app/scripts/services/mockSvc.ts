// for quick debugging of templates.

// TODO: figure out how to get grunt to omit this from the build


mockSvc.$inject = ['modelSvc'];

export default function mockSvc(modelSvc) {
  var svc = {};
  svc.keepJsLintHappy = function () {
    var noop = modelSvc.episodes.noop;
    noop = undefined;
  };
  svc.mockEpisode = function (epId) {
    // FOR DEV TESTING

    modelSvc.cache("episode", {
      "_id": epId,
      "created_at": "2014-04-10T02:02:15Z",
      "description": {
        en: "The Business Case for Sustainability"
      },
      "master_asset_id": "masterasset",
      "title": {
        en: "Test Episode"
      },
      "languages": [{
        code: 'en',
        default: true
      }],

      "status": "Published",
      "templateUrl": "templates/episode/gwsb.html",
      "styles": [
        "", "", ""
      ]
    });
    modelSvc.cache("asset", {
      "_id": "masterasset",
      "_type": "Asset::Video",
      "alternate_urls": [
        "https://www.youtube.com/watch?v=dTAAsCNK7RA&list=RDHCffYp01sXKH8",
        "https://s3.amazonaws.com/itt.uploads/development/Test%20Customer/SLIC/The%20Business%20Case/Sustainability%20Pays%20sXs/9aPKP5AJNJdH-UEQ2EB9jg.m3u8",
        "https://s3.amazonaws.com/itt.uploads/development/Test%20Customer/SLIC/The%20Business%20Case/Sustainability%20Pays%20sXs/9aPKP5AJNJdH-UEQ2EB9jg_416x234.webm",
        "https://s3.amazonaws.com/itt.uploads/development/Test%20Customer/SLIC/The%20Business%20Case/Sustainability%20Pays%20sXs/9aPKP5AJNJdH-UEQ2EB9jg_960x540.webm",
        "https://s3.amazonaws.com/itt.uploads/development/Test%20Customer/SLIC/The%20Business%20Case/Sustainability%20Pays%20sXs/9aPKP5AJNJdH-UEQ2EB9jg_416x234.mp4",
        "https://s3.amazonaws.com/itt.uploads/development/Test%20Customer/SLIC/The%20Business%20Case/Sustainability%20Pays%20sXs/9aPKP5AJNJdH-UEQ2EB9jg_960x540.mp4"
      ],
      "attachment": "Sustainability_Pays_for_Demo_1.mp4",
      "base_path": "development/Test Customer/SLIC/The Business Case/Sustainability Pays sXs",
      "content_type": "video/mp4",
      "duration": "443.199313",
      "extension": "mp4",
      "file_size": 338886327,
      "filename": "Sustainability_Pays_for_Demo_1.mp4",
      "frame_rate": "10000000/417083",
      "frame_rate_d": 417083,
      "frame_rate_n": 10000000,
      "height": 720,
      "name": "Sustainability Pays for Demo 1",
      "original_filename": "Sustainability_Pays_for_Demo_1.mp4",
      "start_time": "0.000000",
      "status": "complete",
      "url": "https://s3.amazonaws.com/itt.uploads/development/Test%20Customer/SLIC/The%20Business%20Case/Sustainability%20Pays%20sXs/Sustainability_Pays_for_Demo_1.mp4",
      "width": 1280
    });

    var sceneStub = {
      "_id": "-",
      "_type": "Scene",
      "description": {
        en: "Scene <b>description</b> Description"
      },
      "keywords": [],
      "start_time": 0,
      "end_time": 200,
      "type": "Scene",
      "episode_id": epId,
      "cur_episode_id": epId,
      //"templateUrl": "templates/scene/centered.html",
      "layouts": ["", ""],
      "styles": ["transitionSlideL"]
    };

    var scenetemplateurls = [
      "templates/scene/cornerH.html",
      "templates/scene/cornerV.html",
      "templates/scene/2colL.html",
      "templates/scene/2colR.html",
      "templates/scene/centered.html",
      "templates/scene/1col.html"
    ];

    for (var i = 0; i < 10; i++) {
      var scene = angular.copy(sceneStub);
      scene._id = "scene-" + i;
      scene.title = (i / 2 === Math.floor(i / 2)) ? {
        en: "Scene " + (i + 1) + " Title"
      } : {
        en: ""
      };
      scene.start_time = (i * 20);
      scene.end_time = (i * 20 + 20);
      scene.templateUrl = scenetemplateurls[i % scenetemplateurls.length];
      modelSvc.cache("event", scene);
    }

    var annotationStub = {
      "_id": "",
      "_type": "Annotation",
      "annotation": {
        en: "Transcript text: <b>html</b> included!"
      },
      "annotation_image_id": "asset3",
      "annotator": {
        en: "Speaker Name"
      },
      "cosmetic": false,
      "episode_id": epId,
      "cur_episode_id": epId,
      "required": false,
      "stop": false,
      "type": "Annotation",
      "templateUrl": "templates/item/transcript-withthumbnail.html",
      "styles": ["colorInvert"]
    };

    var testLayouts = [
      "sidebarL",
      "sidebarR", "inline"
    ];

    var annotationTemplates = [
      "templates/item/text-h1.html",
      "templates/item/pullquote.html",
      "templates/item/text-h2.html"
    ];

    for (i = 0; i < 30; i++) {
      var transcript = angular.copy(annotationStub);
      transcript._id = "transcript-" + i;
      transcript.annotation = {
        en: "Transcript block number " + (i + 1)
      };
      transcript.start_time = (i * 5);
      transcript.end_time = (i * 5 + 5);
      transcript.layouts = [testLayouts[i % testLayouts.length]];
      //				modelSvc.cache("event", transcript);
    }
    for (i = 0; i < 10; i++) {
      var annotation = angular.copy(annotationStub);
      annotation._id = "annotation-" + i;
      annotation.start_time = i * 6;
      annotation.end_time = i * 6 + 3;
      annotation.templateUrl = annotationTemplates[i % annotationTemplates.length];
      modelSvc.cache("event", annotation);
    }

    for (i = 0; i < 10; i++) {
      var longtext = angular.copy(annotationStub);
      longtext._id = "longtext-" + i;
      longtext.start_time = i * 7;
      longtext.end_time = i * 7 + 7;
      longtext.styles = ["timestampNone"];
      longtext.annotation = {
        en: "A way a long a last a loved along the riverrun, past Eve and Adam's, from swerve of shore to bend of bay, brings us by a commodius vicus of recirculation back to Howth Castle and Environs. Sir Tristram, <i>violer d'amores</i>, fr'over the short sea, had passencore rearrived from North Armorica on this side the scraggy isthmus of Europe Minor to wielderfight his penisolate war"
      };
      longtext.templateUrl = "templates/item/text-transmedia.html";

      modelSvc.cache("event", longtext);
    }

    modelSvc.cache("asset", {
      "_id": "asset1",
      "_type": "Asset::Image",
      "url": "https://s3.amazonaws.com/itt.uploads/development/Test%20Customer/SLIC/The%20Business%20Case/Sustainability%20Pays/Sustainability_Scorecard_1.jpg",
      "extension": "jpg",
      "name": "Sustainability Scorecard 1",
    });
    modelSvc.cache("asset", {
      "_id": "asset2",
      "_type": "Asset::Image",
      "url": "http://placehold.it/350x350",
      "extension": "jpg",
      "name": "350x350 placeholder",
    });
    modelSvc.cache("asset", {
      "_id": "asset3",
      "_type": "Asset::Image",
      "url": "http://placehold.it/64x64",
      "extension": "jpg",
      "name": "64x64 placeholder",
    });
    modelSvc.cache("asset", {
      "_id": "asset4",
      "_type": "Asset::Image",
      "url": "http://placehold.it/900x900",
      "extension": "jpg",
      "name": "900x900 placeholder",
    });

    var linkStub = {
      "_id": "",
      "_type": "Link",
      "link_image_id": "asset1",
      "url": "https://luminarydigitalmedia.com",
      "title": {
        en: "Link Title"
      },
      "description": {
        en: "Link Description <i>lorem</i> ipsum dolor frog a frog oh lord it's amet lorem ipsum buddy lorem ipsum dolor frog a frog oh lord it's amet lorem ipsum buddy lorem ipsum dolor frog a frog oh lord it's amet lorem ipsum buddy"
      },
      "cosmetic": false,
      "stop": false,
      "type": "Link",
      "episode_id": epId,
      "cur_episode_id": epId,
      "templateUrl": "templates/item/link-withimage.html",
      "layouts": ["inline"],
      "styles": ["timestampNone"],
      "isContent": true,
    };

    for (i = 0; i < 30; i++) {
      var link = angular.copy(linkStub);
      link._id = "link-" + i;
      link.required = (Math.random() > 0.5);
      link.start_time = i * 3;
      link.end_time = i * 3 + 3;

      link.layouts = [testLayouts[i % testLayouts.length]];

      // if (Math.random() > 0.1) {
      // 	link.title = {en: "NO EMBED link"};
      // 	link.templateUrl = "templates/transmedia-link-noembed.html";
      // } else if (Math.random() < 0.1) {
      // 	link.title = {en: "FRAMEICIDE link"};
      // 	link.templateUrl = "templates/transmedia-link-frameicide.html";
      // }
      modelSvc.cache("event", link);
    }

    var questionFormativeStub = {
      "_id": "",
      "_type": "Plugin",

      "producerItemType": "question",
      "episode_id": epId,
      "cur_episode_id": epId,
      "templateUrl": "templates/item/question-mc.html",
      "style_id": [],
      "layout_id": [],
      "title": {},
      "data": {
        "_id": "",
        "_pluginType": "question",
        "_version": 2,
        "_plugin": {
          "questiontext": "Some question text?",
          "questiontype": "mc-formative",
          "distractors": [{
            "text": "a",
            "index": 1,
          }, {
            "text": "b",
            "index": 2
          }, {
            "text": "c",
            "correct": true,
            "index": 3,
          }, {
            "text": "",
            "index": 4
          }],
          "correctfeedback": "Great!",
          "incorrectfeedback": "Doh!",
          "_type": "question"
        }
      }
    };

    for (i = 0; i < 10; i++) {
      var question = angular.copy(questionFormativeStub);
      question._id = "question-" + i;
      question.required = (Math.random() > 0.5);
      question.start_time = i * 5;
      question.end_time = i * 5 + 5;

      question.layouts = [testLayouts[i % testLayouts.length]];
      modelSvc.cache("event", question);
    }

    var questionPollStub = {
      "_id": "",
      "_type": "Plugin",
      "type": "Plugin",
      "producerItemType": "question",
      "episode_id": epId,
      "cur_episode_id": epId,
      "templateUrl": "templates/item/question-mc.html",
      "style_id": [],
      "layout_id": [],
      "data": {
        "_id": "",
        "_pluginType": "question",
        "_version": 2,
        "_plugin": {
          "questiontext": "Some question text?",
          "questiontype": "mc-poll",
          "distractors": [{
            "text": "a",
            "index": 1,
          }, {
            "text": "b",
            "index": 2
          }, {
            "text": "c",
            "index": 3,
          }, {
            "text": "",
            "index": 4
          }],
          "_type": "question"
        }
      }
    };

    for (i = 0; i < 10; i++) {
      var questionTemp = angular.copy(questionPollStub);
      questionTemp._id = "question-" + i;
      questionTemp.required = (Math.random() > 0.5);
      questionTemp.start_time = i * 6;
      questionTemp.end_time = i * 6 + 6;

      questionTemp.layouts = [testLayouts[i % testLayouts.length]];
      modelSvc.cache("event", questionTemp);
    }

    var uploadStub = {
      "_type": "Upload",

      "description": {
        en: "Description of an upload item"
      },
      "required": false,
      "cosmetic": true,
      "stop": false,
      "type": "Upload",
      "episode_id": epId,
      "cur_episode_id": epId,
      "templateUrl": "templates/item/image-caption.html",
      "styles": [
        "transitionFade", "tl"
      ],
      "layouts": [
        "inline"
      ]
    };
    for (i = 0; i < 30; i++) {
      var upload = angular.copy(uploadStub);
      upload._id = "upload-" + i;
      upload.asset_id = "asset2"; // + (i % 3 + 2);
      upload.title = {
        en: "Upload number " + (i % 3 + 1)
      };
      upload.start_time = i * 4;
      upload.end_time = i * 4 + 4;
      upload.layouts = [testLayouts[i % testLayouts.length]];

      modelSvc.cache("event", upload);
    }

    var layouts = ["mainFg", "altFg", "videoOverlay"];
    for (i = 0; i < 8; i++) {
      var filltest = angular.copy(uploadStub);
      filltest.layouts = [layouts[i % layouts.length]];
      filltest._id = "filltest-" + i;
      filltest.asset_id = "asset2";
      filltest.start_time = i * 2;
      filltest.end_time = i * 2 + 2;
      filltest.templateUrl = "templates/item/image-fill.html";
      filltest.styles.push("cover");
      modelSvc.cache("event", filltest);

    }

    modelSvc.resolveEpisodeEvents(epId);
    modelSvc.resolveEpisodeAssets(epId);

  };
  return svc;
}
