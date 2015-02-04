'use strict';

/* Parses API data into player-acceptable format, 
and derives secondary data where necessary for performance/convenience/fun */

angular.module('com.inthetelling.story')
	.factory('modelSvc', function ($interval, $filter, config, appState) {

		var svc = {};

		svc.episodes = {};
		svc.assets = {};
		svc.events = {}; // NOTE svc.events contains scenes and items -- anything that happens during the episode timeline
		svc.containers = {};

		// receives cacheTypes of episode, event, asset, and container.
		// splits event into scenes and items.  Not sure yet whether we care about containers, discarding them for now.

		// TODO? normalize items before cacheing: (annotation_image_id and link_image_id -> asset_id, etc)
		// TODO discard unused fields before cacheing

		// use angular.extend if an object already exists, so we don't lose existing bindings
		svc.cache = function (cacheType, item) {
			if (cacheType === 'episode') {
				if (svc.episodes[item._id]) {
					angular.extend(svc.episodes[item._id], svc.deriveEpisode(angular.copy(item)));
				} else {
					svc.episodes[item._id] = svc.deriveEpisode(angular.copy(item));
				}
			} else if (cacheType === 'event') {
				if (svc.events[item._id]) {
					angular.extend(svc.events[item._id], svc.deriveEvent(angular.copy(item)));
				} else {
					svc.events[item._id] = svc.deriveEvent(angular.copy(item));
				}
			} else if (cacheType === 'asset') {
				if (svc.assets[item._id]) {
					angular.extend(svc.assets[item._id], svc.deriveAsset(angular.copy(item)));
				} else {
					svc.assets[item._id] = svc.deriveAsset(angular.copy(item));
				}
			} else if (cacheType === 'container') {

				// item will have children data. deriveContainer will also create (childless) stubs
				// for each child of this container, and replace container.children with an array of references to each stub

				// parent first:
				if (svc.containers[item._id]) {
					angular.extend(svc.containers[item._id], svc.deriveContainer(angular.copy(item)));
				} else {
					svc.containers[item._id] = svc.deriveContainer(angular.copy(item));
				}

			}
		};

		// update template paths from v1.  This is temporary until I have the set of new templates nailed down
		// and have figured out which can be merged or etc; then we can update the values in the database
		var updateTemplates = {
			"templates/episode-default.html": "templates/episode/episode.html",
			"templates/episode-eliterate.html": "templates/episode/eliterate.html",
			"templates/episode-ewb.html": "templates/episode/ewb.html",
			"templates/episode-gw.html": "templates/episode/gw.html",
			"templates/episode-purdue.html": "templates/episode/purdue.html",
			"templates/episode-tellingstory.html": "templates/episode/story.html",

			"templates/scene-1col.html": "templates/scene/1col.html",
			"templates/scene-2colL.html": "templates/scene/2colL.html",
			"templates/scene-2colR.html": "templates/scene/2colR.html",
			"templates/scene-centered.html": "templates/scene/centered.html",
			"templates/scene-cornerH.html": "templates/scene/cornerH.html",
			"templates/scene-cornerV.html": "templates/scene/cornerV.html",

			//annotation:
			"templates/transcript-default.html": "templates/item/transcript.html",
			"templates/transcript-withthumbnail.html": "templates/item/transcript-withthumbnail.html",
			"templates/transcript-withthumbnail-alt.html": "templates/item/transcript-withthumbnail-alt.html",
			"templates/text-h1.html": "templates/item/text-h1.html",
			"templates/text-h2.html": "templates/item/text-h2.html",
			"templates/text-pullquote-noattrib.html": "templates/item/pullquote-noattrib.html",
			"templates/text-pullquote.html": "templates/item/pullquote.html",

			// upload
			"templates/transmedia-caption.html": "templates/item/image-caption.html",
			"templates/transmedia-image-default.html": "templates/item/image.html",
			"templates/transmedia-slidingcaption.html": "templates/item/image-caption-sliding.html",
			"templates/transmedia-image-fill.html": "templates/item/image-fill.html",
			"templates/transmedia-image-plain.html": "templates/item/image-plain.html",
			"templates/transmedia-linkonly.html": "templates/item/image-linkonly.html",
			"templates/transmedia-thumbnail.html": "templates/item/image-thumbnail.html",

			//link
			"templates/transmedia-link-default.html": "templates/item/link.html",
			"templates/transmedia-link-frameicide.html": "templates/item/link.html",
			"templates/transmedia-link-noembed.html": "templates/item/link.html",
			"templates/transmedia-link-embed.html": "templates/item/link-embed.html",
			"templates/transmedia-link-youtube.html": "templates/item/link.html",
			"templates/transmedia-embed-youtube.html": "templates/item/link-embed.html",

			// was used internally in v3 player, never exposed to authors so shouldn't appear BUT YOU NEVER KNOW:
			"templates/transmedia-link-icon.html": "templates/item/link.html",

			// (from old sxs demo; can delete later)
			"templates/upload-demo-inline.html": "templates/item/debug.html",
			"templates/upload-demo.html": "templates/item/debug.html",

			//questions
			"templates/question-mc-formative.html": "templates/item/question-mc-formative.html",
			"templates/question-mc-poll.html": "templates/item/question-mc-poll.html",
			
			"templates/question-mc.html": "templates/item/question-mc.html",
			"templates/question-mc-image-left.html": "templates/item/question-mc-image-left.html",
			"templates/question-mc-image-right.html": "templates/item/question-mc-image-right.html",
			
			"templates/sxs-question.html": "templates/item/sxs-question.html"
		};

		// svc.deriveFoo() are for efficiency precalculations. 
		// Input API data, output API data plus clientside-only convenience variables.
		// Should call this after making any changes to the underlying data.

		svc.deriveEpisode = function (episode) {
			// console.log("deriveEpisode:", episode);

			if (updateTemplates[episode.templateUrl]) {
				episode.origTemplateUrl = episode.templateUrl;
				episode.templateUrl = updateTemplates[episode.templateUrl];
			}

			// unpack languages
			angular.forEach(episode.languages, function (lang) {
				if (lang.default) {
					// console.log("FOUND DEFAULT LANGUAGE", lang.code, appState.lang);
					episode.defaultLanguage = lang.code;
				}
			});
			if (episode.defaultLanguage === false) {
				episode.defaultLanguage = "en"; // last resort
			}
			svc.setLanguageStrings();

			// For now, automatically add customer-specific styles to episode if there aren't other selections.
			// (TODO Producer should do this automatically; this is for legacy episodes):
			if (!episode.styles) {
				episode.styles = [];
			}
			angular.forEach(["eliterate", "gw", "purdue", "usc", "columbia", "columbiabusiness"], function (customer) {
				if (episode.templateUrl === "templates/episode/" + customer + ".html") {
					angular.forEach(["color", "typography"], function (styleType) {
						// if the episode doesn't already have styletypeFoo, add styletypeCustomer 
						var found = false;
						angular.forEach(episode.styles, function (style) {
							if (style.match(styleType)) {
								found = true;
							}
						});
						if (!found) {
							episode.styles.push(styleType + customer[0].toUpperCase() + customer.substring(1));
						}
					});
				}
			});

			if (episode.title && svc.events["internal:landingscreen:" + episode._id]) {
				svc.events["internal:landingscreen:" + episode._id].title = episode.title;
				svc.events["internal:landingscreen:" + episode._id] = setLang(svc.events["internal:landingscreen:" + episode._id]);
			}

			episode = setLang(episode);
			return episode;
		};

		svc.deriveAsset = function (asset) {
			// console.log("deriveAsset:", asset);
			if (asset._type === "Asset::Video") {
				asset = resolveVideo(asset);
			}
			return asset;
		};

		// TODO there are some hacky dependencies on existing templateUrls which really ought to become
		// separate data fields in their own right:  
		//      isTranscript (for Annotations)
		//      allowEmbed, noExternalLink, and targetTop (for Links)

		/* TODO also we should merge the Link and Upload types, split those templates by file type instead of source,
		   and make all these data fields consistent:

				Upload/link
					title: Link text
					(category)
					required
					description: Description
					displayTime: Timestamp
					allowEmbed: is/isn't frameable
					targetTop: link should point to window.top (for end-of-episode links back to LTI host)
					url: primary URL
					url_type: file type
					(?) secondary image URL (icon, thumbnail, etc)
					
				Annotation
					Speaker
					text
					secondary image URL (speaker icon)
*/

		svc.deriveContainer = function (container) {

			// console.log("deriving container", container);

			container.haveNotLoadedChildData = false; // not sure yet if this is necessary
			// first sort the children:
			if (container.children && container.children.length > 0) {
				// When we populate sort_order, we can remove this:
				container.children = container.children.sort(function (a, b) {
					return (a.name.en > b.name.en) ? 1 : -1; // WARN always sorted by english
				});
				// This is the real one (for now sort_order always is zero, so this sort will have no effect):
				container.children = container.children.sort(function (a, b) {
					return a.sort_order - b.sort_order;
				});

				var childRefs = [];
				angular.forEach(container.children, function (child) {
					if (svc.containers[child._id]) {
						childRefs.push(svc.containers[child._id]);
					} else {
						child.haveNotLoadedChildData = true; // not sure yet if this is necessary
						svc.containers[child._id] = angular.copy(setLang(child));
					}

				});

				container.loadedChildData = true;
			}
			return setLang(container);
		};

		svc.deriveEvent = function (event) {

			event = setLang(event);

			if (event._type !== 'Scene') {
				if (svc.episodes[event.episode_id] && svc.episodes[event.episode_id].templateUrl === 'templates/episode/usc.html') {
					// HACKS AHOY
					// USC made a bunch of change requests post-release; this was the most expedient way
					// to deal with them. Sorry!

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
					// END of USC hacks
				}

				//items

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
				if (event.templateUrl.match(/noembed/)) {
					event.noEmbed = true;
				}

				if (event._type === "Link" && event.url.match(/^http:\/\//)) {
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
				event.origTemplateUrl = event.templateUrl;
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
				event.origTemplateUrl = event.templateUrl;
			}

			// Finally one more super-fragile HACK for producer:
			if (!event.producerItemType) {
				if (event.templateUrl.match(/file/)) {
					event.producerItemType = 'file';
				} else if (event.templateUrl.match(/image/)) {
					event.producerItemType = 'image';
				} else if (event.templateUrl.match(/link/)) {
					event.producerItemType = 'link';
				} else if (event.templateUrl.match(/video/)) {
					event.producerItemType = 'link'; // HACK for now
				} else if (event.templateUrl.match(/question/)) {
					event.producerItemType = 'question';
				} else if (event.templateUrl.match(/transcript/)) {
					event.producerItemType = 'transcript';
				} else if (event.templateUrl.match(/text/)) {
					event.producerItemType = 'annotation';
				} else if (event.templateUrl.match(/pullquote/)) {
					event.producerItemType = 'annotation';
				} else if (event.templateUrl.match(/scene/)) {
					event.producerItemType = 'scene';
				} else if (event.templateUrl.match(/comment/)) {
					event.producerItemType = 'comment';
				} else {
					// console.warn("Couldn't determine a producerItemType for ", event.templateUrl);
				}

			}

			event.displayStartTime = $filter("asTime")(event.start_time);

			return event;
		};

		var setLang = function (obj) {
			// TODO: keywords, customers/oauth2_message
			// TODO use episode default language instead of 'en' 
			var langToSet = (appState.lang) ? appState.lang : "en";
			angular.forEach(["title", "annotator", "annotation", "description", "name"], function (field) {
				if (obj[field]) {
					if (typeof (obj[field]) === 'string') {
						// TODO can delete this after all data has been migrated to object form
						obj["display_" + field] = obj[field];
					} else {
						if (obj[field][langToSet]) {
							obj["display_" + field] = obj[field][langToSet];
						} else {
							obj["display_" + field] = obj[field].en; // TODO use episode default language instead of 'en' 
						}
					}
				}
			});
			return obj;
		};
		svc.setLanguageStrings = function () {
			angular.forEach(svc.events, function (evt) {
				evt = setLang(evt);
			});
			angular.forEach(svc.episodes, function (ep) {
				ep = setLang(ep);
			});
			angular.forEach(svc.containers, function (container) {
				container = setLang(container);
			});
			// todo:  containers
		};

		/*  Any changes to any scene or item data must call svc.resolveEpisodeEvents afterwards. It sets:
				- episode.scenes
				- episode.items
				- scene.items
				- item.scene_id
				- episode.annotators (for use in producer)

		NOTE: this currently calls cascadeStyles on episodes and events as a side effect.  
		deriveEvent() and deriveEpisode() would be a theoretically more consistent place for that, but 
		cascadeStyles depends on the episode structure we're building here, so it feels dangerous to separate them.

		*/
		svc.resolveEpisodeEvents = function (epId) {
			// console.log("resolveEpisodeEvents");
			//Build up child arrays: episode->scene->item
			var scenes = [];
			var items = [];
			var episode = svc.episodes[epId];

			angular.forEach(svc.events, function (event) {
				if (event.episode_id !== epId) {
					return;
				}
				if (event._type === 'Scene') {
					scenes.push(event);
				} else {
					items.push(event);
				}
			});

			// collect a list of all the speakers/annotators in the episode.
			// Try to merge partially-translated annotator names into the more fully-translated versions.
			// This is imperfect -- a few will slip through if there is a missing translation in the default language -- but good enough for now
			// TODO replace all of this, have the API keep track of each annotator as a real, separate entity
			var annotators = {};
			angular.forEach(items, function (event) {
				if (event._type === 'Annotation' && event.annotator) {
					// This is kind of a mess 
					// Use the default language as the key; merge any other languages into that key
					var defaultLanguage = episode.defaultLanguage || 'en';
					var key = event.annotator[defaultLanguage];

					if (key === undefined) {
						// this annotator doesn't have a translation in the default language, so use its first language instead
						key = event.annotator[Object.keys(event.annotator).sort()[0]];
					}

					if (annotators[key]) {
						// merge other translations of the same name into this one
						annotators[key].name = angular.extend(annotators[key].name, event.annotator);
						if (!annotators[key].annotation_image_id) {
							annotators[key].annotation_image_id = event.annotation_image_id;
						}
					} else {
						annotators[key] = {
							"name": event.annotator,
							"annotation_image_id": event.annotation_image_id
						};
					}

					// construct a description containing all languages, starting with the default
					var langs = Object.keys(annotators[key].name).sort();
					var longKey = annotators[key].name[defaultLanguage] || '(untranslated)';
					for (var i = 0; i < langs.length; i++) {
						if (langs[i] !== defaultLanguage) {
							longKey = longKey + " / " + annotators[key].name[langs[i]];
						}
					}

					annotators[key].key = longKey;

				}
			});
			episode.annotators = annotators;

			// attach array of scenes to the episode.
			// Note these are references to objects in svc.events[]; to change item data, do it in svc.events[] instead of here.
			episode.scenes = scenes.sort(function (a, b) {
				return a.start_time - b.start_time;
			});

			// and a redundant array of child items to the episode for convenience (they're just references, so it's not like we're wasting a lot of space)
			episode.items = items.sort(function (a, b) {
				return a.start_time - b.start_time;
			});

			// ensure scenes are contiguous. Skip the landing scene and the ending scene.
			// Note that this means we explicitly ignore scenes' declared end_time; instead we force it to the next scene's start (or the video end)
			for (var i = 1; i < episode.scenes.length - 1; i++) {
				episode.scenes[i].end_time = episode.scenes[i + 1].start_time;
			}

			// assign items to scenes (give them a scene_id and attach references to the scene's items[]:
			angular.forEach(scenes, function (scene) {
				var sceneItems = [];
				angular.forEach(items, function (event) {

					/* possible cases: 
							start and end are within the scene: put it in this scene
							start is within this scene, end is after this scene: 
								if item start is close to the scene end, change item start to next scene start time. The next loop will assign it to that scene
								if item start is not close to the scene end, change item end to scene end, assign it to this scene.
							start is before this scene, end is within this scene: will have already been fixed by a previous loop
							start is after this scene: let the next loop take care of it
					*/
					if (event.start_time >= scene.start_time && event.start_time < scene.end_time) {
						if (event.end_time <= scene.end_time) {
							// entirely within scene
							svc.events[event._id].scene_id = scene._id;
							sceneItems.push(event);
						} else {
							// end time is in next scene.  Check if start time is close to scene end, if so bump to next scene, otherwise truncate the item to fit in this one
							if (scene.end_time - 0.25 < event.start_time) {
								// bump to next scene
								event.start_time = scene.end_time;
							} else {
								// truncate and add to this one
								event.end_time = scene.end_time;
								sceneItems.push(event);
							}
						}

					}

				});
				// attach array of items to the scene event:
				// Note these items are references to objects in svc.events[]; to change item data, do it in svc.events[] instead of here.
				svc.events[scene._id].items = sceneItems.sort(function (a, b) {
					return a.start_time - b.start_time;
				});
			});

			// Now that we have the structure, calculate event styles (for scenes and items:)
			episode.styleCss = cascadeStyles(episode);
			angular.forEach(svc.events, function (event) {
				if (event.episode_id !== epId) {
					return;
				}
				event.styleCss = cascadeStyles(event);
				if (event.layouts) {
					event.styleCss = event.styleCss + " " + event.layouts.join(' ');
				}
			});
		};

		svc.resolveEpisodeContainers = function (epId) {
			// Constructs the episode's parents[] array, up to its navigation depth plus (skipping the episode container itself)
			// Also sets the episode's nextEpisodeContainer and prevEpisodeContainer

			// all parent containers should have been loaded by the time this is called, so we don't need to worry about asynch at each step
			// console.log("resolveEpisodeContainers", epId);
			var episode = svc.episodes[epId];
			episode.parents = [];
			delete episode.previousEpisodeContainer;
			delete episode.nextEpisodeContainer;
			if (episode.navigation_depth > 0) {
				setParents(Number(episode.navigation_depth) + 1, epId, episode.container_id);
			} else {
				episode.navigation_depth = 0;
			}
		};

		var setParents = function (depth, epId, containerId) {

			// console.log("setParents", depth, epId, containerId);
			var episode = svc.episodes[epId];

			// THis will build up the parents array backwards, starting at the end
			if (depth <= episode.navigation_depth) { // skip the episode container
				episode.parents[depth - 1] = svc.containers[containerId];
			}

			if (depth === episode.navigation_depth) {
				// as long as we're at the sibling level, get the next and previous episodes 
				// (But only within the session: this won't let us find e.g. the previous episode from S4E1; that's TODO)
				for (var i = 0; i < svc.containers[containerId].children.length; i++) {
					var c = svc.containers[containerId].children[i];
					if (c.episodes[0] === epId) {
						if (i > 0) {
							// must embed directly from container cache, do not use an entry in children[] (they don't get derived!)
							episode.previousEpisodeContainer = svc.containers[svc.containers[containerId].children[i - 1]._id];
						}
						if (i < svc.containers[containerId].children.length - 1) {
							episode.nextEpisodeContainer = svc.containers[svc.containers[containerId].children[i + 1]._id];
						}
					}
				}
			}

			// iterate
			if (depth > 1) {
				setParents(depth - 1, epId, svc.containers[containerId].parent_id);
			}
		};

		svc.episode = function (epId) {
			if (!svc.episodes[epId]) {
				console.warn("called modelSvc.episode for a nonexistent ID", epId);
			}
			return svc.episodes[epId];
		};

		// returns all scenes and items for a given episode
		svc.episodeEvents = function (epId) {
			// console.log("modelSvc.episodeEvents");
			var ret = [];
			angular.forEach(svc.events, function (event) {
				if (event.episode_id !== epId) {
					return;
				}
				ret.push(event);
			});
			return ret;
		};

		svc.scene = function (sceneId) {
			// console.log("modelsvc.scene: ", sceneId);
			if (!svc.events[sceneId]) {
				console.warn("called modelSvc.scene for a nonexistent ID", sceneId);
			}
			return svc.events[sceneId];
		};

		// Squish an episode, scene or item's episode styles, scene styles, and styles into a single styleCss string.
		// Styles with these prefixes are the only ones that get passed down to children, and only if there isn't
		// one with the same prefix on the child.
		// typography, color, highlight, timestamp, transition
		var cascadeStyles = function (thing) {
			var styleCategories = { // used to keep track of what categories the thing is already using:
				"typography": false,
				"color": false,
				"highlight": false,
				"timestamp": false,
				"transition": false
			};
			var cssArr = [];

			// start with the thing's own styles

			angular.forEach(thing.styles, function (style) {
				cssArr.push(style); // keep all styles; not just the ones in a styleCategory
				angular.forEach(styleCategories, function (categoryValue, categoryName) {
					if (style.indexOf(categoryName) === 0) {
						styleCategories[categoryName] = style;
					}
				});
			});

			// add each sceneStyle, only if it is in a styleCategory the thing isn't already using
			if (thing.scene_id) {
				var sceneStyles = svc.events[thing.scene_id].styles;
				angular.forEach(sceneStyles, function (style) {
					angular.forEach(styleCategories, function (categoryValue, categoryName) {
						if (!styleCategories[categoryName] && style.indexOf(categoryName) === 0) {
							cssArr.push(style);
							styleCategories[categoryName] = style;
						}
					});
				});
			}

			// add each episodeStyle, only if it is in a styleCategory the thing isn't already using
			if (thing.episode_id) {
				var episodeStyles = svc.episodes[thing.episode_id].styles;
				angular.forEach(episodeStyles, function (style) {
					angular.forEach(styleCategories, function (categoryValue, categoryName) {
						if (!styleCategories[categoryName] && style.indexOf(categoryName) === 0) {
							cssArr.push(style);
						}
					});
				});
			}

			// TEMPORARY: force bg items to transitionFade
			if ((thing._type !== 'Scene') && !thing.isContent && thing.layouts && thing.layouts[0].match(/Bg/)) {
				for (var i = 0; i < cssArr.length; i++) {
					if (cssArr[i].match(/transition/) && cssArr[i] !== 'transitionNone') {
						cssArr[i] = "transitionFade";
					}
				}
			}

			return cssArr.join(' ');
		};

		svc.resolveEpisodeAssets = function (episodeId) {
			// console.log("resolveEpisodeAssets", episodeId);
			angular.forEach(svc.events, function (item) {
				if (item.episode_id !== episodeId) {
					return;
				}
				var assetId = item.asset_id || item.link_image_id || item.annotation_image_id;
				if (!assetId) {
					return;
				}
				if (svc.assets[assetId]) {
					svc.events[item._id].asset = svc.assets[assetId];
				}
			});
			// Do episode's master asset, too
			if (svc.episodes[episodeId]) {
				if (svc.episodes[episodeId].master_asset_id) {
					svc.episodes[episodeId].masterAsset = svc.assets[svc.episodes[episodeId].master_asset_id];
				}
			}
		};

		// TODO: Future episodes should have this as an available scene template instead 
		svc.addLandingScreen = function (episodeId) {
			// console.log("add landing screen", episodeId);
			// create a new scene event for this episode
			svc.events["internal:landingscreen:" + episodeId] = {
				"_id": "internal:landingscreen:" + episodeId,
				"_type": "Scene",
				"_internal": true,
				"templateUrl": "templates/scene/landingscreen.html",
				"episode_id": episodeId,
				"start_time": 0,
				"end_time": 0.001
			};
		};

		// TODO: Future episodes should have this as an available scene template instead 
		svc.addEndingScreen = function (episodeId) {
			if (!svc.episodes[episodeId].masterAsset) {
				return;
			}

			var duration = parseFloat(svc.episodes[episodeId].masterAsset.duration);

			//coerce end of last scene (and its items) to match video duration:
			var lastScene = svc.episodes[episodeId].scenes[svc.episodes[episodeId].scenes.length - 1];
			lastScene.end_time = duration;
			angular.forEach(lastScene.items, function (item) {
				if (item.end_time > duration) {
					item.end_time = duration;
				}
			});

			// create a new scene event for this episode
			svc.events["internal:endingscreen:" + episodeId] = {
				"_id": "internal:endingscreen:" + episodeId,
				"_type": "Scene",
				"_internal": true,
				"templateUrl": "templates/scene/endingscreen.html",
				"episode_id": episodeId,
				"start_time": duration,
				"end_time": duration + 0.1

			};
			svc.events["internal:endingscreen:" + episodeId] = setLang(svc.events["internal:endingscreen:" + episodeId]);
			svc.resolveEpisodeEvents(appState.episodeId);

		};

		var resolveVideo = function (videoAsset) {
			var videoObject = {};
			if (videoAsset.alternate_urls) {
				videoObject.lowRes = {};
				// This will eventually replace the old method below.
				// Sort them out by file extension first, then size
				// TODO we should really be making an array of stream sizes for each type, instead of 'larger' + 'smaller

				var extensionMatch = /\.(\w+)$/;
				for (var i = 0; i < videoAsset.alternate_urls.length; i++) {
					if (videoAsset.alternate_urls[i].match(/youtube/)) {
						videoObject.youtube = embeddableYoutubeUrl(videoAsset.alternate_urls[i]);
					} else {
						var videoAssetObject;
						switch (videoAsset.alternate_urls[i].match(extensionMatch)[1]) {
						case "mp4":
							videoAssetObject = _sortVideoAssets(videoObject.mpeg4, videoAsset.alternate_urls[i]);
							videoObject.mpeg4 = appState.isTouchDevice ? videoAssetObject.smaller : videoAssetObject.larger;
							videoObject.lowRes.mpeg4 = videoAssetObject.smaller;
							break;
						case "m3u8":
							videoAssetObject = _sortVideoAssets(videoObject.m3u8, videoAsset.alternate_urls[i]);
							videoObject.m3u8 = appState.isTouchDevice ? videoAssetObject.smaller : videoAssetObject.larger;
							videoObject.lowRes.m3u8 = videoAssetObject.smaller;
							break;
						case "webm":
							videoAssetObject = _sortVideoAssets(videoObject.webm, videoAsset.alternate_urls[i]);
							videoObject.webm = appState.isTouchDevice ? videoAssetObject.smaller : videoAssetObject.larger;
							videoObject.lowRes.webm = videoAssetObject.smaller;
							break;
						}
					}
				}
				if (videoAsset.you_tube_url) {
					videoObject.youtube = embeddableYoutubeUrl(videoAsset.you_tube_url);
				}
			} else {
				// This is the hacky older version which will be removed once we've got the alternate_urls array in place for all episodes.
				console.warn("No alternate_urls array found; faking it!");
				videoObject = {
					mpeg4: videoAsset.url.replace('.mp4', '.m3u8'),
					webm: videoAsset.url.replace(".mp4", ".webm"),
					youtube: embeddableYoutubeUrl(videoAsset.you_tube_url)
				};
			}

			// HACK some platform detection here.
			var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
			var isNewSafari = /Version\/[891]/.test(navigator.appVersion); // HACKs upon HACKs.  presumably we'll fix this before safari 10 so that 1 will be unnecessary FAMOUS LAST WORDS amirite  (If anyone uses Safari 1 they're on their own)
			var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

			// youtube is still throwing errors in desktop safari (pre Yosemite) and in ipad.  Disable for now.
			// TODO fix this so we can use youtube on these devices
			if (appState.isTouchDevice || (isSafari && !isNewSafari)) {
				videoObject.youtube = undefined;
			}
			if (config.disableYoutube) {
				videoObject.youtube = undefined;
			}

			// Chrome won't allow the same video to play in two windows, which interferes with our 'escape the iframe' button.
			// Therefore we trick Chrome into thinking it is not the same video:

			if (isChrome) {
				var tDelimit;
				var tParam = "t=" + new Date().getTime();
				if (videoObject.mpeg4) {
					tDelimit = videoObject.mpeg4.match(/\?/) ? "&" : "?";
					videoObject.mpeg4 = videoObject.mpeg4 + tDelimit + tParam;
				}
				if (videoObject.webm) {
					tDelimit = videoObject.webm.match(/\?/) ? "&" : "?";
					videoObject.webm = videoObject.webm + tDelimit + tParam;
				}
			}
			// console.log("video asset:", videoObject);
			videoAsset.urls = videoObject;
			return videoAsset;
		};

		var embeddableYoutubeUrl = function (origUrl) {
			// regexp to extract the ID from a youtube
			if (!origUrl) {
				return undefined;
			}
			var getYoutubeID = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
			var ytId = origUrl.match(getYoutubeID)[1];
			return "//www.youtube.com/embed/" + ytId;
		};

		// Private convenience function called only from within resolveMasterAssetVideo. Pass in up to two filenames,
		// returns a sorted object of {larger: , smaller: } based on a WxH portion of the filenames
		var _sortVideoAssets = function (a, b) {
			if (!a && b) {
				return {
					larger: b,
					smaller: null
				};
			}
			if (!b) {
				return {
					larger: a,
					smaller: null
				};
			}
			if (!a && !b) {
				return {
					larger: null,
					smaller: null
				};
			}
			// most video files come from the API with their width and height in the URL as blahblah123x456.foo:
			var regexp = /(\d+)x(\d+)\.\w+$/; // [1]=w, [2]=h
			// There shouldn't ever be cases where we're comparing two non-null filenames, neither of which have a
			// WxH portion, but fill in zero just in case so we can at least continue rather than erroring out 
			var aTest = a.match(regexp) || [0, 0];
			var bTest = b.match(regexp) || [0, 0];

			var smaller = (Math.floor(aTest[1]) > Math.floor(bTest[1])) ? b : a; // return the smaller one
			var larger = (Math.floor(aTest[1]) < Math.floor(bTest[1])) ? b : a; // return the bigger one
			return {
				larger: larger,
				smaller: smaller
			};

		};

		if (config.debugInBrowser) {
			console.log("Event cache:", svc.events);
			console.log("Asset cache:", svc.assets);
			console.log("Container cache:", svc.containers);
			console.log("Episode cache:", svc.episodes);
		}
		return svc;

	});
