/**
 * Created by githop on 5/5/16.
 */


(function() {
	'use strict';

	angular.module('com.inthetelling.story')
		.factory('stubData', stubData);

	function stubData() {

		//var _stubPQ = {
		//	"_id": "stubPQ",
		//	"_type": "Annotation",
		//	"type": "Annotation",
		//	"start_time": 0.11,
		//	"end_time": 36.9,
		//	"episode_id": "572142e65c92ebacb8000175",
		//	"templateUrl": "templates/item/pullquote-noattrib.html",
		//	"cosmetic": false,
		//	"title": {},
		//	"noEmbed": false,
		//	"annotator": {},
		//	"annotation": {"en": "this is a pQ"},
		//	"annotation_image_id": null,
		//	"avatar_id": "56f9b8b741f6df37610079cd",
		//	"style_id": [],
		//	"layout_id": ["52e15b43c9b715cfbb000025"],
		//	"user_id": "565f578227f858b7e20000e4",
		//	"cur_episode_id": "572142e65c92ebacb8000175",
		//	"layouts": ["inline"],
		//	"display_annotation": "this is a pQ",
		//	"searchableText": "this is a pQ undefined",
		//	"avatar": {
		//		"_id": "56f9b8b741f6df37610079cd",
		//		"_type": "Asset::Image",
		//		"container_id": null,
		//		"user_id": "565f578227f858b7e20000e4",
		//		"filename": "b88eddb9-e5ff-4f28-c39b-681989bb155d",
		//		"original_filename": "resizedtux.png",
		//		"extension": "png",
		//		"content_type": "image/png",
		//		"size": null,
		//		"name": {"en": "resizedtux"},
		//		"description": {},
		//		"url": "https://s3.amazonaws.com/itt.user.uploads/production/-Ytigg3rHoJOxeQExlZcZw/b88eddb9-e5ff-4f28-c39b-681989bb155d",
		//		"episodes_count": 0,
		//		"episode_poster_frames_count": 0,
		//		"links_count": 0,
		//		"annotations_count": 0,
		//		"narratives_count": 0,
		//		"timelines_count": 0,
		//		"uploads_count": 0,
		//		"plugins_count": 0,
		//		"display_name": "resizedtux"
		//	},
		//	"isContent": true,
		//	"isTranscript": false,
		//	"mixedContent": false,
		//	"noExternalLink": false,
		//	"targetTop": false,
		//	"layoutCss": "inline",
		//	"origTemplateUrl": "templates/text-pullquote-noattrib.html",
		//	"producerItemType": "annotation",
		//	"displayStartTime": "0:00",
		//	"scene_id": "",
		//	"styleCss": " inline",
		//	"$$hashKey": "object:48",
		//	"editableByThisUser": true,
		//	"state": "isCurrent",
		//	"isCurrent": true,
		//	"wtfchromesort": "00000.01",
		//	"showAsHeader": true
		//};

		var _stubPQ = {
			"_id": "stubPq",
			"_type": "Annotation",
			"annotation": {"en": "this is a pQ"},
			"annotator": {},
			"annotation_image_id": "",
			"templateUrl": "templates/text-pullquote-noattrib.html",
			"start_time": 0.01,
			"end_time": 36.9,
			"isCurrent": true

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
			//"avatar_id": "56f9b8b741f6df37610079cd",
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

		var _nonce = {
			"nonce": "2ieFQqc1WNIkTkoSziwHKw"
		};

		var _accessToken = {
			"_id": "565f578227f858b7e20000e4",
			"name": "Tom Hopkins",
			"access_token": "RZMqXxUPpUFtp32k5BJT",
			"avatar_id": "56f9b8b741f6df37610079cd",
			"roles": [{"role": "admin"}, {
				"role": "guest",
				"resource_type": "Narrative",
				"resource_id": "565f569a27f858283100005c"
			}, {
				"role": "student",
				"resource_type": "Narrative",
				"resource_id": "565f569a27f858283100005c"
			}, {
				"role": "student",
				"resource_type": "Narrative",
				"resource_id": "56b4207441f6df6fc5000899"
			}, {
				"role": "guest",
				"resource_type": "Narrative",
				"resource_id": "56bbba1327f858f3f4002476"
			}, {
				"role": "student",
				"resource_type": "Narrative",
				"resource_id": "56bbba1327f858f3f4002476"
			}, {"role": "guest", "resource_type": "Narrative", "resource_id": "570e809b27f858e3660033a5"}],
			"emails": ["tom@inthetelling.com"],
			"track_event_actions": true,
			"track_episode_metrics": true
		};

		var _stubAssetId = {
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
			"plugins_count": 0
		};

		var _layouts = [{
			"_id": "52e15b40c9b715cfbb00000c",
			"display_name": "Video Left",
			"css_name": "videoLeft",
			"description": "The video is on the left",
			"updated_at": "2014-01-23T18:11:12Z",
			"created_at": "2014-01-23T18:11:12Z"
		}, {
			"_id": "52e15b40c9b715cfbb00000d",
			"display_name": "Video Right",
			"css_name": "videoRight",
			"description": "The video is on the right",
			"updated_at": "2014-01-23T18:11:12Z",
			"created_at": "2014-01-23T18:11:12Z"
		}, {
			"_id": "52e15b40c9b715cfbb00000e",
			"display_name": "Show list",
			"css_name": "showList",
			"description": "Show list",
			"updated_at": "2014-01-23T18:11:12Z",
			"created_at": "2014-01-23T18:11:12Z"
		}, {
			"_id": "52e15b40c9b715cfbb00000f",
			"display_name": "Show current",
			"css_name": "showCurrent",
			"description": "Show current",
			"updated_at": "2014-01-23T18:11:12Z",
			"created_at": "2014-01-23T18:11:12Z"
		}, {
			"_id": "52e15b41c9b715cfbb000010",
			"display_name": "Split transmedia",
			"css_name": "splitTransmedia",
			"description": "Split transmedia",
			"updated_at": "2014-01-23T18:11:13Z",
			"created_at": "2014-01-23T18:11:13Z"
		}, {
			"_id": "52e15b41c9b715cfbb000011",
			"display_name": "Split required",
			"css_name": "splitRequired",
			"description": "Split required",
			"updated_at": "2014-01-23T18:11:13Z",
			"created_at": "2014-01-23T18:11:13Z"
		}, {
			"_id": "52e15b43c9b715cfbb000025",
			"display_name": "Inline",
			"css_name": "inline",
			"description": "Puts the item inline in its content pane",
			"updated_at": "2014-01-23T18:11:15Z",
			"created_at": "2014-01-23T18:11:15Z"
		}, {
			"_id": "52e15b44c9b715cfbb000026",
			"display_name": "Sidebar left",
			"css_name": "sidebarL",
			"description": "Floats the item in the left margins of its content pane",
			"updated_at": "2014-01-23T18:11:16Z",
			"created_at": "2014-01-23T18:11:16Z"
		}, {
			"_id": "52e15b44c9b715cfbb000027",
			"display_name": "Sidebar right",
			"css_name": "sidebarR",
			"description": "Floats the item in the right margins of its content pane",
			"updated_at": "2014-01-23T18:11:16Z",
			"created_at": "2014-01-23T18:11:16Z"
		}, {
			"_id": "52e15b44c9b715cfbb000028",
			"display_name": "Burst left",
			"css_name": "burstL",
			"description": "Puts the item inline in its content pane, bursting the left margin.  Hides the item timestamp and social doodads",
			"updated_at": "2014-01-23T18:11:16Z",
			"created_at": "2014-01-23T18:11:16Z"
		}, {
			"_id": "52e15b44c9b715cfbb000029",
			"display_name": "Burst right",
			"css_name": "burstR",
			"description": "Puts the item inline in its content pane, bursting the right margin.  Hides the item timestamp and social doodads",
			"updated_at": "2014-01-23T18:11:16Z",
			"created_at": "2014-01-23T18:11:16Z"
		}, {
			"_id": "52e15b44c9b715cfbb00002a",
			"display_name": "Burst",
			"css_name": "burst",
			"description": "Bursts both margins. Hides the item timestamp and social doodads",
			"updated_at": "2014-01-23T18:11:16Z",
			"created_at": "2014-01-23T18:11:16Z"
		}, {
			"_id": "52e15b44c9b715cfbb00002b",
			"display_name": "Window background",
			"css_name": "windowBg",
			"description": "Places the item in the background of the viewport (including the toolbar area)",
			"updated_at": "2014-01-23T18:11:16Z",
			"created_at": "2014-01-23T18:11:16Z"
		}, {
			"_id": "52e15b44c9b715cfbb00002c",
			"display_name": "Window foreground",
			"css_name": "windowFg",
			"description": "Places the item in the foreground of the viewport (including the toolbar area)",
			"updated_at": "2014-01-23T18:11:16Z",
			"created_at": "2014-01-23T18:11:16Z"
		}, {
			"_id": "52e15b44c9b715cfbb00002d",
			"display_name": "Main background",
			"css_name": "mainBg",
			"description": "Places the item in the background of the transcript content pane, or the only content pane if in a single-pane scene",
			"updated_at": "2014-01-23T18:11:16Z",
			"created_at": "2014-01-23T18:11:16Z"
		}, {
			"_id": "52e15b45c9b715cfbb00002e",
			"display_name": "Main foreground",
			"css_name": "mainFg",
			"description": "Places the item in the foreground of the transcript content pane, or the only content pane if in a single-pane scene",
			"updated_at": "2014-01-23T18:11:17Z",
			"created_at": "2014-01-23T18:11:17Z"
		}, {
			"_id": "52e15b45c9b715cfbb00002f",
			"display_name": "Alternatebackground",
			"css_name": "altBg",
			"description": "Places the item in the background of the other content pane (if one is present)",
			"updated_at": "2014-01-23T18:11:17Z",
			"created_at": "2014-01-23T18:11:17Z"
		}, {
			"_id": "52e15b45c9b715cfbb000030",
			"display_name": "Alternate foreground",
			"css_name": "altFg",
			"description": "Places the item in the foreground of the other content pane (if one is present)",
			"updated_at": "2014-01-23T18:11:17Z",
			"created_at": "2014-01-23T18:11:17Z"
		}, {
			"_id": "52e15b45c9b715cfbb000031",
			"display_name": "Video overlay",
			"css_name": "videoOverlay",
			"description": "Overlays the item on top of the video itself",
			"updated_at": "2014-01-23T18:11:17Z",
			"created_at": "2014-01-23T18:11:17Z"
		}];

		var _styles = [{
			"_id": "52e15b47c9b715cfbb00003f",
			"display_name": "Top left",
			"css_name": "tl",
			"description": "Positions the image at the top left corner of the parent pane or video",
			"updated_at": "2014-01-23T18:11:19Z",
			"created_at": "2014-01-23T18:11:19Z"
		}, {
			"_id": "52e15b47c9b715cfbb000040",
			"display_name": "Top right",
			"css_name": "tr",
			"description": "Positions the image at the top right corner of the parent pane or video",
			"updated_at": "2014-01-23T18:11:19Z",
			"created_at": "2014-01-23T18:11:19Z"
		}, {
			"_id": "52e15b47c9b715cfbb000041",
			"display_name": "Bottom left",
			"css_name": "bl",
			"description": "Positions the image at the bottom left corner of the parent pane or video",
			"updated_at": "2014-01-23T18:11:19Z",
			"created_at": "2014-01-23T18:11:19Z"
		}, {
			"_id": "52e15b47c9b715cfbb000042",
			"display_name": "Bottom right",
			"css_name": "br",
			"description": "Positions the image at the bottom right corner of the parent pane or video",
			"updated_at": "2014-01-23T18:11:19Z",
			"created_at": "2014-01-23T18:11:19Z"
		}, {
			"_id": "52e15b47c9b715cfbb000043",
			"display_name": "Fill",
			"css_name": "fill",
			"description": "Positions the image to fill the entirety of the parent pane or video",
			"updated_at": "2014-01-23T18:11:19Z",
			"created_at": "2014-01-23T18:11:19Z"
		}, {
			"_id": "52e15b47c9b715cfbb000044",
			"display_name": "Serif",
			"css_name": "typographySerif",
			"description": "Controls the fonts and relative text sizes",
			"updated_at": "2014-01-23T18:11:19Z",
			"created_at": "2014-01-23T18:11:19Z"
		}, {
			"_id": "52e15b47c9b715cfbb000045",
			"display_name": "Sans",
			"css_name": "typographySans",
			"description": "Controls the fonts and relative text sizes",
			"updated_at": "2014-01-23T18:11:19Z",
			"created_at": "2014-01-23T18:11:19Z"
		}, {
			"_id": "52e15b47c9b715cfbb000046",
			"display_name": "Book",
			"css_name": "typographyBook",
			"description": "Controls the fonts and relative text sizes",
			"updated_at": "2014-01-23T18:11:19Z",
			"created_at": "2014-01-23T18:11:19Z"
		}, {
			"_id": "52e15b48c9b715cfbb000047",
			"display_name": "Swiss",
			"css_name": "typographySwiss",
			"description": "Controls the fonts and relative text sizes",
			"updated_at": "2014-01-23T18:11:20Z",
			"created_at": "2014-01-23T18:11:20Z"
		}, {
			"_id": "52e15b48c9b715cfbb000048",
			"display_name": "e-Literate TV",
			"css_name": "typographyEliterate",
			"description": "Controls the fonts and relative text sizes",
			"updated_at": "2014-01-23T18:11:20Z",
			"created_at": "2014-01-23T18:11:20Z"
		}, {
			"_id": "52e15b48c9b715cfbb000049",
			"display_name": "Invert",
			"css_name": "colorInvert",
			"description": "Controls the text color -- use colorInvert for an item that will be on a dark background, for example, so it will have white type",
			"updated_at": "2014-01-23T18:11:20Z",
			"created_at": "2014-01-23T18:11:20Z"
		}, {
			"_id": "52e15b48c9b715cfbb00004a",
			"display_name": "Sepia",
			"css_name": "colorSepia",
			"description": "Controls the text color",
			"updated_at": "2014-01-23T18:11:20Z",
			"created_at": "2014-01-23T18:11:20Z"
		}, {
			"_id": "52e15b48c9b715cfbb00004b",
			"display_name": "Solarized",
			"css_name": "colorSolarized",
			"description": "Controls the text color",
			"updated_at": "2014-01-23T18:11:20Z",
			"created_at": "2014-01-23T18:11:20Z"
		}, {
			"_id": "52e15b48c9b715cfbb00004c",
			"display_name": "Vivid",
			"css_name": "colorVivid",
			"description": "Controls the text color",
			"updated_at": "2014-01-23T18:11:20Z",
			"created_at": "2014-01-23T18:11:20Z"
		}, {
			"_id": "52e15b48c9b715cfbb00004d",
			"display_name": "e-Literate TV",
			"css_name": "colorEliterate",
			"description": "Controls the text color",
			"updated_at": "2014-01-23T18:11:20Z",
			"created_at": "2014-01-23T18:11:20Z"
		}, {
			"_id": "52e15b49c9b715cfbb00004e",
			"display_name": "Solid",
			"css_name": "highlightSolid",
			"description": "Controls the appearance of items that are current in the timeline",
			"updated_at": "2014-01-23T18:11:21Z",
			"created_at": "2014-01-23T18:11:21Z"
		}, {
			"_id": "52e15b49c9b715cfbb00004f",
			"display_name": "Border",
			"css_name": "highlightBorder",
			"description": "Controls the appearance of items that are current in the timeline",
			"updated_at": "2014-01-23T18:11:21Z",
			"created_at": "2014-01-23T18:11:21Z"
		}, {
			"_id": "52e15b49c9b715cfbb000050",
			"display_name": "Side",
			"css_name": "highlightSide",
			"description": "Controls the appearance of items that are current in the timeline",
			"updated_at": "2014-01-23T18:11:21Z",
			"created_at": "2014-01-23T18:11:21Z"
		}, {
			"_id": "52e15b49c9b715cfbb000051",
			"display_name": "Highlighter",
			"css_name": "highlightHighlighter",
			"description": "Controls the appearance of items that are current in the timeline",
			"updated_at": "2014-01-23T18:11:21Z",
			"created_at": "2014-01-23T18:11:21Z"
		}, {
			"_id": "52e15b49c9b715cfbb000052",
			"display_name": "Tilt",
			"css_name": "highlightTilt",
			"description": "Controls the appearance of items that are current in the timeline",
			"updated_at": "2014-01-23T18:11:21Z",
			"created_at": "2014-01-23T18:11:21Z"
		}, {
			"_id": "52e15b49c9b715cfbb000053",
			"display_name": "Bloom",
			"css_name": "highlightBloom",
			"description": "Controls the appearance of items that are current in the timeline",
			"updated_at": "2014-01-23T18:11:21Z",
			"created_at": "2014-01-23T18:11:21Z"
		}, {
			"_id": "52e15b49c9b715cfbb000054",
			"display_name": "Default",
			"css_name": "timestampDefault",
			"description": "Controls the appearance of the item timestamp",
			"updated_at": "2014-01-23T18:11:21Z",
			"created_at": "2014-01-23T18:11:21Z"
		}, {
			"_id": "52e15b49c9b715cfbb000055",
			"display_name": "None",
			"css_name": "timestampNone",
			"description": "Controls the appearance of the item timestamp",
			"updated_at": "2014-01-23T18:11:21Z",
			"created_at": "2014-01-23T18:11:21Z"
		}, {
			"_id": "52e15b4ac9b715cfbb000056",
			"display_name": "Small",
			"css_name": "timestampSmall",
			"description": "Controls the appearance of the item timestamp",
			"updated_at": "2014-01-23T18:11:22Z",
			"created_at": "2014-01-23T18:11:22Z"
		}, {
			"_id": "52e15b4ac9b715cfbb000057",
			"display_name": "Inline",
			"css_name": "timestampInline",
			"description": "Controls the appearance of the item timestamp",
			"updated_at": "2014-01-23T18:11:22Z",
			"created_at": "2014-01-23T18:11:22Z"
		}, {
			"_id": "52e15b4ac9b715cfbb000058",
			"display_name": "Sidebar",
			"css_name": "timestampSidebar",
			"description": "Controls the appearance of the item timestamp",
			"updated_at": "2014-01-23T18:11:22Z",
			"created_at": "2014-01-23T18:11:22Z"
		}, {
			"_id": "52e15b4ac9b715cfbb000059",
			"display_name": "Fade",
			"css_name": "transitionFade",
			"description": "Selects the animation or effect to be used as the scene or item becomes (or stops being) current",
			"updated_at": "2014-01-23T18:11:22Z",
			"created_at": "2014-01-23T18:11:22Z"
		}, {
			"_id": "52e15b4ac9b715cfbb00005a",
			"display_name": "Slide left",
			"css_name": "transitionSlideL",
			"description": "Selects the animation or effect to be used as the scene or item becomes (or stops being) current",
			"updated_at": "2014-01-23T18:11:22Z",
			"created_at": "2014-01-23T18:11:22Z"
		}, {
			"_id": "52e15b4ac9b715cfbb00005b",
			"display_name": "Slide right",
			"css_name": "transitionSlideR",
			"description": "Selects the animation or effect to be used as the scene or item becomes (or stops being) current",
			"updated_at": "2014-01-23T18:11:22Z",
			"created_at": "2014-01-23T18:11:22Z"
		}, {
			"_id": "52e15b4ac9b715cfbb00005c",
			"display_name": "Pop",
			"css_name": "transitionPop",
			"description": "Selects the animation or effect to be used as the scene or item becomes (or stops being) current",
			"updated_at": "2014-01-23T18:11:22Z",
			"created_at": "2014-01-23T18:11:22Z"
		}, {
			"_id": "5327087eed245331bd000005",
			"display_name": "Center",
			"css_name": "center",
			"description": "Center the contents",
			"updated_at": "2014-03-17T14:36:46Z",
			"created_at": "2014-03-17T14:36:46Z"
		}, {
			"_id": "532708baed245331bd000006",
			"display_name": "Contain",
			"css_name": "contain",
			"description": "Fit the contents, maintaining aspect ratio, without any cropping.",
			"updated_at": "2014-03-17T14:37:46Z",
			"created_at": "2014-03-17T14:37:46Z"
		}, {
			"_id": "532708d8ed245331bd000007",
			"created_at": "2014-03-17T14:38:16Z",
			"css_name": "cover",
			"description": "Fit the contents, maintaining aspect ratio, cropping may occur since fill will make sure to fill both dimensions.",
			"display_name": "Cover",
			"updated_at": "2014-03-17T14:38:59Z"
		}, {
			"_id": "53fe1b4e41f6df9062000001",
			"display_name": "Force no transition",
			"css_name": "transitionNone",
			"description": "Selects the animation or effect to be used as the scene or item becomes (or stops being) current",
			"updated_at": "2014-08-27T17:54:22Z",
			"created_at": "2014-08-27T17:54:22Z"
		}];
		var _templates = [{
			"_id": "52e15b3ec9b715cfbb000004",
			"name": "Default episode template",
			"url": "templates/episode-default.html",
			"event_types": [],
			"applies_to_episodes": true,
			"updated_at": "2014-01-23T18:11:10Z",
			"created_at": "2014-01-23T18:11:10Z",
			"applies_to_narratives": false
		}, {
			"_id": "52e15b3fc9b715cfbb000005",
			"name": "e-Literate TV episode template",
			"url": "templates/episode-eliterate.html",
			"event_types": [],
			"applies_to_episodes": true,
			"updated_at": "2014-01-23T18:11:11Z",
			"created_at": "2014-01-23T18:11:11Z",
			"applies_to_narratives": false
		}, {
			"_id": "52e15b3fc9b715cfbb000006",
			"name": "Scene centered",
			"url": "templates/scene-centered.html",
			"event_types": ["Scene"],
			"applies_to_episodes": false,
			"updated_at": "2014-01-23T18:11:11Z",
			"created_at": "2014-01-23T18:11:11Z",
			"applies_to_narratives": false
		}, {
			"_id": "52e15b3fc9b715cfbb000007",
			"name": "Scene 1 column",
			"url": "templates/scene-1col.html",
			"event_types": ["Scene"],
			"applies_to_episodes": false,
			"updated_at": "2014-01-23T18:11:11Z",
			"created_at": "2014-01-23T18:11:11Z",
			"applies_to_narratives": false
		}, {
			"_id": "52e15b3fc9b715cfbb000008",
			"name": "Scene 2 columns left",
			"url": "templates/scene-2colL.html",
			"event_types": ["Scene"],
			"applies_to_episodes": false,
			"updated_at": "2014-01-23T18:11:11Z",
			"created_at": "2014-01-23T18:11:11Z",
			"applies_to_narratives": false
		}, {
			"_id": "52e15b3fc9b715cfbb000009",
			"name": "Scene 2 columns right",
			"url": "templates/scene-2colR.html",
			"event_types": ["Scene"],
			"applies_to_episodes": false,
			"updated_at": "2014-01-23T18:11:11Z",
			"created_at": "2014-01-23T18:11:11Z",
			"applies_to_narratives": false
		}, {
			"_id": "52e15b3fc9b715cfbb00000a",
			"name": "Scene corner horizontal",
			"url": "templates/scene-cornerH.html",
			"event_types": ["Scene"],
			"applies_to_episodes": false,
			"updated_at": "2014-01-23T18:11:11Z",
			"created_at": "2014-01-23T18:11:11Z",
			"applies_to_narratives": false
		}, {
			"_id": "52e15b40c9b715cfbb00000b",
			"name": "Scene corner vertical",
			"url": "templates/scene-cornerV.html",
			"event_types": ["Scene"],
			"applies_to_episodes": false,
			"updated_at": "2014-01-23T18:11:12Z",
			"created_at": "2014-01-23T18:11:12Z",
			"applies_to_narratives": false
		}, {
			"_id": "52e15b41c9b715cfbb000015",
			"name": "Default",
			"url": "templates/transcript-default.html",
			"event_types": ["Annotation"],
			"applies_to_episodes": false,
			"updated_at": "2014-01-23T18:11:13Z",
			"created_at": "2014-01-23T18:11:13Z",
			"applies_to_narratives": false
		}, {
			"_id": "52e15b41c9b715cfbb000016",
			"name": "With thumbnail",
			"url": "templates/transcript-withthumbnail.html",
			"event_types": ["Annotation"],
			"applies_to_episodes": false,
			"updated_at": "2014-01-23T18:11:13Z",
			"created_at": "2014-01-23T18:11:13Z",
			"applies_to_narratives": false
		}, {
			"_id": "52e15b42c9b715cfbb000017",
			"name": "With thumbnail alternate",
			"url": "templates/transcript-withthumbnail-alt.html",
			"event_types": ["Annotation"],
			"applies_to_episodes": false,
			"updated_at": "2014-01-23T18:11:14Z",
			"created_at": "2014-01-23T18:11:14Z",
			"applies_to_narratives": false
		}, {
			"_id": "52e15b42c9b715cfbb000018",
			"name": "Pull quote",
			"url": "templates/text-pullquote.html",
			"event_types": ["Annotation"],
			"applies_to_episodes": false,
			"updated_at": "2014-01-23T18:11:14Z",
			"created_at": "2014-01-23T18:11:14Z",
			"applies_to_narratives": false
		}, {
			"_id": "52e15b42c9b715cfbb000019",
			"applies_to_episodes": false,
			"created_at": "2014-01-23T18:11:14Z",
			"event_types": ["Annotation"],
			"name": "Pull quote w/o attrib",
			"updated_at": "2014-03-27T21:16:04Z",
			"url": "templates/text-pullquote-noattrib.html",
			"applies_to_narratives": false
		}, {
			"_id": "52e15b42c9b715cfbb00001a",
			"applies_to_episodes": false,
			"created_at": "2014-01-23T18:11:14Z",
			"event_types": ["Annotation"],
			"name": "Banner Lg",
			"updated_at": "2014-03-27T21:12:38Z",
			"url": "templates/text-h1.html",
			"applies_to_narratives": false
		}, {
			"_id": "52e15b42c9b715cfbb00001b",
			"applies_to_episodes": false,
			"created_at": "2014-01-23T18:11:14Z",
			"event_types": ["Annotation"],
			"name": "Banner Sm",
			"updated_at": "2014-03-27T21:12:51Z",
			"url": "templates/text-h2.html",
			"applies_to_narratives": false
		}, {
			"_id": "52e15b42c9b715cfbb00001c",
			"name": "Image default",
			"url": "templates/transmedia-image-default.html",
			"event_types": ["Upload"],
			"applies_to_episodes": false,
			"updated_at": "2014-01-23T18:11:14Z",
			"created_at": "2014-01-23T18:11:14Z",
			"applies_to_narratives": false
		}, {
			"_id": "52e15b42c9b715cfbb00001d",
			"name": "Image plain",
			"url": "templates/transmedia-image-plain.html",
			"event_types": ["Upload"],
			"applies_to_episodes": false,
			"updated_at": "2014-01-23T18:11:14Z",
			"created_at": "2014-01-23T18:11:14Z",
			"applies_to_narratives": false
		}, {
			"_id": "52e15b42c9b715cfbb00001e",
			"name": "Link only",
			"url": "templates/transmedia-linkonly.html",
			"event_types": ["Upload"],
			"applies_to_episodes": false,
			"updated_at": "2014-01-23T18:11:14Z",
			"created_at": "2014-01-23T18:11:14Z",
			"applies_to_narratives": false
		}, {
			"_id": "52e15b43c9b715cfbb00001f",
			"name": "Thumbnail",
			"url": "templates/transmedia-thumbnail.html",
			"event_types": ["Upload"],
			"applies_to_episodes": false,
			"updated_at": "2014-01-23T18:11:15Z",
			"created_at": "2014-01-23T18:11:15Z",
			"applies_to_narratives": false
		}, {
			"_id": "52e15b43c9b715cfbb000020",
			"name": "Caption",
			"url": "templates/transmedia-caption.html",
			"event_types": ["Upload"],
			"applies_to_episodes": false,
			"updated_at": "2014-01-23T18:11:15Z",
			"created_at": "2014-01-23T18:11:15Z",
			"applies_to_narratives": false
		}, {
			"_id": "52e15b43c9b715cfbb000021",
			"name": "Sliding caption",
			"url": "templates/transmedia-slidingcaption.html",
			"event_types": ["Upload"],
			"applies_to_episodes": false,
			"updated_at": "2014-01-23T18:11:15Z",
			"created_at": "2014-01-23T18:11:15Z",
			"applies_to_narratives": false
		}, {
			"_id": "52e15b43c9b715cfbb000022",
			"name": "Item link default",
			"url": "templates/transmedia-link-default.html",
			"event_types": ["Link"],
			"applies_to_episodes": false,
			"updated_at": "2014-01-23T18:11:15Z",
			"created_at": "2014-01-23T18:11:15Z",
			"applies_to_narratives": false
		}, {
			"_id": "52e15b43c9b715cfbb000023",
			"name": "Link new window",
			"url": "templates/transmedia-link-noembed.html",
			"event_types": ["Link"],
			"applies_to_episodes": false,
			"updated_at": "2014-01-23T18:11:15Z",
			"created_at": "2014-01-23T18:11:15Z",
			"applies_to_narratives": false
		}, {
			"_id": "52e15b43c9b715cfbb000024",
			"applies_to_episodes": false,
			"created_at": "2014-01-23T18:11:15Z",
			"event_types": ["Link"],
			"name": "Youtube embed",
			"updated_at": "2014-03-17T14:25:02Z",
			"url": "templates/transmedia-link-youtube.html",
			"applies_to_narratives": false
		}, {
			"_id": "52fd07b65539d395bd41025d",
			"name": "Open in parent",
			"url": "templates/transmedia-link-frameicide.html",
			"event_types": ["Link"],
			"applies_to_episodes": false,
			"updated_at": "2014-02-13T18:11:15Z",
			"created_at": "2014-02-13T18:11:15Z",
			"applies_to_narratives": false
		}, {
			"_id": "5303cb8c5539d395bd41025e",
			"name": "Telling Story episode template",
			"url": "templates/episode-tellingstory.html",
			"event_types": [],
			"applies_to_episodes": true,
			"updated_at": "2014-02-17T18:11:11Z",
			"created_at": "2014-02-17T18:11:11Z",
			"applies_to_narratives": false
		}, {
			"_id": "530bc61c5539d395bd41025f",
			"name": "EWB episode template",
			"url": "templates/episode-ewb.html",
			"event_types": [],
			"applies_to_episodes": true,
			"updated_at": "2014-02-24T18:11:11Z",
			"created_at": "2014-02-24T18:11:11Z",
			"applies_to_narratives": false
		}, {
			"_id": "531898ab5539d395bd410260",
			"name": "GWU SB episode template",
			"url": "templates/episode-gw.html",
			"event_types": [],
			"applies_to_episodes": true,
			"updated_at": "2014-08-11T17:53:44Z",
			"created_at": "2014-03-05T18:11:11Z",
			"applies_to_narratives": false
		}, {
			"_id": "53270525ed245331bd000001",
			"name": "Image Fill",
			"url": "templates/transmedia-image-fill.html",
			"event_types": ["Upload"],
			"applies_to_episodes": false,
			"updated_at": "2014-03-17T14:22:29Z",
			"created_at": "2014-03-17T14:22:29Z",
			"applies_to_narratives": false
		}, {
			"_id": "532705daed245331bd000003",
			"name": "Youtube embed - minimal",
			"url": "templates/transmedia-embed-youtube.html",
			"event_types": ["Link"],
			"applies_to_episodes": false,
			"updated_at": "2014-03-17T14:25:30Z",
			"created_at": "2014-03-17T14:25:30Z",
			"applies_to_narratives": false
		}, {
			"_id": "53270800ed245331bd000004",
			"name": "Link embed",
			"url": "templates/transmedia-link-embed.html",
			"event_types": ["Link"],
			"applies_to_episodes": false,
			"updated_at": "2014-03-17T14:34:40Z",
			"created_at": "2014-03-17T14:34:40Z",
			"applies_to_narratives": false
		}, {
			"_id": "539b565ebf31cd93cd000080",
			"name": "Purdue episode template",
			"url": "templates/episode-purdue.html",
			"event_types": [],
			"applies_to_episodes": true,
			"updated_at": "2014-06-13T19:51:58Z",
			"created_at": "2014-06-13T19:51:58Z",
			"applies_to_narratives": false
		}, {
			"_id": "53da523abf31cd4efe000025",
			"name": "USC Episode Template",
			"url": "templates/episode/usc.html",
			"event_types": [],
			"applies_to_episodes": true,
			"updated_at": "2014-07-31T14:27:06Z",
			"created_at": "2014-07-31T14:27:06Z",
			"applies_to_narratives": false
		}, {
			"_id": "53da5493bf31cdd12b000005",
			"name": "USC Badges",
			"url": "templates/item/usc-badges.html",
			"event_types": ["Plugin"],
			"applies_to_episodes": false,
			"updated_at": "2014-07-31T14:37:07Z",
			"created_at": "2014-07-31T14:37:07Z",
			"applies_to_narratives": false
		}, {
			"_id": "53da5516bf31cdb13700000c",
			"name": "Multiple Choice Question",
			"url": "templates/item/multiplechoice.html",
			"event_types": ["Plugin"],
			"applies_to_episodes": false,
			"updated_at": "2014-07-31T14:39:18Z",
			"created_at": "2014-07-31T14:39:18Z",
			"applies_to_narratives": false
		}, {
			"_id": "53e9035227f85827a5000005",
			"name": "GWU Law Episode Template",
			"url": "templates/episode/gwlaw.html",
			"event_types": [],
			"applies_to_episodes": true,
			"updated_at": "2014-08-11T17:54:26Z",
			"created_at": "2014-08-11T17:54:26Z",
			"applies_to_narratives": false
		}, {
			"_id": "53e903a727f858072a000008",
			"name": "Columbia Episode Template",
			"url": "templates/episode/columbia.html",
			"event_types": [],
			"applies_to_episodes": true,
			"updated_at": "2014-08-11T17:55:51Z",
			"created_at": "2014-08-11T17:55:51Z",
			"applies_to_narratives": false
		}, {
			"_id": "53eba8ab27f858fd9200002a",
			"name": "Description before link",
			"url": "templates/item/link-descriptionfirst.html",
			"event_types": ["Link"],
			"applies_to_episodes": false,
			"updated_at": "2014-08-13T18:04:27Z",
			"created_at": "2014-08-13T18:04:27Z",
			"applies_to_narratives": false
		}, {
			"_id": "5421c9ab41f6df9034000035",
			"name": "Image inline with text",
			"url": "templates/item/image-inline-withtext.html",
			"event_types": ["Upload"],
			"applies_to_episodes": false,
			"updated_at": "2014-09-23T19:27:39Z",
			"created_at": "2014-09-23T19:27:39Z",
			"applies_to_narratives": false
		}, {
			"_id": "5421cadb41f6dfbdb7000007",
			"name": "Link with image",
			"url": "templates/item/link-withimage.html",
			"event_types": ["Link"],
			"applies_to_episodes": false,
			"updated_at": "2014-09-23T19:32:43Z",
			"created_at": "2014-09-23T19:32:43Z",
			"applies_to_narratives": false
		}, {
			"_id": "542da00f27f858de8f00005e",
			"name": "SCS / School Climate Solutions",
			"url": "templates/episode/schoolclimatesolutions.html",
			"event_types": [],
			"applies_to_episodes": true,
			"updated_at": "2014-10-02T18:57:19Z",
			"created_at": "2014-10-02T18:57:19Z",
			"applies_to_narratives": false
		}, {
			"_id": "542da13441f6dfa6ff000025",
			"name": "Columbia Business School",
			"url": "templates/episode/columbiabusiness.html",
			"event_types": [],
			"applies_to_episodes": true,
			"updated_at": "2014-10-02T19:02:12Z",
			"created_at": "2014-10-02T19:02:12Z",
			"applies_to_narratives": false
		}, {
			"_id": "544909eb27f858809500001e",
			"name": "Picture-in-picture",
			"url": "templates/scene/pip.html",
			"event_types": ["Scene"],
			"applies_to_episodes": false,
			"updated_at": "2014-10-27T22:05:26Z",
			"created_at": "2014-10-23T14:00:11Z",
			"applies_to_narratives": false
		}, {
			"_id": "546e50d527f858eef200000d",
			"name": "Middlebury",
			"url": "templates/episode/middlebury.html",
			"event_types": [],
			"applies_to_episodes": true,
			"updated_at": "2014-11-20T20:36:37Z",
			"created_at": "2014-11-20T20:36:37Z",
			"applies_to_narratives": false
		}, {
			"_id": "5480d8c441f6df512100006d",
			"name": "Long text (as transmedia)",
			"url": "templates/text-transmedia.html",
			"event_types": ["Annotation"],
			"applies_to_episodes": false,
			"updated_at": "2014-12-04T21:57:24Z",
			"created_at": "2014-12-04T21:57:24Z",
			"applies_to_narratives": false
		}, {
			"_id": "54a3034c27f8582a85000005",
			"name": "Prolotherapy",
			"url": "templates/episode/prolotherapy.html",
			"event_types": [],
			"applies_to_episodes": true,
			"updated_at": "2014-12-30T19:55:56Z",
			"created_at": "2014-12-30T19:55:56Z",
			"applies_to_narratives": false
		}, {
			"_id": "54e4d5d427f858a97e000009",
			"name": "Multiple Choice Question (No Image)",
			"url": "templates/item/question-mc.html",
			"event_types": ["Plugin"],
			"applies_to_episodes": false,
			"updated_at": "2015-02-18T18:11:32Z",
			"created_at": "2015-02-18T18:11:32Z",
			"applies_to_narratives": false
		}, {
			"_id": "54e4d60827f858c0c0000025",
			"name": "Multiple Choice Question (Image Left)",
			"url": "templates/item/question-mc-image-left.html",
			"event_types": ["Plugin"],
			"applies_to_episodes": false,
			"updated_at": "2015-02-18T18:12:24Z",
			"created_at": "2015-02-18T18:12:24Z",
			"applies_to_narratives": false
		}, {
			"_id": "54e4d63e27f858c0c0000029",
			"name": "Multiple Choice Question (Image Right)",
			"url": "templates/item/question-mc-image-right.html",
			"event_types": ["Plugin"],
			"applies_to_episodes": false,
			"updated_at": "2015-02-18T18:13:18Z",
			"created_at": "2015-02-18T18:13:18Z",
			"applies_to_narratives": false
		}, {
			"_id": "54eb476d41f6df6766000004",
			"name": "Inline image",
			"event_types": ["Upload"],
			"url": "templates/item/image-inline.html",
			"applies_to_narratives": false,
			"updated_at": "2015-02-23T15:29:49Z",
			"created_at": "2015-02-23T15:29:49Z"
		}, {
			"_id": "54f8ca2727f858f7b4000298",
			"name": "GWSB",
			"event_types": [],
			"url": "templates/episode/gwsb.html",
			"applies_to_narratives": false,
			"updated_at": "2015-03-05T21:27:03Z",
			"created_at": "2015-03-05T21:27:03Z"
		}, {
			"_id": "5525708b41f6df6b4c000024",
			"name": "Kellogg",
			"url": "templates/episode/kellogg.html",
			"applies_to_narratives": false,
			"updated_at": "2015-04-08T18:16:43Z",
			"created_at": "2015-04-08T18:16:43Z"
		}, {
			"_id": "5547b61d27f858006f0044ac",
			"name": "sxs-annotation",
			"url": "templates/item/sxs-annotation.html",
			"applies_to_narratives": false,
			"updated_at": "2015-06-01T17:01:53Z",
			"created_at": "2015-05-04T18:10:37Z",
			"event_types": ["Annotation"]
		}, {
			"_id": "5547b61d27f858006f0044ad",
			"name": "sxs-link",
			"url": "templates/item/sxs-link.html",
			"applies_to_narratives": false,
			"updated_at": "2015-05-04T18:10:37Z",
			"created_at": "2015-05-04T18:10:37Z"
		}, {
			"_id": "5547b61d27f858006f0044ae",
			"name": "sxs-question",
			"url": "templates/item/sxs-question.html",
			"applies_to_narratives": false,
			"updated_at": "2015-05-04T18:10:37Z",
			"created_at": "2015-05-04T18:10:37Z"
		}, {
			"_id": "5547b61d27f858ef32006268",
			"name": "sxs-image",
			"url": "templates/item/sxs-image.html",
			"applies_to_narratives": false,
			"updated_at": "2015-05-04T18:10:37Z",
			"created_at": "2015-05-04T18:10:37Z"
		}, {
			"_id": "5547b61d41f6dfb4e40060ed",
			"name": "sxs-file",
			"url": "templates/item/sxs-file.html",
			"applies_to_narratives": false,
			"updated_at": "2015-05-04T18:10:37Z",
			"created_at": "2015-05-04T18:10:37Z"
		}, {
			"_id": "5547b61d41f6dfb4e40060ee",
			"name": "sxs-video",
			"url": "templates/item/sxs-video.html",
			"applies_to_narratives": false,
			"updated_at": "2015-05-04T18:10:37Z",
			"created_at": "2015-05-04T18:10:37Z"
		}, {
			"_id": "555e275227f8583f8e001620",
			"name": "Wiley LearningSpace (2)",
			"url": "templates/episode/wiley2.html",
			"applies_to_narratives": false,
			"updated_at": "2015-05-21T18:43:30Z",
			"created_at": "2015-05-21T18:43:30Z"
		}, {
			"_id": "555e275241f6dfe3d1001146",
			"name": "Wiley LearningSpace (1)",
			"url": "templates/episode/wiley1.html",
			"applies_to_narratives": false,
			"updated_at": "2016-04-20T19:16:33Z",
			"created_at": "2015-05-21T18:43:30Z",
			"theme_colors": {"orange": "#F15921", "blue": "#213371"}
		}, {
			"_id": "555e275241f6dfe3d1001147",
			"name": "Wiley LearningSpace (3)",
			"url": "templates/episode/wiley3.html",
			"applies_to_narratives": false,
			"updated_at": "2015-05-21T18:43:30Z",
			"created_at": "2015-05-21T18:43:30Z"
		}, {
			"_id": "55c8bf3041f6df2e9500adf3",
			"name": "Transmedia text",
			"event_types": ["Annotation"],
			"url": "templates/item/text-transmedia.html",
			"applies_to_narratives": false,
			"updated_at": "2015-08-10T15:11:44Z",
			"created_at": "2015-08-10T15:11:44Z"
		}, {
			"_id": "55f1a58141f6dfa0a3004734",
			"name": "Transmedia text",
			"event_types": ["Annotation"],
			"url": "templates/item/text-definition.html",
			"applies_to_narratives": false,
			"updated_at": "2015-09-10T15:45:05Z",
			"created_at": "2015-09-10T15:45:05Z"
		}, {
			"_id": "5642137a41f6df55cb000c71",
			"name": "Regis",
			"url": "templates/episode/regis.html",
			"applies_to_narratives": false,
			"updated_at": "2015-11-10T15:55:38Z",
			"created_at": "2015-11-10T15:55:38Z"
		}, {
			"_id": "5668436541f6df11da0025e0",
			"name": "Upload",
			"event_types": ["Upload"],
			"url": "templates/item/file.html",
			"applies_to_narratives": false,
			"updated_at": "2015-12-09T15:06:13Z",
			"created_at": "2015-12-09T15:06:13Z"
		}, {
			"_id": "56817bba27f8582c540009da",
			"name": "Washing SBCTC",
			"url": "templates/episode/washingtonSBCTC.html",
			"applies_to_narratives": false,
			"updated_at": "2015-12-28T18:13:14Z",
			"created_at": "2015-12-28T18:13:14Z"
		}, {
			"_id": "56e73d2e27f8580230004abc",
			"name": "Narrasys Professional",
			"url": "templates/episode/narrasys-pro.html",
			"applies_to_narratives": false,
			"updated_at": "2016-04-20T19:16:38Z",
			"created_at": "2016-03-14T22:37:34Z",
			"theme_colors": {"orange": "#DE6625", "mondrian_border": "#4d4d4d"}
		}, {
			"_id": "56e73d5827f8580230004abd",
			"name": "Centered Pro",
			"url": "templates/scene/centeredPro.html",
			"applies_to_narratives": false,
			"updated_at": "2016-03-14T22:38:16Z",
			"created_at": "2016-03-14T22:38:16Z"
		}, {
			"_id": "56e73d7f27f8580230004abe",
			"name": "Center video - vertical",
			"url": "templates/scene/centerVV.html",
			"applies_to_narratives": false,
			"updated_at": "2016-03-14T22:38:55Z",
			"created_at": "2016-03-14T22:38:55Z"
		}, {
			"_id": "56e73dc127f8580230004abf",
			"name": "Link with image - no title",
			"event_types": ["Link"],
			"url": "templates/item/link-withimage-notitle.html",
			"applies_to_narratives": false,
			"updated_at": "2016-03-14T22:40:01Z",
			"created_at": "2016-03-14T22:40:01Z"
		}, {
			"_id": "56e73de141f6df1fee0044d0",
			"name": "Center video - Mondrian",
			"url": "templates/scene/centerVV-Mondrian.html",
			"applies_to_narratives": false,
			"updated_at": "2016-03-14T22:40:33Z",
			"created_at": "2016-03-14T22:40:33Z"
		}, {
			"_id": "571134e841f6dfd1650000bd",
			"name": "Link in Modal",
			"event_types": ["Link"],
			"url": "templates/item/link-modal-thumb.html",
			"applies_to_narratives": false,
			"updated_at": "2016-04-15T18:37:28Z",
			"created_at": "2016-04-15T18:37:28Z"
		}];
		var _572920395c92eb5bb00000de = {
			"_id": "572920395c92eb5bb00000de",
			"title": {"en": "brand new"},
			"description": {"en": ""},
			"languages": [{"code": "en", "default": true}],
			"master_asset_id": "572923f15c92eb00cf000110",
			"template_id": "56e73d2e27f8580230004abc",
			"style_id": [],
			"container_id": "572920395c92eb5bb00000dd",
			"status": "Unpublished",
			"created_at": "2016-05-03T22:03:37Z",
			"updated_at": "2016-05-03T22:19:32Z",
			"parent_id": null
		};
		var _events = [{
			"_id": "572920395c92ebb2590000df",
			"_type": "Scene",
			"type": "Scene",
			"start_time": 0.01,
			"end_time": 36.99,
			"episode_id": "572920395c92eb5bb00000de",
			"templateUrl": "templates/scene/centerVV.html",
			"title": {},
			"description": {},
			"style_id": [],
			"layout_id": ["52e15b40c9b715cfbb00000d"],
			"template_id": "56e73d7f27f8580230004abe",
			"user_id": "565f578227f858b7e20000e4"
		},
		//	{
		//	"_id": "572924675c92ebc256000116",
		//	"_type": "Link",
		//	"type": "Link",
		//	"start_time": 0.02,
		//	"end_time": 36.9,
		//	"episode_id": "572920395c92eb5bb00000de",
		//	"templateUrl": "templates/item/link-embed.html",
		//	"cosmetic": false,
		//	"title": {},
		//	"url": "https://s3.amazonaws.com/narrasys.static.uploads/business-pitch/bc-demandmetric-interactive-video-benchmark-report.pdf",
		//	"noEmbed": false,
		//	"description": {},
		//	"link_image_id": null,
		//	"avatar_id": "56f9b8b741f6df37610079cd",
		//	"style_id": [],
		//	"layout_id": ["52e15b43c9b715cfbb000025"],
		//	"template_id": "53270800ed245331bd000004",
		//	"user_id": "565f578227f858b7e20000e4"
		//},
		//	{
		//	"_id": "572924c35c92eb1d8100011c",
		//	"_type": "Upload",
		//	"type": "Upload",
		//	"start_time": 0.01,
		//	"end_time": 36.9,
		//	"episode_id": "572920395c92eb5bb00000de",
		//	"templateUrl": "templates/item/image-thumbnail.html",
		//	"cosmetic": false,
		//	"title": {},
		//	"noEmbed": false,
		//	"description": {},
		//	"asset_id": "572924bf5c92eb58cf00011b",
		//	"avatar_id": "56f9b8b741f6df37610079cd",
		//	"style_id": [],
		//	"layout_id": ["52e15b43c9b715cfbb000025"],
		//	"template_id": "52e15b43c9b715cfbb00001f",
		//	"user_id": "565f578227f858b7e20000e4"
		//},
		//	{
		//	"_id": "572925055c92eb9f85000123",
		//	"_type": "Annotation",
		//	"type": "Annotation",
		//	"start_time": 1.44,
		//	"end_time": 36.9,
		//	"episode_id": "572920395c92eb5bb00000de",
		//	"templateUrl": "templates/item/pullquote-noattrib.html",
		//	"cosmetic": false,
		//	"title": {},
		//	"noEmbed": false,
		//	"annotator": {},
		//	"annotation": {"en": "This is the real PQ"},
		//	"annotation_image_id": null,
		//	"avatar_id": "56f9b8b741f6df37610079cd",
		//	"style_id": [],
		//	"layout_id": ["52e15b43c9b715cfbb000025"],
		//	"template_id": "52e15b42c9b715cfbb000019",
		//	"user_id": "565f578227f858b7e20000e4"
		//}
		];
		var _postAssets = {
			"files": [{
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
				"plugins_count": 0
			}, {
				"_id": "572923f15c92eb00cf000110",
				"_type": "Asset::Video",
				"container_id": "572920395c92eb5bb00000dd",
				"user_id": "565f578227f858b7e20000e4",
				"filename": "_zFoxBaGDQg?enablejsapi=1&controls=0&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&wmode=transparent",
				"original_filename": "_zFoxBaGDQg?enablejsapi=1&controls=0&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&wmode=transparent",
				"extension": "",
				"content_type": "video/mp4",
				"size": null,
				"name": {"en": "MVP Demo.3"},
				"description": {"en": ""},
				"url": "images/demoVideo.mp4",
				"episodes_count": 0,
				"episode_poster_frames_count": 0,
				"links_count": 0,
				"annotations_count": 0,
				"narratives_count": 0,
				"timelines_count": 0,
				"uploads_count": 0,
				"plugins_count": 0,
				"alternate_urls": [],
				"you_tube_url": null,
				"frame_rate": null,
				"frame_rate_n": null,
				"frame_rate_d": null,
				"start_time": null,
				"duration": 37,
				"width": null,
				"height": null
			}
			//	{
			//	"_id": "572924bf5c92eb58cf00011b",
			//	"_type": "Asset::Image",
			//	"container_id": "572920395c92eb5bb00000dd",
			//	"user_id": "565f578227f858b7e20000e4",
			//	"filename": "e303f466-6f41-4e21-c210-a5f6e4c58cb5",
			//	"original_filename": "Slide04 Solution.v12.jpg",
			//	"extension": "jpg",
			//	"content_type": "image/jpeg",
			//	"size": null,
			//	"name": {"en": "Slide04 Solution.v12"},
			//	"description": {},
			//	"url": "https://s3.amazonaws.com/itt.user.uploads/development/-Ytigg3rHoJOxeQExlZcZw/e303f466-6f41-4e21-c210-a5f6e4c58cb5",
			//	"episodes_count": 0,
			//	"episode_poster_frames_count": 0,
			//	"links_count": 0,
			//	"annotations_count": 0,
			//	"narratives_count": 0,
			//	"timelines_count": 0,
			//	"uploads_count": 1,
			//	"plugins_count": 0
			//}
			]
		};
		var _container = [{
			"_id": "572920395c92eb5bb00000dd",
			"parent_id": "56d8c32241f6df3761000d2e",
			"sort_order": 0,
			"name": {"en": "brand new"},
			"customer_id": "56d8c11a27f858df270011e8",
			"keywords": [],
			"episodes": ["572920395c92eb5bb00000de"]
		}];
		var _containerAssets = {
			"files": [{
				"_id": "572923f15c92eb00cf000110",
				"_type": "Asset::Video",
				"container_id": "572920395c92eb5bb00000dd",
				"user_id": "565f578227f858b7e20000e4",
				"filename": "_zFoxBaGDQg?enablejsapi=1&controls=0&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&wmode=transparent",
				"original_filename": "_zFoxBaGDQg?enablejsapi=1&controls=0&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&wmode=transparent",
				"extension": "",
				"content_type": "video/mp4",
				"size": null,
				"name": {"en": "MVP Demo.3"},
				"description": {"en": ""},
				"url": "images/demoVideo.mp4",
				"episodes_count": 0,
				"episode_poster_frames_count": 0,
				"links_count": 0,
				"annotations_count": 0,
				"narratives_count": 0,
				"timelines_count": 0,
				"uploads_count": 0,
				"plugins_count": 0,
				"alternate_urls": [],
				"you_tube_url": null,
				"frame_rate": null,
				"frame_rate_n": null,
				"frame_rate_d": null,
				"start_time": null,
				"duration": 37,
				"width": null,
				"height": null
			},
			//	{
			//	"_id": "572924bf5c92eb58cf00011b",
			//	"_type": "Asset::Image",
			//	"container_id": "572920395c92eb5bb00000dd",
			//	"user_id": "565f578227f858b7e20000e4",
			//	"filename": "e303f466-6f41-4e21-c210-a5f6e4c58cb5",
			//	"original_filename": "Slide04 Solution.v12.jpg",
			//	"extension": "jpg",
			//	"content_type": "image/jpeg",
			//	"size": null,
			//	"name": {"en": "Slide04 Solution.v12"},
			//	"description": {},
			//	"url": "https://s3.amazonaws.com/itt.user.uploads/development/-Ytigg3rHoJOxeQExlZcZw/e303f466-6f41-4e21-c210-a5f6e4c58cb5",
			//	"episodes_count": 0,
			//	"episode_poster_frames_count": 0,
			//	"links_count": 0,
			//	"annotations_count": 0,
			//	"narratives_count": 0,
			//	"timelines_count": 0,
			//	"uploads_count": 1,
			//	"plugins_count": 0
			//}
			]
		};

		return {
			v1Assets: _stubAssetId,
			v1Layouts: _layouts,
			v1Styles: _styles,
			v1Templates: _templates,
			postAsset: _postAssets,
			stubImg: _stubImg,
			stubPdf: _stubPdf,
			stubPq: _stubPQ,
			showUser: _showUser,
			nonce: _nonce,
			accessToken: _accessToken,
			'572920395c92eb5bb00000de': _572920395c92eb5bb00000de,
			events: _events,
			container: _container,
			containerAssets: _containerAssets
		};
	}


})();
