'use strict';

/* TODO API CHANGES 


TODO: separate appState from modelSvc, just for tidiness sake?

*/

angular.module('com.inthetelling.player')
	.factory('modelSvc', function($interval, $filter) {

		var svc = {};

		/* global application state: */

		/* jshint -W116 */
		// Simplify inter-controller communicatio thusly:
		svc.appState = {
			user: {}, // whatever authSvc gets back from getAccessToken
			episodeId: false, // ID of current episode
			isFramed: (window.parent != window), // are we inside an iframe?  Don't use !== because IE8 gets it wrong
			isIDevice: (navigator.platform.indexOf('iPad') > -1 || navigator.platform.indexOf('iPhone') > -1 || navigator.platform.indexOf('iPod') > -1),
			isTouchDevice: ('ontouchstart' in window || 'onmsgesturechange' in window),
			windowWidth: 0,
			windowHeight: 0,
			viewMode: 'discover', // default
			time: 0, // current playhead position (in seconds) relative to timeline NOT TO EPISODE!
			timeMultiplier: 1, // sets player speed (0.5 = half speed, 2=double,etc)
			duration: 0, // duration of timeline (in seconds)
			timelineState: 'paused', // "playing" or "paused" (set by timelineSvc). Future: "locked" (by stop question or etc)
			hasBeenPlayed: false, // set to true after first time the video plays (used so we can interrupt that first play with a helpful help)
			volume: 100, // Audio for main video
			muted: false, // audio for main video
			hideCaptions: false, // visibility of "closed captions" in watch mode
			videoControlsActive: false, // Whether bottom toolbar is visible. MUST START FALSE
			show: {
				searchPanel: false,
				helpPanel: false,
				navPanel: false
			},
			itemDetail: false, // Put item data here to show it as a modal overlay
			editing: false, // Object currently being edited by user (TODO)
			blerg: 'fnord' // Can't see this
		};
		/* jshint +W116 */

		// workaround for iOS crasher (can't bind to window.resize when inside an iframe)
		$interval(function() {
			svc.appState.windowHeight = angular.element(window).height();
			svc.appState.windowWidth = angular.element(window).width();
		}, 50, 0, false);

		// another iOS workaround:
		if (svc.appState.isIDevice) {
			document.getElementById('CONTAINER').className = "iDevice";
		}


		/* episode data parsing */

		svc.episodes = {};
		svc.assets = {};
		svc.events = {}; // svc.events contains scenes and items.
		svc.containers = {};

		// receives cacheTypes of episode, event, asset, and container.
		// splits event into scenes and items.  Not sure yet whether we care about containers, discarding them for now.

		// TODO? normalize items before cacheing: (annotation_image_id, link_image_id -> asset_id, etc)
		// TODO discard unused fields

		// use angular.extend if an object already exists, so we don't lose existing bindings
		svc.cache = function(cacheType, item) {
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
					angular.extend(svc.containers[item._id], angular.copy(item));
				} else {
					svc.containers[item._id] = angular.copy(item);
				}
			}
		};

		// svc.deriveFoo() are for efficiency precalculations. 
		// Input API data, output API data plus clientside-only convenience variables.
		// Should call this after making any changes to the underlying data.

		svc.deriveEpisode = function(episode) {
			// console.log("deriveEpisode:", episode);
			return episode;
		};
		svc.deriveAsset = function(asset) {
			// console.log("deriveAsset:", asset);
			if (asset._type === "Asset::Video") {
				asset = resolveVideo(asset);
			}
			return asset;
		};

		// update template paths from v1.  This is temporary until I have the set of new templates nailed down
		// and have figured out which can be merged or etc; then we can update the values in the database
		var updateTemplates = {
			"templates/episode-default.html": "templates/episode/episode.html",
			"templates/episode-eliterate.html": "templates/episode/episode.html", // TODO
			"templates/episode-ewb.html": "templates/episode/episode.html", // TODO
			"templates/episode-gw.html": "templates/episode/episode.html", // TODO
			"templates/episode-tellingstory.html": "templates/episode/episode.html", //TODO

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
			"templates/transmedia-caption.html": "templates/item/upload-caption.html",
			"templates/transmedia-image-default.html": "templates/item/upload.html",
			"templates/transmedia-slidingcaption.html": "templates/item/upload-caption-sliding.html",
			"templates/transmedia-image-fill.html": "templates/item/image-fill.html",
			"templates/transmedia-image-plain.html": "templates/item/image-plain.html",
			"templates/transmedia-linkonly.html": "templates/item/upload-linkonly.html",
			"templates/transmedia-thumbnail.html": "templates/item/upload-thumbnail.html",

			//link
			"templates/transmedia-link-default.html": "templates/item/link.html",
			"templates/transmedia-link-embed.html": "templates/item/link.html", // TODO
			"templates/transmedia-link-frameicide.html": "templates/item/link.html", // TODO
			"templates/transmedia-link-icon.html": "templates/item/link.html", // TODO
			"templates/transmedia-link-noembed.html": "templates/item/link.html", // TODO
			"templates/transmedia-link-youtube.html": "templates/item/link.html", // TODO
			"templates/transmedia-embed-youtube.html": "templates/item/link.html", // TODO

			// (from old sxs demo; can delete later)
			"templates/upload-demo-inline.html": "templates/item/item.html", // TODO
			"templates/upload-demo.html": "templates/item/item.html", // TODO

		};

		svc.deriveEvent = function(event) {
			if (event._type !== 'Scene') {
				//items

				// determine whether the item is in a regular content pane.
				// items only have one layout (scenes may have more than one...)
				if (event.layouts) {
					event.layoutCss = event.layouts[0];
					if (event.layouts[0] === 'inline' || event.layouts[0].match(/sidebar/) || event.layouts[0].match(/burst/)) {
						event.isContent = true;
					}
				} else {
					// default is content
					event.isContent = true;
				}

				// Transcript (TODO: don't depend on templateUrl to identify these!)
				if (event._type === 'Annotation' && event.templateUrl.match(/transcript/)) {
					event.isTranscript = true;
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

		/*  Any changes to any scene or item data must call svc.resolveEpisodeEvents afterwards. It sets:
				- episode.scenes
				- episode.items
				- scene.items
				- item.scene_id

		NOTE: this currently calls cascadeStyles on episodes and events as a side effect.  
		deriveEvent() and deriveEpisode() would be a theoretically more consistent place for that, but 
		cascadeStyles depends on the episode structure we're building here, so it feels dangerous to separate them:
		*/
		svc.resolveEpisodeEvents = function(epId) {
			// console.log("resolveEpisodeEvents");
			//Build up child arrays: episode->scene->item
			var scenes = [];
			var items = [];
			angular.forEach(svc.events, function(event) {
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
			svc.episodes[epId].scenes = scenes.sort(function(a, b) {
				return a.start_time - b.start_time;
			});
			// and a redundant array of child items to the episode for convenience (they're just references, so it's not like we're wasting a lot of space)
			svc.episodes[epId].items = items.sort(function(a, b) {
				return a.start_time - b.start_time;
			});

			// give items their scene_id:
			angular.forEach(scenes, function(scene) {
				// for each item, if start time is between scene start and end, give it its sceneId

				var sceneItems = [];
				angular.forEach(items, function(event) {
					if (event.start_time >= scene.start_time && event.start_time < scene.end_time) {
						svc.events[event._id].scene_id = scene._id;
						sceneItems.push(event);
					}
				});
				// attach array of items to the scene event:
				// Note these items are references to objects in svc.events[]; to change item data, do it in svc.events[] instead of here.
				svc.events[scene._id].items = sceneItems.sort(function(a, b) {
					return a.start_time - b.start_time;
				});
			});

			// Now that we have the structure, calculate event styles (for scenes and items:)
			svc.episodes[epId].styleCss = cascadeStyles(svc.episodes[epId]);
			angular.forEach(svc.events, function(event) {
				if (event.episode_id !== epId) {
					return;
				}
				event.styleCss = cascadeStyles(event);
				if (event.layouts) {
					event.styleCss = event.styleCss + " " + event.layouts.join(' ');
				}
			});
		};

		svc.episode = function(epId) {
			if (!svc.episodes[epId]) {
				console.error("called modelSvc.episode for a nonexistent ID", epId);
			}
			return svc.episodes[epId];
		};

		// returns all scenes and items for a given episode
		svc.episodeEvents = function(epId) {
			// console.log("modelSvc.episodeEvents");
			var ret = [];
			angular.forEach(svc.events, function(event) {
				if (event.episode_id !== epId) {
					return;
				}
				ret.push(event);
			});
			return ret;
		};

		svc.scene = function(sceneId) {
			//			console.log("modelsvc.scene: ",sceneId);
			if (!svc.events[sceneId]) {
				console.error("called modelSvc.scene for a nonexistent ID", sceneId);
			}
			return svc.events[sceneId];
		};

		// Squish an episode, scene or item's episode styles, scene styles, and styles into a single styleCss string.
		// Styles with these prefixes are the only ones that get passed down to children, and only if there isn't
		// one with the same prefix on the child.
		// typography, color, highlight, timestamp, transition
		var cascadeStyles = function(thing) {
			var styleCategories = { // used to keep track of what categories the thing is already using:
				"typography": false,
				"color": false,
				"highlight": false,
				"timestamp": false,
				"transition": false
			};
			var cssArr = [];

			// start with the thing's own styles
			angular.forEach(thing.styles, function(style) {
				cssArr.push(style); // keep all styles; not just the ones in a styleCategory
				angular.forEach(styleCategories, function(categoryValue, categoryName) {
					if (style.indexOf(categoryName) === 0) {
						styleCategories[categoryName] = style;
					}
				});
			});

			// add each sceneStyle, only if it is in a styleCategory the thing isn't already using
			if (thing.scene_id) {
				var sceneStyles = svc.events[thing.scene_id].styles;
				angular.forEach(sceneStyles, function(style) {
					angular.forEach(styleCategories, function(categoryValue, categoryName) {
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
				angular.forEach(episodeStyles, function(style) {
					angular.forEach(styleCategories, function(categoryValue, categoryName) {
						if (!styleCategories[categoryName] && style.indexOf(categoryName) === 0) {
							cssArr.push(style);
						}
					});
				});
			}


			return cssArr.join(' ');
		};

		svc.resolveEpisodeAssets = function(episodeId) {
			// console.log("resolveEpisodeAssets", episodeId);
			angular.forEach(svc.events, function(item) {
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
			svc.episodes[episodeId].masterAsset = svc.assets[svc.episodes[episodeId].master_asset_id];
		};

		// TODO: remove this, handle it as part of the player template instead
		svc.addLandingScreen = function(episodeId) {
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

		var resolveVideo = function(videoAsset) {
			var videoObject = {};
			if (videoAsset.alternate_urls) {
				// This will eventually replace the old method below.
				// Sort them out by file extension first, then use _chooseBiggestVideoAsset to keep the largest one of each type.
				// TODO: don't always select the biggest; choose based on screen size

				var extensionMatch = /\.(\w+)$/;
				for (var i = 0; i < videoAsset.alternate_urls.length; i++) {
					if (videoAsset.alternate_urls[i].match(/youtube/)) {

						videoObject.youtube = videoAsset.alternate_urls[i];
					} else {
						switch (videoAsset.alternate_urls[i].match(extensionMatch)[1]) {
							case "mp4":
								videoObject.mpeg4 = _chooseBiggestVideoAsset(videoObject.mpeg4, videoAsset.alternate_urls[i]);
								break;
							case "m3u8":
								videoObject.m3u8 = _chooseBiggestVideoAsset(videoObject.m3u8, videoAsset.alternate_urls[i]);
								break;
							case "webm":
								videoObject.webm = _chooseBiggestVideoAsset(videoObject.webm, videoAsset.alternate_urls[i]);
								break;
						}
					}
				}
				if (videoAsset.you_tube_url) {
					videoObject.youtube = videoAsset.you_tube_url;
				}
			} else {
				// This is the hacky older version which will be removed once we've got the alternate_urls array in place for all episodes.
				videoObject = {
					mpeg4: videoAsset.url.replace('.mp4', '.m3u8'),
					webm: videoAsset.url.replace(".mp4", ".webm"),
					youtube: videoAsset.you_tube_url
				};
			}

			// HACK some platform detection here.
			var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
			// Safari should prefer m3u8 to mpeg4.  TODO add other browsers to this when they support m3u8

			// BUG: disabling this; m3u8 is causing problems in safari.
			/*
			if (isSafari && videoObject.m3u8) {
				videoObject.mpeg4 = videoObject.m3u8;
			}
			delete videoObject.m3u8;
*/

			// WARN if you're seeing mixed-protocol errors in Safari:  youtube API is always on https.
			// Fortunately, so are our episodes.  But if loading an episode from http, like, say, my dev environment,
			// it breaks (in safari only).   Work around this by not using YT in safari during dev only
			// if ((isSafari || navigator.platform.indexOf('iPad') > -1) && videoObject.mpeg4) {
			// 	videoObject.youtube = undefined;
			// }

			videoObject.youtube = videoObject.youtube.replace(/https?:\/\//, "//");


			// TEMPORARILY DISABLING YOUTUBE
			//videoObject.youtube = undefined;

			videoAsset.video = videoObject;
			console.log("VIDEOASSET IS", videoAsset.video);
			return videoAsset;
		};

		// Private convenience function called only from within resolveMasterAssetVideo. Pass in two filenames.
		// If one is empty, return the other; otherwise checks for a WxH portion in two
		// filenames; returns whichever is bigger.  
		var _chooseBiggestVideoAsset = function(a, b) {
			if (!a && b) {
				return b;
			}
			if (!b) {
				return a;
			}
			if (!a && !b) {
				return "";
			}
			var regexp = /(\d+)x(\d+)\.\w+$/; // [1]=w, [2]=h
			// There shouldn't ever be cases where we're comparing two non-null filenames, neither of which have a
			// WxH portion, but fill in zero just in case so we can at least continue rather than erroring out 
			var aTest = a.match(regexp) || [0, 0];
			var bTest = b.match(regexp) || [0, 0];
			return (Math.floor(aTest[1]) < Math.floor(bTest[1])) ? b : a;
		};

		console.log("EVENTCACHE:", svc.events);
		console.log("EPISODECACHE:", svc.episodes);
		console.log("APPSTATE:", svc.appState);

		return svc;

	});
