'use strict';

angular.module('com.inthetelling.player')
	.factory('modelFactory', function(dataSvc, _) {

		// test if the passed object is a 24-bit uid
		var isUid = function(test) {
			if (_.isString(test) && test.match(/^[0-9a-fA-F]{24}$/)) {
				return true;
			}
			return false;
		};

		// Takes a template id, looks it up, and returns the template url
		// Will return (reflect) the passed property if not a valid id
		var resolveTemplateUrl = function(templateId) {
			if (isUid(templateId)) {
				var template = dataSvc.getTemplateById(templateId);
				if (template) {
					return template.url;
				} else {
					console.error("Template lookup failed for:", templateId);
				}
			}
			return templateId;
		};

		// Takes an array of layout ids, looks them all up, and returns a concatenated css string
		// Will return (reflect) the passed property if not a valid id
		var resolveLayoutCSS = function(layoutIds) {
			if (_.isArray(layoutIds)) {
				var i, layout, layoutCSS = "";
				for (i = 0; i < layoutIds.length; i++) {
					layout = dataSvc.getLayoutById(layoutIds[i]);
					if (layout) {
						if (layoutCSS.length) {
							layoutCSS += " ";
						}
						layoutCSS += layout.css_name;
					} else {
						console.error("Layout lookup failed for:", layoutIds[i]);
					}
				}
				return layoutCSS;
			}
			return layoutIds;
		};

		// Takes an array of styles ids, looks them all up, and returns a concatenated css string
		// Will return (reflect) the passed property if not a valid id
		var resolveStyleCSS = function(styleIds) {
			if (_.isArray(styleIds)) {
				var i, style, styleCSS = "";
				for (i = 0; i < styleIds.length; i++) {
					style = dataSvc.getStyleById(styleIds[i]);
					if (style) {
						if (styleCSS.length) {
							styleCSS += " ";
						}
						styleCSS += style.css_name;
					} else {
						console.error("Style lookup failed for:", styleIds[i]);
					}
				}
				return styleCSS;
			}
			return styleIds;
		};

		// Takes an id for a master asset (video), looks it up, and returns a video definition object
		// Will return (reflect) the passed property if not a valid id
		var resolveMasterAssetVideo = function(masterAssetId) {
			if (isUid(masterAssetId)) {
				var masterAsset = dataSvc.getAssetById(masterAssetId);
				if (masterAsset) {
					var videoObject = {};
					if (masterAsset.alternate_urls) {
						// This will eventually replace the old method below.
						// Sort them out by file extension first, then use _chooseBiggestMasterAsset to keep the largest one of each type.
						var extensionMatch = /\.(\w+)$/;
						for (var i = 0; i < masterAsset.alternate_urls.length; i++) {
							if (masterAsset.alternate_urls[i].match(/youtube/)) {
								videoObject.youtube = masterAsset.alternate_urls[i];
							} else {
								switch (masterAsset.alternate_urls[i].match(extensionMatch)[1]) {
									case "mp4":
										videoObject.mpeg4 = _chooseBiggestMasterAsset(videoObject.mpeg4, masterAsset.alternate_urls[i]);
										break;
									case "m3u8":
										videoObject.m3u8 = _chooseBiggestMasterAsset(videoObject.m3u8, masterAsset.alternate_urls[i]);
										break;
									case "webm":
										videoObject.webm = _chooseBiggestMasterAsset(videoObject.webm, masterAsset.alternate_urls[i]);
										break;
								}
							}
						}
						if (masterAsset.you_tube_url) {
							videoObject.youtube = masterAsset.you_tube_url;
						}

					} else {
						// This is the hacky older version which will be removed once we've got the alternate_urls array in place for all episodes.
						videoObject = {
							mpeg4: masterAsset.url.replace('.mp4', '.m3u8'),
							webm: masterAsset.url.replace(".mp4", ".webm"),
							youtube: masterAsset.you_tube_url
						};
					}

					// HACK some platform detection here.
					var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);

					// Safari should prefer m3u8 to mpeg4.  TODO add other browsers to this when they support m3u8
					if (isSafari && videoObject.m3u8) {
						videoObject.mpeg4 = videoObject.m3u8;
					}

					// Old iPads don't cope well with the youtube plugin, so we divert them to the mp4 version instead. If there is one.
					// For now do this for all Safari, to avoid the "power-saver plugin" issue
					if ((isSafari || navigator.platform.indexOf('iPad') > -1) && videoObject.mpeg4) {
						videoObject.youtube = undefined;
					}

					videoObject.duration = masterAsset.duration;
					return videoObject;
				} else {
					console.error("Master Asset lookup failed for:", masterAssetId);
				}
			}
			return masterAssetId;
		};

		// Private convenience function called only from within resolveMasterAssetVideo. Pass in two filenames.
		// If one is empty, return the other; otherwise checks for a WxH portion in two
		// filenames; returns whichever is bigger.  
		var _chooseBiggestMasterAsset = function(a, b) {
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

		// Takes an id for an asset, looks it up, and returns the asset url
		// Will return (reflect) the passed property if not a valid id
		var resolveAssetUrl = function(assetId) {
			if (isUid(assetId)) {
				var asset = dataSvc.getAssetById(assetId);
				if (asset) {
					return asset.url.replace(/ /g, "%20"); // TODO do we need to do more url escaping here?  encodeURIComponent() is too aggressive, escapes / and : which we don't want
				} else {
					console.error("Asset lookup failed for:", assetId);
				}
			}
			return assetId.replace(/ /g, "%20"); // TODO as above (this is used in  local data)
		};

		// Takes an id for an asset, looks it up, and returns the mime type
		// Will return (reflect) the passed property if not a valid id
		var resolveAssetMimeType = function(assetId) {
			if (isUid(assetId)) {
				var asset = dataSvc.getAssetById(assetId);
				if (asset) {
					return asset._type;
				} else {
					console.error("Asset lookup failed for:", assetId);
				}
			}
			return assetId;
		};

		var svc = {};

		// TODO: This is ugly. Need to work on local data, and also no need to transform property names anymore... Now that data contract is consistent we can reference the data objects directly, for better future-compatibility of full-crud.

		svc.createEpisodeModel = function(data) {
			var model = {};

			model.title = data.title;
			model.description = data.description;
			model.category = "Fnord"; // TODO: Implement categories.  Hey I can't see this. How strange.
			model.templateUrl = resolveTemplateUrl(data.template_id) || "templates/episode-default.html";
			model.coverUrl = "/images/coverlogo.png"; // TODO: Implement cover
			if (model.templateUrl === 'templates/episode-gw.html') { // HACK
				model.coverUrl = "/images/aspectratiopreserver-16x9.gif";
			}
			model.layout = resolveLayoutCSS(data.layout_id) || "";
			model.styles = resolveStyleCSS(data.style_id) || "";
			model.videos = resolveMasterAssetVideo(data.master_asset_id);
			model._id = data._id;
			return model;
		};

		svc.createSceneModel = function(data) {
			var model = {};

			model.type = data.type;
			model.title = data.title;
			if (!model.title) {
				model.nonNavigable = true;
			} // HACK
			model.description = data.description;
			model.startTime = data.start_time;
			model.endTime = data.end_time;
			model.templateUrl = resolveTemplateUrl(data.template_id) || "templates/scene-1col.html";
			model.layout = resolveLayoutCSS(data.layout_id) || "";
			model.styles = resolveStyleCSS(data.style_id) || "";
			model.displayTime = Math.floor(data.start_time / 60) + ":" + ("0" + Math.floor(data.start_time) % 60).slice(-2);
			model.isActive = false;
			model.wasActive = false;
			model.items = [];

			if (model.layout.match(/splitOptional/)) {
				model.mainPaneContents = 'transcript+required';
				model.altPaneContents = 'optional';
			} else if (model.layout.match(/splitRequired/)) {
				model.mainPaneContents = 'transcript+optional';
				model.altPaneContents = 'required';
			} else {
				// Default:
				model.mainPaneContents = 'transcript';
				model.altPaneContents = 'transmedia';
			}
			if (model.layout.match(/showCurrent/)) {
				model.showCurrent = true;
			}
			model._id = data._id;
			return model;
		};

		svc.createItemModel = function(data) {
			var model = {};

			// base model
			model.type = data.type;
			//model.category = data.category; //TODO: Implement dynamic categories
			model.startTime = data.start_time;
			model.endTime = data.end_time;
			model.layout = resolveLayoutCSS(data.layout_id) || "inline";
			model.styles = resolveStyleCSS(data.style_id) || "";
			model.required = data.required || false;
			model.cosmetic = data.cosmetic || false;
			model.stop = data.stop || false;
			model.displayTime = Math.floor(data.start_time / 60) + ":" + ("0" + Math.floor(data.start_time) % 60).slice(-2);

			// Precalculate whether the item will be inline in a content pane or an overlay/underlay.
			// NOTE/TODO: in producer need to recalculate this if item layout changes!
			if (model.layout === 'inline' || model.layout.match(/sidebar/) || model.layout.match(/burst/)) {
				model.inContentPane = true;
			}

			// extend base model based on item type
			switch (data.type) {
				case "annotation":
					model.templateUrl = resolveTemplateUrl(data.template_id) || "templates/transcript-default.html";
					model.authorName = data.annotator;
					model.authorThumbSrc = resolveAssetUrl(data.annotation_image_id);
					model.annotation = data.annotation;
					break;

				case "link":
					model.templateUrl = resolveTemplateUrl(data.template_id) || "templates/transmedia-link-default.html";
					model.itemDetailTemplateUrl = "templates/modal-link-default.html"; // hardcoded for now, not sure if we'll want to allow variations here
					model.category = "links"; // TODO: Hardcoded for now. This can go once we implement dynamic categories in the base model construction.
					model.title = data.title;
					model.description = data.description;
					model.thumbSrc = resolveAssetUrl(data.link_image_id);

					// Force wmode=transparent onto youtube embed links, so IE doesn't look so ugly.
					// TODO this should be handled in producer instead of here
					if (data.url.indexOf('youtube.com/embed/') > -1) {
						if (data.url.indexOf('?') === -1) {
							model.source = data.url + "?wmode=transparent";
						} else {
							// remove existing wmode if present first.
							model.source = (data.url.replace(/wmode=[^&]*&?/g, '') + "&wmode=transparent").replace(/&+/g, '&');
						}
					} else {
						model.source = data.url;
					}
					break;

				case "upload":
					var mimeType = data.mimeType || resolveAssetMimeType(data.asset_id); // TODO: data.mimeType will only be truthy in local data. Hopefully this hack can go away with better handling of subtyping. See TODO below.
					if (mimeType && mimeType.match(/image/)) {
						model.type = "image"; // TODO: Temporary/ugly hack. We could handle subtyping better by creating a subtype or mimetype property and keying off that in the views, instead of changing the actual type on the model, because this is not CRUD friendly.
					}
					model.templateUrl = resolveTemplateUrl(data.template_id) || "templates/transmedia-image-default.html";

					// special case to cope with some existing episodes:
					if (!model.inContentPane && model.templateUrl === "templates/transmedia-image-plain.html") {
						model.templateUrl = "templates/transmedia-image-fill.html";
					}

					model.itemDetailTemplateUrl = "templates/modal-image-default.html"; // hardcoded for now, not sure if we'll want to allow variations here
					model.title = data.title;
					model.description = data.description;
					model.source = resolveAssetUrl(data.asset_id);
					break;
			}
			model._id = data._id;

			// sanity check. Should catch this in authoring, but just in case, as this causes a crashing memory leak in iOS:
			if (model.templateUrl.indexOf('transmedia-image') > -1 && model.source && model.source.match(/\.[mp4|mpeg4|webm|m3u8]$/i)) {
				console.error("Somebody put a video in an image template... blanking it out");
				model.source = "";
			}

			// Precalculate templates for explore mode
			model.exploreTemplateUrl = model.templateUrl;
			if (model.type === 'annotation') {
				if (model.templateUrl.indexOf("templates/text-") === -1) {
					model.exploreTemplateUrl = "templates/transcript-default.html";
					model.watchTemplateUrl = "templates/transcript-closedcaption.html";
				}
			} else if (model.type === "upload" || model.type === "image") {
				model.exploreTemplateUrl = "templates/transmedia-image-default.html";
			} else if (model.type === "link") {
				if (model.templateUrl !== "templates/transmedia-link-noembed.html" &&
					model.templateUrl !== "templates/transmedia-link-frameicide.html") {
					model.exploreTemplateUrl = "templates/transmedia-link-default.html";
				}
			}

			//transmedia-image-fill needs some particular handling for different styles; contain, conver, center or fill 
			// need to be done as background images (so we can use the corresponding css to control the image size), all
			// others need to be done as regular images (so we can prevent clipping by setting max-width and max-height instead.)
			// TODO: styles and layouts should've been left as arrays all along
			if (model.templateUrl.indexOf('transmedia-image-fill') > -1) {
				var stylesArr = model.styles.split(/ /);
				for (var i = 0; i < stylesArr.length; i++) {
					if (stylesArr[i] === "center" || stylesArr[i] === "contain" || stylesArr[i] === "cover" || stylesArr[i] === "fill") {
						model.asBackgroundImage = true;
					}
				}
			}

			// Prebuild CSS class list.
			var cssPrebuild = [];
			if (model.stop) {
				cssPrebuild.push("isStop");
			}
			if (model.required) {
				cssPrebuild.push("isRequired");
			}
			if (model.cosmetic) {
				cssPrebuild.push("isCosmetic");
			}
			model.essentialCSS = cssPrebuild.join(" ");
			if (model.layout) {
				cssPrebuild.push(model.layout);
			}
			if (model.styles) {
				cssPrebuild.push(model.styles);
			}
			model.styleCSS = cssPrebuild.join(" ");



			return model;
		};

		return svc;
	});
