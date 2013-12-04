'use strict';

angular.module('com.inthetelling.player')
.factory('modelFactory', function(config, dataSvc) {

	// Takes a template id, looks it up, and returns the template url or undefined
	var resolveTemplate = function(templateId) {
		if (templateId) {
			var template = dataSvc.getTemplateById(templateId);
			if (template) {
				return template.url;
			} else {
				console.error("Template lookup failed for:", templateId);
			}
		}
	};

	// Takes an array of layout ids, looks them all up, and returns a concatenated css string or undefined
	var resolveLayout = function(layoutIds) {
		if (layoutIds && layoutIds.length) {
			var i, layout, layoutCSS = "";
			for (i=0; i < layoutIds.length; i++) {
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
	};

	// Takes an array of styles ids, looks them all up, and returns a concatenated css string or undefined
	var resolveStyles = function(styleIds) {
		if (styleIds && styleIds.length) {
			var i, style, styleCSS = "";
			for (i=0; i < styleIds.length; i++) {
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
	};

	// Takes an id for a master asset (video), looks it up, and returns a video definition object or undefined
	var resolveMasterAsset = function(masterAssetId) {
		if (masterAssetId) {
			var masterAsset = svc.getAssetById(masterAssetId);
			if (masterAsset) {
				return {
					mpeg4: masterAsset.url
				};
			} else {
				console.error("Master Asset lookup failed for:", masterAssetId);
			}
		}
	};

	// Takes an id for an asset, looks it up, and returns the asset url or undefined
	var resolveAsset = function(assetId) {
		if (assetId) {
			var asset = svc.getAssetById(assetId);
			if (asset) {
				return asset.url;
			} else {
				console.error("Asset lookup failed for:", assetId);
			}
		}
	};

	// Takes an id for an asset, looks it up, and returns the mime type or undefined
	var resolveAssetMimeType = function(assetId) {
		if (assetId) {
			var asset = svc.getAssetById(assetId);
			if (asset) {
				return asset._type;
			} else {
				console.error("Asset lookup failed for:", assetId);
			}
		}
	};

	var svc = {};

	// TODO: This is ugly. Need to work on local data, and also no need to transform property names anymore... Now that data contract is consistent we can reference the data objects directly, for better future-compatibility of full-crud.

	svc.createEpisodeModel = function(data) {
		var model = {};

		model.title = data.title;
		model.category = "Fnord"; // TODO: Implement categories
		model.coverUrl = "http://placekitten.com/260/261"; // TODO: Implement cover
		model.templateUrl = ( config.localData ? data.template : resolveTemplate(data.template_id) ) || "templates/episode-default.html";
		model.layout = ( config.localData ? data.layout : resolveLayout(data.layout_id) ) || "";
		model.styles = ( config.localData ? data.styles : resolveStyles(data.style_id) ) || "";
		model.videos = config.localData ? data.master_asset_id : resolveMasterAsset(data.master_asset_id);

		return model;
	};

	svc.createSceneModel = function(data) {
		var model = {};
		
		model.type = data.type;
		model.title = data.title;
		model.description = data.description;
		model.startTime = data.start_time;
		model.endTime = data.end_time;
		model.templateUrl = ( config.localData ? data.template : resolveTemplate(data.template_id) ) || "templates/scene-1col.html";
		model.layout = ( config.localData ? data.layout : resolveLayout(data.layout_id) ) || "";
		model.styles = ( config.localData ? data.styles : resolveStyles(data.style_id) ) || "";
		model.displayTime = Math.floor(data.start_time/60) + ":" + ("0"+Math.floor(data.start_time)%60).slice(-2);
		model.isActive = false;
		model.wasActive = false;
		model.items = [];

		/* TODO this logic belongs in the scene directive, doesn't it */
		if (model.layout.match(/splitOptional/)) {
			model.mainPaneContents = 'required';
			model.altPaneContents = 'optional';
		} else {
			// Default:
			model.mainPaneContents = 'transcript';
			model.altPaneContents = 'transmedia';
		}
		if (model.layout.match(/showCurrent/)) {
			model.showCurrent=true;
		}
		
		return model;
	};

	svc.createItemModel = function(data) {
		var model = {};
		
		// base model
		model.type = data.type;
		//model.category = data.category; //TODO: Implement dynamic categories
		model.startTime = data.start_time;
		model.endTime = data.end_time;
		model.layout = ( config.localData ? data.layout : resolveLayout(data.layout_id) ) || "inline";
		model.styles = ( config.localData ? data.styles : resolveStyles(data.style_id) ) || "";
		model.required = data.required || false;
		model.cosmetic = data.cosmetic || false;
		model.stop = data.stop || false;
		model.displayTime = Math.floor(data.start_time/60) + ":" + ("0"+Math.floor(data.start_time)%60).slice(-2);
		
		// Precalculate whether the item will be inline in a content pane or an overlay/underlay.
		// NOTE/TODO: in producer need to recalculate this if item layout changes!  Does modelFactory handle that for us or do
		// we need to keep track of it ourselves?
		if (model.layout === 'inline' || model.layout.match(/sidebar/) || model.layout.match(/burst/)) {
			model.inContentPane = true;
		}

		// extend base model based on item type
		switch(data.type) {
			case "annotation":
				model.templateUrl = ( config.localData ? data.template : resolveTemplate(data.template_id) ) || "templates/transmedia-transcript-default.html";
				model.authorName = data.annotator;
				model.authorThumbSrc = config.localData ? data.annotation_image_id : resolveAsset(data.annotation_image_id);
				model.annotation = data.annotation;
				break;

			case "link":
				model.templateUrl = ( config.localData ? data.template : resolveTemplate(data.template_id) ) || "templates/transmedia-link-default.html";
				model.itemDetailTemplateUrl = "templates/modal-link-default.html"; // hardcoded for now, not sure if we'll want to allow variations here
				model.category = "links"; // TODO: Hardcoded for now. This can go once we implement dynamic categories in the base model construction.
				model.title = data.title;
				model.description = data.description;
				model.thumbSrc = config.localData ? data.link_image_id : resolveAsset(data.link_image_id);
				model.source = data.url;
				break;

			case "upload":
				var mimeType = resolveAssetMimeType(data.asset_id) || "";
				if (mimeType.match(/image/)) {
					data.type = "image"; // TODO: Temporary hack. We could handle subtyping better by creating a subtype or mimetype property and keying off that, instead of changing the actual type. This hack is not CRUD friendly.
				}
				model.templateUrl = ( config.localData ? data.template : resolveTemplate(data.template_id) ) || "templates/transmedia-image-default.html";
				model.title = data.title;
				model.description = data.description;
				model.source = config.localData ? data.asset_id : resolveAsset(data.asset_id);
				break;
		}

		return model;
	};

	return svc;
});
