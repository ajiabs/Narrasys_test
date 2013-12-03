'use strict';

angular.module('com.inthetelling.player')
.factory('modelFactory', function () {
	var svc = {};

	svc.createEpisodeModel = function(data) {
		var model = {};

		model.title = data.title;
		model.category = data.category;
		model.coverUrl = data.cover;
		model.templateUrl = data.template || "templates/episode-default.html";
		model.layout = data.layout || "layoutDefault";
		model.styles = data.styles;
		model.videos = {
			webm: data.videos.webm,
			mpeg4: data.videos.mpeg4
		};
		model.scenes = [];

		return model;
	};

	svc.createSceneModel = function(data) {
		var model = {};
		
		model.type = data.type;
		model.title = data.title;
		model.description = data.description;
		model.startTime = data.start;
		model.displayTime = Math.floor(data.start/60) + ":" + ("0"+Math.floor(data.start)%60).slice(-2);
		model.endTime = data.end;
		model.thumbnail = data.src; // TODO: change to model.thumbSrc (for consistency with item thumbnails and of calling item url/src in var name)
		model.isActive = false;
		model.wasActive = false;
		model.items = [];

		model.templateUrl = data.template || "templates/scene-1col.html";
		model.layout = data.layout || "";

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
		model.styles = data.styles;
		return model;
	};

	svc.createItemModel = function(data) {
		var model = {};
		
		// base model
		model.type = data.type;
		model.category = data.category;
		model.startTime = data.start;
		model.endTime = data.end;
		model.displayTime = Math.floor(data.start/60) + ":" + ("0"+Math.floor(data.start)%60).slice(-2);

		model.layout = data.layout || "inline";
		
		// Precalculate whether the item will be inline in a content pane or an overlay/underlay.
		// NOTE/TODO: in producer need to recalculate this if item layout changes!  Does modelFactory handle that for us or do
		// we need to keep track of it ourselves?
		if (model.layout === 'inline' || model.layout.match(/sidebar/) || model.layout.match(/burst/)) {
			model.inContentPane = true;
		}
		model.styles = data.styles;
		model.required = data.required || false;
		model.cosmetic = data.cosmetic || false;
		model.stop = data.stop || false;

		// extend base model based on item type
		switch(data.type) {
			case "transcript":
				model.templateUrl = data.template || "templates/transmedia-transcript-default.html";
				model.authorName = data.author.name;
				model.authorThumbSrc = data.author.src;
				model.annotation = data.annotation;
				break;

			case "link":
				model.templateUrl = data.template || "templates/transmedia-link-default.html";
				model.itemDetailTemplateUrl = "templates/modal-link-default.html"; // hardcoded for now, not sure if we'll want to allow variations here
				model.title = data.title;
				model.description = data.description;
				model.thumbSrc = data.src;
				model.source = data.href; // TODO: Change model.source to model.target
				break;

			case "image":
				model.templateUrl = data.template || "templates/transmedia-image-default.html";
				model.title = data.title;
				model.description = data.description;
				model.source = data.src; // TODO: Change model.source to model.src
				break;
		}

		return model;
	};

	return svc;
});
