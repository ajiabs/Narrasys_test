'use strict';

/* 
	Transform v1 styles into new foo.tmpl objects.

	Can remove this once all existing episode/event data has been updated to use .tmpl instead of styles+layouts
*/

angular.module('com.inthetelling.story').factory('styleCompatibility', function () {

	var svc = {};

	var updateTemplates = {
		// Overkill, matches every template variant we've ever had, whether it's in the database or not.

		episode: {
			"templates/episode-default.html": "default",
			"templates/episode/episode.html": "default",
			"templates/episode-eliterate.html": "eliterate",
			"templates/episode/eliterate.html": "eliterate",
			"templates/episode-ewb.html": "ewb",
			"templates/episode/ewb.html": "ewb",
			"templates/episode-gw.html": "gw",
			"templates/episode/gw.html": "gw",
			"templates/episode-purdue.html": "purdue",
			"templates/episode/purdue.html": "purdue",
			"templates/episode-tellingstory.html": "telling-story",
			"templates/episode/story.html": "telling-story",
			"templates/episode/columbia.html": "columbia",
			"templates/episode/columbiabusiness.html": "columbia-business",
			"templates/episode/gwlaw.html": "gwlaw",
			"templates/episode/gwsb.html": "gwmooc",
			"templates/episode/middlebury.html": "middlebury",
			"templates/episode/prolotherapy.html": "prolotherapy",
			"templates/episode/schoolclimatesolutions.html": "scs",
			"templates/episode/usc.html": "usc",
		},
		scene: {
			"templates/scene-1col.html": "1col",
			"templates/scene/1col.html": "1col",
			"templates/scene-2colL.html": "2colL",
			"templates/scene/2colL.html": "2colL",
			"templates/scene-2colR.html": "2colR",
			"templates/scene/2colR.html": "2colR",
			"templates/scene-centered.html": "centered",
			"templates/scene/centered.html": "centered",
			"templates/scene-cornerH.html": "cornerH",
			"templates/scene/cornerH.html": "cornerH",
			"templates/scene-cornerV.html": "cornerV",
			"templates/scene/cornerV.html": "cornerV",
			"templates/scene/pip.html": "pip",
		},
		annotation: {
			"templates/text-h1.html": "h1",
			"templates/item/text-h1.html": "h1",
			"templates/text-h2.html": "h2",
			"templates/item/text-h2.html": "h2",
			"templates/item/pullquote.html": "pullquote",
			"templates/text-pullquote.html": "pullquote",
			"templates/text-pullquote-noattrib.html": "pullquote-noattrib",
			"templates/item/pullquote-noattrib.html": "pullquote-noattrib",
			"templates/text-transmedia.html": "text",
		},
		transcript: {
			"templates/item/transcript.html": "default",
			"templates/transcript-default.html": "default",
			"templates/transcript-withthumbnail.html": "transcript-thumb",
			"templates/item/transcript-withthumbnail.html": "transcript-thumb",
			"templates/item/transcript-withthumbnail-alt.html": "transcript-thumb-alt",
			"templates/transcript-withthumbnail-alt.html": "transcript-thumb-alt",
		},
		image: {
			"templates/item/image.html": "default",
			"templates/transmedia-image-default.html": "default",
			"templates/item/image-plain.html": "plain",
			"templates/transmedia-image-plain.html": "plain",
			"templates/item/image-fill.html": "fill",
			"templates/transmedia-image-fill.html": "fill",
			"templates/transmedia-caption.html": "caption",
			"templates/item/image-caption.html": "caption",
			"templates/transmedia-slidingcaption.html": "sliding-caption",
			"templates/item/image-caption-sliding.html": "sliding-caption",
			"templates/item/image-inline-withtext.html": "inline-text",
			"templates/transmedia-thumbnail.html": "thumbnail",
			"templates/item/image-thumbnail.html": "thumbnail",
		},
		upload: {
			"templates/item/image-linkonly.html": "link",
			"templates/transmedia-linkonly.html": "link",
		},
		link: {
			"templates/item/link.html": "default",
			"templates/transmedia-link-default.html": "default",
			"templates/transmedia-link-youtube.html": "default",
			"templates/transmedia-link-embed.html": "embed",
			"templates/item/link-embed.html": "embed",
			"templates/transmedia-embed-youtube.html": "embed",
			"templates/transmedia-link-noembed.html": "noembed",
			"templates/item/link-descriptionfirst.html": "description-first",
			"templates/item/link-withimage.html": "with-image",
			"templates/transmedia-link-frameicide.html": "framebreak",
		},
		quiz: {
			"templates/item/multiplechoice.html": "mc",
			"templates/item/question-mc-formative.html": "mc",
			"templates/item/question-mc-poll.html": "mc",
			"templates/item/question-mc.html": "mc",
			"templates/item/sxs-question.html": "mc",
			"templates/question-mc-formative.html": "mc",
			"templates/question-mc-poll.html": "mc",
			"templates/question-mc.html": "mc",
			"templates/sxs-question.html": "mc",
			"templates/item/question-mc-image-left.html": "mc-image-left",
			"templates/item/question-mc-image-right.html": "mc-image-right",
			"templates/question-mc-image-left.html": "mc-image-left",
			"templates/question-mc-image-right.html": "mc-image-right",
		},
		plugin: {
			"templates/item/usc-badges.html": "usc-badge"
		}
	};

	svc.unpackEpisodeV1Styles = function (episode) {

		if (!episode.templateUrl) {
			return episode;
		}

		var tmpl = {
			_v: 2,
			itemType: 'episode',
			style: {
				text: ['#000'],
				link: '#00C',
			},
		};

		if (updateTemplates.episode[episode.templateUrl]) {
			tmpl.template = updateTemplates.episode[episode.templateUrl];
		} else {
			console.error("No episode template found for ", episode.templateUrl);
		}

		// overrides:
		switch (tmpl.template) {
		case "telling-story":
			tmpl.style = {
				text: ['#000'],
				link: '#00C',
			};
			break;
		case "eliterate":
			tmpl.style = {
				text: ['#6f7d8b', '#1376bb'],
				link: '#384d62',
			};
			break;
		case "ewb":
			tmpl.style = {};
			break;
		case "gw":
			tmpl.style = {};
			break;
		case "purdue":
			tmpl.style = {};
			break;
		case "columbia":
			tmpl.style = {};
			break;
		case "columbia-business":
			tmpl.style = {};
			break;
		case "gwlaw":
			tmpl.style = {};
			break;
		case "gwmooc":
			tmpl.style = {};
			break;
		case "middlebury":
			tmpl.style = {};
			break;
		case "prolotherapy":
			tmpl.style = {};
			break;
		case "scs":
			tmpl.style = {};
			break;
		case "usc":
			tmpl.style = {};
			break;
		}

		tmpl.style = tmpl.style || {
			text: null,
			color: null,
			link: null
		};

		tmpl.template = updateTemplates[tmpl.itemType][episode.templateUrl];

		episode.tmpl = tmpl;
		return episode;
	};

	svc.unpackEventV1Styles = function (event) {

		var tmpl = {
			_v: 2,
			style: {
				text: ['#000'],
				link: '#00C',
			},
		};

		if (event.producerItemType) {
			tmpl.itemType = event.producerItemType;
		}
		// get itemType
		angular.forEach(Object.keys(updateTemplates), function (itemType) {
			if (updateTemplates[itemType][event.templateUrl]) {
				tmpl.itemType = itemType;
			}
		});

		console.log(tmpl);

		if (tmpl.itemType) {
			tmpl.template = updateTemplates[tmpl.itemType][event.templateUrl];

			tmpl.style.text = tmpl.style.text || updateTemplates[tmpl.itemType].default.text;
			tmpl.style.link = tmpl.style.link || updateTemplates[tmpl.itemType].default.link;
		} else {
			console.warn("got no itemType for ", event);
		}

		event.tmpl = tmpl;

		// OLD below

		if (event._type !== 'Scene') {

			// clear derived flags before re-setting them (in case we're editing an existing item):
			event.isContent = false;
			event.isTranscript = false;
			event.noEmbed = false;
			event.noExternalLink = false;
			event.targetTop = false;

			// determine whether the item is in a regular content pane.
			// items only have one layout (scenes may have more than one...)
			if (event.layouts) {
				event.layoutCss = event.layouts[0];
				if (event.layouts[0] === 'inline' || event.layouts[0].match(/sidebar/) || event.layouts[0].match(/burst/)) {
					event.isContent = true;
				}
			} else {
				// no layout, therefore inline content
				event.isContent = true;
			}

			// Old templates which (TODO) should have been database fields instead:
			if (event._type === 'Annotation' && event.templateUrl.match(/transcript/)) {
				event.isTranscript = true;
			}

			// Links:
			if (event.templateUrl.match(/noembed/)) {
				event.noEmbed = true;
			}
			if (event._type === "Link" && event.url && event.url.match(/^http:\/\//)) {
				//console.warn("Can't embed http:// link type:", event.url);
				event.noEmbed = true;
			}
			if (event.templateUrl.match(/link-youtube/) || event.templateUrl.match(/-embed/)) {
				event.noExternalLink = true;
			}
			if (event.templateUrl.match(/frameicide/)) {
				event.targetTop = true;
				event.noEmbed = true;
			}
		}

		// both scenes and items.  Do this last for now, since we're doing some ugly string matching against the old templateUrl:
		if (updateTemplates[event.templateUrl]) {
			// event.origTemplateUrl = event.templateUrl;
			event.templateUrl = updateTemplates[event.templateUrl];

			// coerce old image-plain background images into image-fill:
			if (!event.isContent && event.templateUrl === "templates/item/image-plain.html") {
				event.templateUrl = "templates/item/image-fill.html";
			}
			// hack for old authoring tool quirk:
			if (event.templateUrl === "templates/item/image-plain.html") {
				if (event.styles) {
					event.styles.push("timestampNone");
				} else {
					event.styles = ["timestampNone"];
				}
			}
		} else {
			// console.log("Keeping same templateUrl:", event.templateUrl);
			// event.origTemplateUrl = event.templateUrl;
		}

		// Finally one more super-fragile HACK for producer:
		if (!event.producerItemType) {
			if (event._type === 'Scene') {
				event.producerItemType = 'scene';
			} else if (event._type === 'Annotation') {
				if (event.templateUrl.match(/transcript/)) {
					event.producerItemType = 'transcript';
				} else {
					event.producerItemType = 'annotation';
				}
			} else if (event._type === 'Upload') {
				if (event.templateUrl.match(/file/)) {
					event.producerItemType = 'file';
				} else {
					event.producerItemType = 'image';
				}
			} else if (event._type === 'Link') {
				event.producerItemType = 'link'; // for now this includes sxs video
			} else if (event._type === 'Plugin') {
				if (event.templateUrl.match(/question/)) {
					event.producerItemType = 'question';
				}
			}
			if (!event.producerItemType) {
				console.warn("Couldn't determine a producerItemType for ", event.templateUrl);
			}
		}

		return event;
	};

	svc.uscHacks = function (event) {
		// HACKS AHOY
		// USC made a bunch of change requests post-release; this was the most expedient way
		// to deal with them. Sorry!   TODO most of this can be fixed in the source data instead. 
		// The only exception is the uscHackOnlyBadge... handle that with a wrapper template instead?

		// I don't know why this situation occurs, but it does:
		if (!event.templateUrl) {
			event.templateUrl = 'templates/item/usc-badges.html';
		}

		if (event._type === "Link") {
			if (event.templateUrl === 'templates/transmedia-link-default.html') {
				// they don't want any embedded links (shrug)
				event.templateUrl = 'templates/transmedia-link-noembed.html';
			}
			if (event.display_title.match(/ACTIVITY/)) {
				// Unnecessary explanatory text
				event.display_description = event.display_description + '<div class="uscWindowFgOnly">Remember! You need to complete this activity to earn a Friends of USC Scholars badge. (When you’re finished - Come back to this page and click <b>Continue</b>).<br><br>If you’d rather <b>not</b> do the activity, clicking Continue will take you back to the micro-lesson and you can decide where you want to go from there.</div>';
			}
			if (event.display_title.match(/Haven't Registered/)) {
				// hide this event for non-guest users
				event.styles = event.styles ? event.styles : [];
				event.styles.push("uscHackOnlyGuests"); // will be used in discover mode (so we don't have to explicitly include it in the scene templates)
				event.uscReviewModeHack = "uscHackOnlyGuests"; // ...except the review mode template, because item styles don't show up there
			}
			if (event.display_title.match(/Connect with/)) {
				// hide this event unless episode badge is achieved
				event.styles = event.styles ? event.styles : [];
				event.styles.push("uscHackOnlyBadge"); // will be used in discover mode (so we don't have to explicitly include it in the scene templates)
				event.uscReviewModeHack = "uscHackOnlyBadge"; // ...except the review mode template, because item styles don't show up there
			}
		}
		return event;
	}

	return svc;
});
