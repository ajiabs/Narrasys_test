'use strict';

angular.module('com.inthetelling.player')
	.factory('modelFactory', function (dataSvc, _) {

		// test if the passed object is a 24-bit uid
		var isUid = function (test) {
			if (_.isString(test) && test.match(/^[0-9a-fA-F]{24}$/)) {
				return true;
			}
			return false;
		};

		// Takes a template id, looks it up, and returns the template url
		// Will return (reflect) the passed property if not a valid id
		var resolveTemplateUrl = function (templateId) {
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
		var resolveLayoutCSS = function (layoutIds) {
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
		var resolveStyleCSS = function (styleIds) {
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
		var resolveMasterAssetVideo = function (masterAssetId) {
			if (isUid(masterAssetId)) {
				var masterAsset = dataSvc.getAssetById(masterAssetId);
				if (masterAsset) {
					// TODO The webm regexp is a bit of a hack, since current API only has one asset url

					var videoObject = {
						mpeg4: masterAsset.url,
						webm: masterAsset.url.replace(".mp4", ".webm"),
						youtube: masterAsset.you_tube_url
					};
					// HACK some platform detection here.  Old iPads don't cope well with the youtube plugin,
					// so we divert them to the mp4 version instead. If there is one.
					if ((navigator.platform.indexOf('iPad') > -1) && window.devicePixelRatio < 2 &&videoObject.mpeg4) {
						videoObject.youtube = undefined;
					}
					return videoObject;
				} else {
					console.error("Master Asset lookup failed for:", masterAssetId);
				}
			}
			return masterAssetId;
		};

		// Takes an id for an asset, looks it up, and returns the asset url
		// Will return (reflect) the passed property if not a valid id
		var resolveAssetUrl = function (assetId) {
			if (isUid(assetId)) {
				var asset = dataSvc.getAssetById(assetId);
				if (asset) {
					return asset.url;
				} else {
					console.error("Asset lookup failed for:", assetId);
				}
			}
			return assetId;
		};

		// Takes an id for an asset, looks it up, and returns the mime type
		// Will return (reflect) the passed property if not a valid id
		var resolveAssetMimeType = function (assetId) {
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

		svc.createEpisodeModel = function (data) {
			var model = {};

			model.title = data.title;
			model.description = data.description;
			model.category = "Fnord"; // TODO: Implement categories.  Hey I can't see this. How strange.
			model.coverUrl = "/images/coverlogo.png"; // TODO: Implement cover
			model.templateUrl = resolveTemplateUrl(data.template_id) || "templates/episode-default.html";
			model.layout = resolveLayoutCSS(data.layout_id) || "";
			model.styles = resolveStyleCSS(data.style_id) || "";
			model.videos = resolveMasterAssetVideo(data.master_asset_id);

			return model;
		};

		svc.createSceneModel = function (data) {
			var model = {};

			model.type = data.type;
			model.title = data.title;
			if (!model.title) {model.nonNavigable=true;} // HACK
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
				model.mainPaneContents = 'required';
				model.altPaneContents = 'optional';
			} else {
				// Default:
				model.mainPaneContents = 'transcript';
				model.altPaneContents = 'transmedia';
			}
			if (model.layout.match(/showCurrent/)) {
				model.showCurrent = true;
			}
			return model;
		};

		svc.createItemModel = function (data) {
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
			// NOTE/TODO: in producer need to recalculate this if item layout changes!  Does modelFactory handle that for us or do
			// we need to keep track of it ourselves?
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
						model.source = (data.url.replace(/wmode=[^&]*&?/g,'') + "&wmode=transparent").replace(/&+/g,'&');
					}
				} else {
					model.source = data.url;
				}
				break;

			case "upload":
				var mimeType = data.mimeType || resolveAssetMimeType(data.asset_id); // TODO: data.mimeType will only be truthy in local data. Hopefully this hack can go away with better handling of subtyping. See TODO below.
				if (mimeType.match(/image/)) {
					model.type = "image"; // TODO: Temporary/ugly hack. We could handle subtyping better by creating a subtype or mimetype property and keying off that in the views, instead of changing the actual type on the model, because this is not CRUD friendly.
				}
				model.templateUrl = resolveTemplateUrl(data.template_id) || "templates/transmedia-image-default.html";
				model.itemDetailTemplateUrl = "templates/modal-image-default.html"; // hardcoded for now, not sure if we'll want to allow variations here
				model.title = data.title;
				model.description = data.description;
				model.source = resolveAssetUrl(data.asset_id);
				break;
			}

			return model;
		};

		return svc;
	});
