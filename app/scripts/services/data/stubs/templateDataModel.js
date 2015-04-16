angular.module('com.inthetelling.story')
	.service('TemplateDataModel', function TemplateDataModel() {
		this.data = [{
			"_id": "5240be41dd4736976c00000d",
			"url": "http://test/template/url",
			"name": "test template",
			"event_type": [],
			"applies_to_episodes": false
		}, {
			"_id": "5240c9ffdd4736042c00000e",
			"url": "http://example/template/url",
			"name": "example template",
			"event_type": ["Annotation"],
			"applies_to_episodes": false
		}, {
			"_id": "528d17ebba4f65e578000003",
			"name": "Default episode template",
			"url": "templates/episode-default.html",
			"event_types": [],
			"applies_to_episodes": true,
			"updated_at": "2013-11-20T20:13:31Z",
			"created_at": "2013-11-20T20:13:31Z",
			"applies_to_narratives": false
		}, {
			"_id": "528d17ebba4f65e578000004",
			"name": "Scene centered",
			"url": "templates/scene-centered.html",
			"event_types": ["Scene"],
			"applies_to_episodes": false,
			"updated_at": "2013-11-20T20:13:31Z",
			"created_at": "2013-11-20T20:13:31Z",
			"applies_to_narratives": false
		}, {
			"_id": "528d17ebba4f65e578000005",
			"name": "Scene 1 column",
			"url": "templates/scene-1col.html",
			"event_types": ["Scene"],
			"applies_to_episodes": false,
			"updated_at": "2013-11-20T20:13:31Z",
			"created_at": "2013-11-20T20:13:31Z",
			"applies_to_narratives": false
		}, {
			"_id": "528d17ebba4f65e578000006",
			"name": "Scene 2 columns left",
			"url": "templates/scene-2colL.html",
			"event_types": ["Scene"],
			"applies_to_episodes": false,
			"updated_at": "2013-11-20T20:13:31Z",
			"created_at": "2013-11-20T20:13:31Z",
			"applies_to_narratives": false
		}, {
			"_id": "528d17ebba4f65e578000007",
			"name": "Scene 2 columns right",
			"url": "templates/scene-2colR.html",
			"event_types": ["Scene"],
			"applies_to_episodes": false,
			"updated_at": "2013-11-20T20:13:31Z",
			"created_at": "2013-11-20T20:13:31Z",
			"applies_to_narratives": false
		}, {
			"_id": "528d17ebba4f65e578000008",
			"name": "Scene corner horizontal",
			"url": "templates/scene-cornerH.html",
			"event_types": ["Scene"],
			"applies_to_episodes": false,
			"updated_at": "2013-11-20T20:13:31Z",
			"created_at": "2013-11-20T20:13:31Z",
			"applies_to_narratives": false
		}, {
			"_id": "528d17ebba4f65e578000009",
			"name": "Scene corner vertical",
			"url": "templates/scene-cornerV.html",
			"event_types": ["Scene"],
			"applies_to_episodes": false,
			"updated_at": "2013-11-20T20:13:31Z",
			"created_at": "2013-11-20T20:13:31Z",
			"applies_to_narratives": false
		}, {
			"_id": "528d17ecba4f65e578000013",
			"applies_to_episodes": false,
			"created_at": "2013-11-20T20:13:32Z",
			"event_types": ["Annotation"],
			"name": "Default",
			"updated_at": "2014-04-24T17:04:04Z",
			"url": "templates/transcript-default.html",
			"applies_to_narratives": false
		}, {
			"_id": "528d17edba4f65e578000014",
			"name": "Item image default",
			"url": "templates/transmedia-image-default.html",
			"event_types": ["Annotation", "Link", "Upload"],
			"applies_to_episodes": false,
			"updated_at": "2013-11-20T20:13:33Z",
			"created_at": "2013-11-20T20:13:33Z",
			"applies_to_narratives": false
		}, {
			"_id": "528d17edba4f65e578000015",
			"applies_to_episodes": false,
			"created_at": "2013-11-20T20:13:33Z",
			"event_types": ["Upload"],
			"name": "Image plain",
			"updated_at": "2014-04-24T17:12:14Z",
			"url": "templates/transmedia-image-plain.html",
			"applies_to_narratives": false
		}, {
			"_id": "528d17edba4f65e578000016",
			"applies_to_episodes": false,
			"created_at": "2013-11-20T20:13:33Z",
			"event_types": ["Link"],
			"name": "Item link default",
			"updated_at": "2014-04-24T17:08:34Z",
			"url": "templates/transmedia-link-default.html",
			"applies_to_narratives": false
		}, {
			"_id": "52af6f3941b3997a27953729",
			"applies_to_episodes": false,
			"created_at": "2013-11-20T20:13:33Z",
			"event_types": ["Link"],
			"name": "Link new window",
			"updated_at": "2014-03-13T14:43:44Z",
			"url": "templates/transmedia-link-noembed.html",
			"applies_to_narratives": false
		}, {
			"_id": "52af6fce41b3997a2795372a",
			"name": "You tube embed",
			"url": "templates/transmedia-link-youtube.html",
			"event_types": ["Annotation", "Link", "Upload"],
			"applies_to_episodes": false,
			"updated_at": "2013-11-20T20:13:33Z",
			"created_at": "2013-11-20T20:13:33Z",
			"applies_to_narratives": false
		}, {
			"_id": "5321bfc7ba4f6586fb000001",
			"name": "EWB Episode Template",
			"url": "templates/episode-ewb.html",
			"event_types": [],
			"applies_to_episodes": true,
			"updated_at": "2014-03-13T14:25:11Z",
			"created_at": "2014-03-13T14:25:11Z",
			"applies_to_narratives": false
		}, {
			"_id": "5321c01fba4f6586fb000002",
			"name": "Telling Story Episode Template",
			"url": "templates/episode-tellingstory.html",
			"event_types": [],
			"applies_to_episodes": true,
			"updated_at": "2014-03-13T14:26:39Z",
			"created_at": "2014-03-13T14:26:39Z",
			"applies_to_narratives": false
		}, {
			"_id": "5321c040ba4f6586fb000003",
			"name": "e-Literate.tv Episode Template",
			"url": "templates/episode-eliterate.html",
			"event_types": [],
			"applies_to_episodes": true,
			"updated_at": "2014-03-13T14:27:12Z",
			"created_at": "2014-03-13T14:27:12Z",
			"applies_to_narratives": false
		}, {
			"_id": "5321c065ba4f6586fb000004",
			"name": "GWU Episode Template",
			"url": "templates/episode-gw.html",
			"event_types": [],
			"applies_to_episodes": true,
			"updated_at": "2014-03-13T14:27:49Z",
			"created_at": "2014-03-13T14:27:49Z",
			"applies_to_narratives": false
		}, {
			"_id": "5321c127ba4f6586fb000006",
			"applies_to_episodes": false,
			"created_at": "2014-03-13T14:31:03Z",
			"event_types": ["Annotation"],
			"name": "With thumbnail",
			"updated_at": "2014-04-24T17:05:18Z",
			"url": "templates/transcript-withthumbnail.html",
			"applies_to_narratives": false
		}, {
			"_id": "5321c14fba4f6586fb000007",
			"applies_to_episodes": false,
			"created_at": "2014-03-13T14:31:43Z",
			"event_types": ["Annotation"],
			"name": "With thumbnail alternate",
			"updated_at": "2014-04-24T17:05:44Z",
			"url": "templates/transcript-withthumbnail-alt.html",
			"applies_to_narratives": false
		}, {
			"_id": "5321c168ba4f6586fb000008",
			"applies_to_episodes": false,
			"created_at": "2014-03-13T14:32:08Z",
			"event_types": ["Annotation"],
			"name": "Pull quote",
			"updated_at": "2014-04-24T17:06:12Z",
			"url": "templates/text-pullquote.html",
			"applies_to_narratives": false
		}, {
			"_id": "5321c195ba4f6586fb000009",
			"applies_to_episodes": false,
			"created_at": "2014-03-13T14:32:53Z",
			"event_types": ["Annotation"],
			"name": "Pull quote w/o attrib",
			"updated_at": "2014-04-24T17:06:31Z",
			"url": "templates/text-pullquote-noattrib.html",
			"applies_to_narratives": false
		}, {
			"_id": "5321c1b9ba4f6586fb00000a",
			"applies_to_episodes": false,
			"created_at": "2014-03-13T14:33:29Z",
			"event_types": ["Annotation"],
			"name": "Banner Lg",
			"updated_at": "2014-04-24T17:06:52Z",
			"url": "templates/text-h1.html",
			"applies_to_narratives": false
		}, {
			"_id": "5321c1c9ba4f6586fb00000b",
			"applies_to_episodes": false,
			"created_at": "2014-03-13T14:33:45Z",
			"event_types": ["Annotation"],
			"name": "Banner Sm",
			"updated_at": "2014-04-24T17:07:10Z",
			"url": "templates/text-h2.html",
			"applies_to_narratives": false
		}, {
			"_id": "5321c354ba4f6586fb00000c",
			"name": "Image link",
			"url": "templates/transmedia-linkonly.html",
			"event_types": ["Upload"],
			"applies_to_episodes": false,
			"updated_at": "2014-03-13T14:40:20Z",
			"created_at": "2014-03-13T14:40:20Z",
			"applies_to_narratives": false
		}, {
			"_id": "5321c37dba4f6586fb00000d",
			"name": "Image Thumbnail",
			"url": "templates/transmedia-thumbnail.html",
			"event_types": ["Upload"],
			"applies_to_episodes": false,
			"updated_at": "2014-03-13T14:41:01Z",
			"created_at": "2014-03-13T14:41:01Z",
			"applies_to_narratives": false
		}, {
			"_id": "5321c39dba4f6586fb00000e",
			"name": "Image Caption",
			"url": "templates/transmedia-caption.html",
			"event_types": ["Upload"],
			"applies_to_episodes": false,
			"updated_at": "2014-03-13T14:41:33Z",
			"created_at": "2014-03-13T14:41:33Z",
			"applies_to_narratives": false
		}, {
			"_id": "5321c3aeba4f6586fb00000f",
			"name": "Image Caption Sliding",
			"url": "templates/transmedia-slidingcaption.html",
			"event_types": ["Upload"],
			"applies_to_episodes": false,
			"updated_at": "2014-03-13T14:41:50Z",
			"created_at": "2014-03-13T14:41:50Z",
			"applies_to_narratives": false
		}, {
			"_id": "5321c3ccba4f6586fb000010",
			"name": "Image Fill",
			"url": "templates/transmedia-image-fill.html",
			"event_types": ["Upload"],
			"applies_to_episodes": false,
			"updated_at": "2014-03-13T14:42:20Z",
			"created_at": "2014-03-13T14:42:20Z",
			"applies_to_narratives": false
		}, {
			"_id": "5321c45dba4f6586fb000011",
			"name": "Link Framicide",
			"url": "templates/transmedia-link-frameicide.html",
			"event_types": ["Link"],
			"applies_to_episodes": false,
			"updated_at": "2014-03-13T14:44:45Z",
			"created_at": "2014-03-13T14:44:45Z",
			"applies_to_narratives": false
		}, {
			"_id": "5321c47cba4f6586fb000012",
			"name": "Link Youtube",
			"url": "templates/transmedia-link-youtube.html",
			"event_types": ["Link"],
			"applies_to_episodes": false,
			"updated_at": "2014-03-13T14:45:16Z",
			"created_at": "2014-03-13T14:45:16Z",
			"applies_to_narratives": false
		}, {
			"_id": "5321c4b6ba4f6586fb000013",
			"name": "Link Youtube Embed",
			"url": "templates/transmedia-embed-youtube.html",
			"event_types": ["Link"],
			"applies_to_episodes": false,
			"updated_at": "2014-03-13T14:46:14Z",
			"created_at": "2014-03-13T14:46:14Z",
			"applies_to_narratives": false
		}, {
			"_id": "5321c4cfba4f6586fb000014",
			"name": "Link Embed",
			"url": "templates/transmedia-link-embed.html",
			"event_types": ["Link"],
			"applies_to_episodes": false,
			"updated_at": "2014-03-13T14:46:39Z",
			"created_at": "2014-03-13T14:46:39Z",
			"applies_to_narratives": false
		}, {
			"_id": "5339deddba4f65a45e00000b",
			"name": "demo for SxS",
			"event_types": ["Upload"],
			"url": "templates/upload-demo.html",
			"updated_at": "2014-03-31T21:32:13Z",
			"created_at": "2014-03-31T21:32:13Z",
			"applies_to_narratives": false
		}, {
			"_id": "533d72752442bdbd81000001",
			"name": "demo for SxS - inline",
			"event_types": ["Upload"],
			"url": "templates/upload-demo-inline.html",
			"updated_at": "2014-04-03T14:38:45Z",
			"created_at": "2014-04-03T14:38:45Z",
			"applies_to_narratives": false
		}, {
			"_id": "539a07ee2442bd20bf000006",
			"created_at": "2014-06-12T20:05:02Z",
			"event_types": ["Plugin"],
			"name": "Multiple choice question",
			"updated_at": "2014-06-12T20:50:15Z",
			"url": "templates/item/multiplechoice.html",
			"applies_to_narratives": false
		}, {
			"_id": "53a1d0672442bd95b1000002",
			"name": "USC Credly Badge",
			"url": "templates/item/usc-badges.html",
			"updated_at": "2014-06-18T17:46:15Z",
			"created_at": "2014-06-18T17:46:15Z",
			"applies_to_narratives": false
		}, {
			"_id": "544fb8d42442bd33c2000004",
			"name": "Picture In Picture",
			"event_types": ["Scene"],
			"url": "/templates/scene/pip.html",
			"applies_to_episodes": false,
			"updated_at": "2014-10-28T15:40:04Z",
			"created_at": "2014-10-28T15:40:04Z",
			"applies_to_narratives": false
		}, {
			"_id": "544fb9652442bdd172000005",
			"name": "Picture In Picture",
			"event_types": ["Scene"],
			"url": "templates/scene/pip.html",
			"applies_to_episodes": false,
			"updated_at": "2014-10-28T15:42:29Z",
			"created_at": "2014-10-28T15:42:29Z",
			"applies_to_narratives": false
		}, {
			"_id": "5480c6682442bddb27000006",
			"name": "Middlebury",
			"event_types": [],
			"url": "templates/episode/middlebury.html",
			"applies_to_episodes": true,
			"updated_at": "2014-12-04T20:39:04Z",
			"created_at": "2014-12-04T20:39:04Z",
			"applies_to_narratives": false
		}, {
			"_id": "5494894e21e37fa127000001",
			"name": "Formative Question default",
			"event_types": ["Question"],
			"url": "templates/question-mc-formative.html",
			"applies_to_episodes": false,
			"updated_at": "2014-12-19T20:23:42Z",
			"created_at": "2014-12-19T20:23:42Z",
			"applies_to_narratives": false
		}, {
			"_id": "5494896f21e37fa127000002",
			"name": "Formative Question default",
			"event_types": ["Question"],
			"url": "templates/question-mc-formative.html",
			"applies_to_episodes": false,
			"updated_at": "2014-12-19T20:24:15Z",
			"created_at": "2014-12-19T20:24:15Z",
			"applies_to_narratives": false
		}, {
			"_id": "54948a9421e37fa127000003",
			"name": "Formative Question default",
			"event_types": ["Question"],
			"url": "templates/question-mc-formative.html",
			"applies_to_episodes": false,
			"updated_at": "2014-12-19T20:29:08Z",
			"created_at": "2014-12-19T20:29:08Z",
			"applies_to_narratives": false
		}, {
			"_id": "54948bc521e37fa127000004",
			"name": "Formative Question default",
			"event_types": ["Question"],
			"url": "templates/question-mc-formative.html",
			"applies_to_episodes": false,
			"updated_at": "2014-12-19T20:34:13Z",
			"created_at": "2014-12-19T20:34:13Z",
			"applies_to_narratives": false
		}, {
			"_id": "54948e2021e37ffb36000001",
			"name": "Formative Question default",
			"event_types": ["Question"],
			"url": "templates/question-mc-formative.html",
			"applies_to_episodes": false,
			"updated_at": "2014-12-19T20:44:16Z",
			"created_at": "2014-12-19T20:44:16Z",
			"applies_to_narratives": false
		}, {
			"_id": "549de9b321e37fb07e000004",
			"name": "Poll Question default",
			"event_types": ["Question"],
			"url": "templates/question-mc-poll.html",
			"applies_to_episodes": false,
			"updated_at": "2014-12-26T23:05:23Z",
			"created_at": "2014-12-26T23:05:23Z",
			"applies_to_narratives": false
		}, {
			"_id": "54ef9b6bbca592027a000007",
			"created_at": "2014-12-26T23:05:23Z",
			"updated_at": "2014-12-26T23:05:23Z",
			"name": "MC Question default",
			"event_types": ["Question"],
			"url": "templates/items/question-mc.html",
			"applies_to_episodes": false,
			"applies_to_narratives": false
		}, {
			"_id": "54ef9cbabca592116400000c",
			"created_at": "2014-12-26T23:05:23Z",
			"updated_at": "2014-12-26T23:05:23Z",
			"name": "MC Question default",
			"event_types": ["Question"],
			"url": "templates/item/question-mc.html",
			"applies_to_episodes": false,
			"applies_to_narratives": false
		}, {
			"_id": "55158b32bca5921b7a000008",
			"name": "sxs comment",
			"event_types": ["Scene"],
			"url": "templates/item/sxs-comment.html",
			"applies_to_episodes": false,
			"applies_to_narratives": false,
			"updated_at": "2015-03-27T16:54:10Z",
			"created_at": "2015-03-27T16:54:10Z"
		}];
	});
