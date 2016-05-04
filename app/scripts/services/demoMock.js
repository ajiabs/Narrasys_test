/**
 * Created by githop on 4/28/16.
 */


(function () {
	'use strict';

	angular.module('com.inthetelling.story')
		.factory('demoMock', demoMock);

	function demoMock($q, modelSvc, dataSvc, ittUtils, appState, timelineSvc) {

		var _stubPQ = {
			"_id": "stubPQ",
			"_type": "Annotation",
			"type": "Annotation",
			"start_time": 0.11,
			"end_time": 36.9,
			"episode_id": "572142e65c92ebacb8000175",
			"templateUrl": "templates/item/pullquote-noattrib.html",
			"cosmetic": false,
			"title": {},
			"noEmbed": false,
			"annotator": {},
			"annotation": {"en": "this is a pQ"},
			"annotation_image_id": null,
			"avatar_id": "56f9b8b741f6df37610079cd",
			"style_id": [],
			"layout_id": ["52e15b43c9b715cfbb000025"],
			"user_id": "565f578227f858b7e20000e4",
			"cur_episode_id": "572142e65c92ebacb8000175",
			"layouts": ["inline"],
			"display_annotation": "this is a pQ",
			"searchableText": "this is a pQ undefined",
			"avatar": {
				"_id": "56f9b8b741f6df37610079cd",
				"_type": "Asset::Image",
				"container_id": null,
				"user_id": "565f578227f858b7e20000e4",
				"filename": "b88eddb9-e5ff-4f28-c39b-681989bb155d",
				"original_filename": "resizedtux.png",
				"extension": "png",
				"content_type": "image/png",
				"size": null,
				"name": {"en": "resizedtux"},
				"description": {},
				"url": "https://s3.amazonaws.com/itt.user.uploads/production/-Ytigg3rHoJOxeQExlZcZw/b88eddb9-e5ff-4f28-c39b-681989bb155d",
				"episodes_count": 0,
				"episode_poster_frames_count": 0,
				"links_count": 0,
				"annotations_count": 0,
				"narratives_count": 0,
				"timelines_count": 0,
				"uploads_count": 0,
				"plugins_count": 0,
				"display_name": "resizedtux"
			},
			"isContent": true,
			"isTranscript": false,
			"mixedContent": false,
			"noExternalLink": false,
			"targetTop": false,
			"layoutCss": "inline",
			"origTemplateUrl": "templates/text-pullquote-noattrib.html",
			"producerItemType": "annotation",
			"displayStartTime": "0:00",
			"scene_id": "",
			"styleCss": " inline",
			"$$hashKey": "object:48",
			"editableByThisUser": true,
			"state": "isCurrent",
			"isCurrent": true,
			"wtfchromesort": "00000.01",
			"showAsHeader": true
		};

		var _stubImg = {
			"_id": "stubImg",
			"_type": "Upload",
			"type": "Upload",
			"start_time": 0.01,
			"end_time": 36.9,
			"episode_id": "572920395c92eb5bb00000de",
			"templateUrl": "templates/item/image-thumbnail.html",
			"cosmetic": false,
			"title": {},
			"noEmbed": false,
			"description": {},
			"asset_id": "572924bf5c92eb58cf00011b",
			"avatar_id": "56f9b8b741f6df37610079cd",
			"style_id": [],
			"layout_id": ["52e15b43c9b715cfbb000025"],
			"user_id": "565f578227f858b7e20000e4",
			"cur_episode_id": "572920395c92eb5bb00000de",
			"layouts": ["inline"],
			"searchableText": "undefined undefined",
			"avatar": {
				"_id": "56f9b8b741f6df37610079cd",
				"_type": "Asset::Image",
				"container_id": null,
				"user_id": "565f578227f858b7e20000e4",
				"filename": "b88eddb9-e5ff-4f28-c39b-681989bb155d",
				"original_filename": "resizedtux.png",
				"extension": "png",
				"content_type": "image/png",
				"size": null,
				"name": {"en": "resizedtux"},
				"description": {},
				"url": "https://s3.amazonaws.com/itt.user.uploads/production/-Ytigg3rHoJOxeQExlZcZw/b88eddb9-e5ff-4f28-c39b-681989bb155d",
				"episodes_count": 0,
				"episode_poster_frames_count": 0,
				"links_count": 0,
				"annotations_count": 0,
				"narratives_count": 0,
				"timelines_count": 0,
				"uploads_count": 0,
				"plugins_count": 0,
				"display_name": "resizedtux"
			},
			"isContent": true,
			"isTranscript": false,
			"mixedContent": false,
			"noExternalLink": false,
			"targetTop": false,
			"layoutCss": "inline",
			"origTemplateUrl": "templates/transmedia-thumbnail.html",
			"producerItemType": "image",
			"displayStartTime": "0:00",
			"scene_id": "572920395c92ebb2590000df",
			"styleCss": " inline",
			"$$hashKey": "object:48",
			"editableByThisUser": true,
			"asset": {
				"_id": "572924bf5c92eb58cf00011b",
				"_type": "Asset::Image",
				"container_id": "572920395c92eb5bb00000dd",
				"user_id": "565f578227f858b7e20000e4",
				"filename": "e303f466-6f41-4e21-c210-a5f6e4c58cb5",
				"original_filename": "Slide04 Solution.v12.jpg",
				"extension": "jpg",
				"content_type": "image/jpeg",
				"size": null,
				"name": {"en": "Slide04 Solution.v12"},
				"description": {},
				"url": "https://s3.amazonaws.com/itt.user.uploads/development/-Ytigg3rHoJOxeQExlZcZw/e303f466-6f41-4e21-c210-a5f6e4c58cb5",
				"episodes_count": 0,
				"episode_poster_frames_count": 0,
				"links_count": 0,
				"annotations_count": 0,
				"narratives_count": 0,
				"timelines_count": 0,
				"uploads_count": 1,
				"plugins_count": 0,
				"display_name": "Slide04 Solution.v12"
			},
			"state": "isCurrent",
			"isCurrent": true,
			"wtfchromesort": "00000.01",
			"showInlineDetail": false
		};

		var _stubPdf = {
			"_id": "stubPdf",
			"_type": "Link",
			"type": "Link",
			"start_time": 116.19,
			"end_time": 135.8,
			"episode_id": "57012b7141f6df6579000d6f",
			"templateUrl": "templates/item/link-embed.html",
			"cosmetic": false,
			"title": {},
			"url": "/images/demoPdf.pdf",
			"noEmbed": false,
			"description": {},
			"link_image_id": null,
			"avatar_id": "56f9b8b741f6df37610079cd",
			"style_id": [],
			"layout_id": ["52e15b43c9b715cfbb000025"],
			"user_id": "565f578227f858b7e20000e4",
			"cur_episode_id": "57012b7141f6df6579000d6f",
			"layouts": ["inline"],
			"searchableText": "undefined undefined",
			"avatar": {
				"_id": "56f9b8b741f6df37610079cd",
				"_type": "Asset::Image",
				"container_id": null,
				"user_id": "565f578227f858b7e20000e4",
				"filename": "b88eddb9-e5ff-4f28-c39b-681989bb155d",
				"original_filename": "resizedtux.png",
				"extension": "png",
				"content_type": "image/png",
				"size": null,
				"name": {"en": "resizedtux"},
				"description": {},
				"url": "https://s3.amazonaws.com/itt.user.uploads/production/-Ytigg3rHoJOxeQExlZcZw/b88eddb9-e5ff-4f28-c39b-681989bb155d",
				"episodes_count": 0,
				"episode_poster_frames_count": 0,
				"links_count": 0,
				"annotations_count": 0,
				"narratives_count": 0,
				"timelines_count": 0,
				"uploads_count": 0,
				"plugins_count": 0,
				"display_name": "resizedtux"
			},
			"isContent": true,
			"isTranscript": false,
			"mixedContent": false,
			"noExternalLink": true,
			"targetTop": false,
			"layoutCss": "inline",
			"origTemplateUrl": "templates/transmedia-link-embed.html",
			"producerItemType": "link",
			"displayStartTime": "1:56",
			"scene_id": "5701895241f6dfdf61000fc0",
			"styleCss": "transitionPop timestampNone inline",
			"state": "isCurrent",
			"isCurrent": true,
			"wtfchromesort": "00116.19",
			"$$hashKey": "object:1714",
			"editableByThisUser": true
		};

		var _showUser = {
			"_id": "565df0e40a452b593d000006",
			"name": "Tom Hopkins",
			"access_token": "GsMr6nqqSRdYa4tf1EG8",
			"avatar_id": "56faea760a452ba5d9000005",
			"roles": [{"role": "admin"}, {
				"role": "student",
				"resource_type": "Narrative",
				"resource_id": "564f56310a452b2feb000004"
			}, {"role": "student", "resource_type": "Narrative", "resource_id": "565df1cc0a452b593d000013"}],
			"emails": ["tom@inthetelling.com"],
			"track_event_actions": true,
			"track_episode_metrics": true
		};

		return {
			stubImg: _stubImg,
			stubPdf: _stubPdf,
			showUser: _showUser,
			addStubPq: addStubPq,
			landingScreenSceneItems: _landingScreenSceneItems,
			videoAsset: videoAsset,
			imageAsset: imageAsset
		};

		function _landingScreenSceneItems() {

			var _landingScreenId = Object.keys(modelSvc.events).filter(function (scenes) {
				return scenes.indexOf('landingscreen') > -1;
			});

			return modelSvc.scene(_landingScreenId).items;
		}

		function addStubPq() {
			//_landingScreenSceneItems().push(_stubPQ);
			//modelSvc.cache('event', _stubPQ);
			//modelSvc.resolveEpisodeEvents('572142e65c92ebacb8000175');
			//console.log(_landingScreenSceneItems());
			//timelineSvc.updateEventTimes(modelSvc.events[data._id]);
			return _stubPQ;
		}

		function _readFile(files) {
			var _reader = new FileReader();
			//var _img = new Image();
			return $q(function (resolve, reject) {
				_reader.onloadend = function () {
					console.log('onloadend fileReader!!');
					resolve(_reader.result);
				};
				_reader.onerror = function () {
					console.log('FIleReader Err', _reader.error);
					reject(_reader.error);
				};
				_reader.readAsDataURL(files[0]);
			});
		}

		function imageAsset(files) {
			return _readFile(files).then(function (url) {
				var stub = {
					"_id": "stubImg",
					"_type": "Asset::Image",
					"user_id": "52e6c766c9b715e92b000001",
					"name": {"en": files[0].name},
					"content_type": files[0].type,
					"size": files[0].size,
					"description": {},
					"url": url
				};
				modelSvc.cache("asset", stub);
				_stubImg.asset = stub;
				return _stubImg;
			});
		}

		function videoAsset(files) {
			return function (scope) {
				_readFile(files).then(function (url) {
					var stub = {
						'_id': ittUtils.generateUUID(),
						'type': 'Asset::Video',
						'_type': 'Asset::Video',
						'user_id': appState.user._id,
						'url': url,
						'alternate_urls': [url],
						'name': {en: files[0].name},
						'content_type': files[0].type,
						'size': files[0].size,
						'original_filename': files[0].name,
						'duration': 37,
						'description': {}
					};
					console.log('videoStub', stub);
					modelSvc.cache("asset", stub);
					scope.callback(stub._id);
				});
			};
		}
	}


})();
