'use strict';

// for quick debugging of templates in dev.  master should just contain an empty stub here

// TODO: figure out how to get grunt to omit this from the build

angular.module('com.inthetelling.story')
	.factory('mockSvc', function (modelSvc) {
		var svc = {};

		svc.mockEpisode = function (epId) {
			// FOR DEV TESTING
			modelSvc.cache("episode", {
				"_id": epId,
				"created_at": "2014-04-10T02:02:15Z",
				"description": "The Business Case for Sustainability",
				"master_asset_id": "masterasset",
				"title": "Test Episode",
				"status": "Published",
				"templateUrl": "templates/episode/episode.html",
				"styles": [
					"typographySwiss", "", ""
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
				"description": "Scene <b>description</b> Description",
				"keywords": [],
				"start_time": 0,
				"end_time": 200,
				"type": "Scene",
				"episode_id": epId,
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
				scene.title = (i / 2 === Math.floor(i / 2)) ? "Scene " + (i + 1) + " Title" : "";
				scene.title = "Scene " + (i + 1) + " Title <b>html<sup>included</sup></b>";
				scene.start_time = (i * 20);
				scene.end_time = (i * 20 + 20);
				scene.templateUrl = scenetemplateurls[i % scenetemplateurls.length];
				modelSvc.cache("event", scene);
			}

			var annotationStub = {
				"_id": "",
				"_type": "Annotation",
				"annotation": "Transcript text: <b>html</b> included!",
				"annotation_image_id": "asset3",
				"annotator": "Speaker Name",
				"cosmetic": false,
				"episode_id": epId,
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
				transcript.annotation = "Transcript block number " + (i + 1);
				transcript.start_time = (i * 5);
				transcript.end_time = (i * 5 + 5);
				transcript.layouts = [testLayouts[i % testLayouts.length]];
				modelSvc.cache("event", transcript);
			}
			for (i = 0; i < 10; i++) {
				var annotation = angular.copy(annotationStub);
				annotation._id = "annotation-" + i;
				annotation.start_time = i * 6;
				annotation.end_time = i * 6 + 3;
				annotation.templateUrl = annotationTemplates[i % annotationTemplates.length];
				modelSvc.cache("event", annotation);
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
			/*
			var linkStub = {
				"_id": "",
				"_type": "Link",
				"link_image_id": "asset1",
				"url": "https://luminarydigitalmedia.com",
				"title": "Link Title",
				"description": "Link Description <i>lorem</i> ipsum dolor frog a frog oh lord it's amet lorem ipsum buddy lorem ipsum dolor frog a frog oh lord it's amet lorem ipsum buddy lorem ipsum dolor frog a frog oh lord it's amet lorem ipsum buddy",
				"cosmetic": false,
				"stop": false,
				"type": "Link",
				"episode_id": epId,
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
				// 	link.title = "NO EMBED link";
				// 	link.templateUrl = "templates/transmedia-link-noembed.html";
				// } else if (Math.random() < 0.1) {
				// 	link.title = "FRAMEICIDE link";
				// 	link.templateUrl = "templates/transmedia-link-frameicide.html";
				// }
				modelSvc.cache("event", link);
			}
			*/
			var uploadStub = {
				"_type": "Upload",

				"description": "Description of an upload item",
				"required": false,
				"cosmetic": false,
				"stop": false,
				"type": "Upload",
				"episode_id": epId,
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
				upload.title = "Upload number " + (i % 3 + 1);
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
	});
