'use strict';

/* Parses API data into player-acceptable format, 
and derives secondary data where necessary for performance/convenience/fun */

angular.module('com.inthetelling.story')
	.factory('modelSvc', function ($interval, $filter, config, appState, errorSvc) {

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
			"templates/upload-demo.html": "templates/item/debug.html"
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
			// FOR TESTING
			if (episode.languages) {
				// episode.languages.push("es");
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
			return setLang(container);
		};

		svc.deriveEvent = function (event) {

			event = setLang(event);

			if (event._type !== 'Scene') {
				if (!event.templateUrl) {
					// TODO add support for other plugin types here, or have a single plugin template that routes to subdirectives based on plugin type
					event.templateUrl = 'templates/item/usc-badges.html';
				}

				if (svc.episodes[event.episode_id] && svc.episodes[event.episode_id].templateUrl === 'templates/episode/usc.html') {
					// HACKS AHOY
					// USC made a bunch of change requests post-release; this was the most expedient way
					// to deal with them. Sorry!
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

				// TODO: if we could trust authors to choose 'cosmetic' for cosmetic items, or if we set it in producer based on the item layout
				// (HEY THERES AN IDEA) we wouldn't need to do this:
				if (!event.cosmetic && (event.isContent || event.layouts.indexOf('windowFg') > -1)) {
					event.showInReviewMode = true;
				}

				// Old templates which (TODO) should have been database fields instead:
				if (event._type === 'Annotation' && event.templateUrl.match(/transcript/)) {
					event.isTranscript = true;
				}
				if (event.templateUrl.match(/noembed/)) {
					event.noEmbed = true;
				}

				if (event._type === "Link" && event.url.match(/^http:\/\//)) {
					console.warn("Can't embed http:// link type:", event.url);
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
				event.origTemplateUrl = event.templateUrl; // TEMPORARY
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
				// console.error("Couldn't match event templateUrl: ", event.templateUrl);
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

		NOTE: this currently calls cascadeStyles on episodes and events as a side effect.  
		deriveEvent() and deriveEpisode() would be a theoretically more consistent place for that, but 
		cascadeStyles depends on the episode structure we're building here, so it feels dangerous to separate them.


		TODO this needs to ensure that scenes are contiguous and that items don't overlap scenes
		(there are authoring issues in existing episodes where items start a fraction of a second before their intended scene does)
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
			// attach array of scenes to the episode.
			// Note these are references to objects in svc.events[]; to change item data, do it in svc.events[] instead of here.
			episode.scenes = scenes.sort(function (a, b) {
				return a.start_time - b.start_time;
			});

			// and a redundant array of child items to the episode for convenience (they're just references, so it's not like we're wasting a lot of space)
			episode.items = items.sort(function (a, b) {
				return a.start_time - b.start_time;
			});

			// ensure scenes are contigouous. Skip the landing scene and the last scene:
			for (var i = 1; i < episode.scenes.length - 2; i++) {
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
				} else {
					errorSvc.error({
						data: "This episode has no master_asset_id (authoring error?)"
					});
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
			svc.resolveEpisodeEvents(appState.episodeId);

		};

		var resolveVideo = function (videoAsset) {
			var videoObject = {};
			if (videoAsset.alternate_urls) {
				// This will eventually replace the old method below.
				// Sort them out by file extension first, then use _chooseVideoAsset to keep one of each type.

				var extensionMatch = /\.(\w+)$/;
				for (var i = 0; i < videoAsset.alternate_urls.length; i++) {
					if (videoAsset.alternate_urls[i].match(/youtube/)) {
						videoObject.youtube = embeddableYoutubeUrl(videoAsset.alternate_urls[i]);
					} else {
						switch (videoAsset.alternate_urls[i].match(extensionMatch)[1]) {
						case "mp4":
							videoObject.mpeg4 = _chooseVideoAsset(videoObject.mpeg4, videoAsset.alternate_urls[i]);
							break;
						case "m3u8":
							videoObject.m3u8 = _chooseVideoAsset(videoObject.m3u8, videoAsset.alternate_urls[i]);
							break;
						case "webm":
							videoObject.webm = _chooseVideoAsset(videoObject.webm, videoAsset.alternate_urls[i]);
							break;
						}
					}
				}
				if (videoAsset.you_tube_url) {
					videoObject.youtube = embeddableYoutubeUrl(videoAsset.you_tube_url);
				}
			} else {
				// This is the hacky older version which will be removed once we've got the alternate_urls array in place for all episodes.
				videoObject = {
					mpeg4: videoAsset.url.replace('.mp4', '.m3u8'),
					webm: videoAsset.url.replace(".mp4", ".webm"),
					youtube: embeddableYoutubeUrl(videoAsset.you_tube_url)
				};
			}

			// HACK some platform detection here.
			var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
			var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

			// Safari should prefer m3u8 to mpeg4.  TODO add other browsers to this when they support m3u8
			// TODO BUG: disabling this for now; m3u8 is causing problems
			// if (isSafari && videoObject.m3u8) {
			// 	videoObject.mpeg4 = videoObject.m3u8;
			// }
			// delete videoObject.m3u8;

			// youtube is still throwing errors in desktop safari and in ipad.  Disable for now
			// TODO fix this so we can use youtube on these devices
			if (appState.isTouchDevice || isSafari) {
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

		// Private convenience function called only from within resolveMasterAssetVideo. Pass in two filenames.
		// If one is empty, return the other; otherwise checks for a WxH portion in two
		// filenames; returns whichever is bigger (on desktop) or smaller (on mobile).

		var _chooseVideoAsset = function (a, b) {
			if (!a && b) {
				return b;
			}
			if (!b) {
				return a;
			}
			if (!a && !b) {
				return "";
			}
			// most video files come from the API with their width and height in the URL as blahblah123x456.foo:
			var regexp = /(\d+)x(\d+)\.\w+$/; // [1]=w, [2]=h
			// There shouldn't ever be cases where we're comparing two non-null filenames, neither of which have a
			// WxH portion, but fill in zero just in case so we can at least continue rather than erroring out 
			var aTest = a.match(regexp) || [0, 0];
			var bTest = b.match(regexp) || [0, 0];

			// assume touchscreen means mobile, so we want the smaller video. TODO be less arbitrary about that
			if (appState.isTouchDevice) {
				return (Math.floor(aTest[1]) > Math.floor(bTest[1])) ? b : a; // return the smaller one
			} else {
				return (Math.floor(aTest[1]) < Math.floor(bTest[1])) ? b : a; // return the bigger one
			}
		};

		if (config.debugInBrowser) {
			console.log("Event cache:", svc.events);
			console.log("Asset cache:", svc.assets);
			console.log("Container cache:", svc.containers);
			console.log("Episode cache:", svc.episodes);
		}
		return svc;

	});
