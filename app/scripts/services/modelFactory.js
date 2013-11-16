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
		model.endTime = data.end;
		model.thumbnail = data.src; // TODO: change to model.thumbSrc (for consistency with item thumbnails and of calling item url/src in var name)
		model.isActive = false;
		model.wasActive = false;
		model.items = [];

		model.templateUrl = data.template || "templates/scene-1col.html";
		model.layout = data.layout || "";
		if (model.layout.match(/splitRequired/)) {
			model.mainPaneContents = 'required';
			model.altPaneContents = 'optional';
		} else {
			// Default:
			model.mainPaneContents = 'transcript';
			model.altPaneContents = 'transmedia';
		}



		model.styles = data.styles;
		model.testfield = "transcript";
		
		return model;
	};

	svc.createItemModel = function(data) {
		var model = {};
		
		// base model
		model.type = data.type;
		model.category = data.category;
		model.startTime = data.start;
		model.endTime = data.end;
		model.itemDetailTemplateUrl = data.itemDetailTemplate; // TODO: guessing this var name for now
		model.displayTime = Math.floor(data.start/60) + ":" + ("0"+Math.floor(data.start)%60).slice(-2);

		model.templateUrl = data.template || console.error("ERROR no templateUrl specified for item");
		model.layout = data.layout || "inline";
		model.styles = data.styles;
		model.required = data.required || false;
		model.cosmetic = data.cosmetic || false;
		model.stop = data.stop || false;

		// extend base model based on item type
		switch(data.type) {
			case "transcript":
				model.authorName = data.author.name;
				model.authorThumbSrc = data.author.src;
				model.annotation = data.annotation;
				break;

			case "link":
				model.title = data.title;
				model.description = data.description;
				model.thumbSrc = data.src;
				model.source = data.href; // TODO: Change model.source to model.target
				break;

			case "image":
				model.title = data.title;
				model.description = data.description;
				model.source = data.src; // TODO: Change model.source to model.src
				break;
		}

		return model;
	};

	return svc;
});
