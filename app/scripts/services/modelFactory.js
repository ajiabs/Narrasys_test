'use strict';

angular.module('com.inthetelling.player')
.factory('modelFactory', function () {
	var svc = {};

  svc.createEpisodeModel = function(data) {
    var model = {};

    model.title = data.title;
    model.category = data.category;
    model.coverUrl = data.cover;
    model.templateUrl = data.template;
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
    model.templateUrl = data.template;
    model.startTime = data.start;
    model.endTime = data.end;
    model.thumbnail = data.src;
    model.isActive = false;
    model.wasActive = false;
    model.items = [];

    return model;
  };

  svc.createItemModel = function(data) {
    var model = {};
    
    // base model
    model.type = data.type;
    model.category = data.category;
    model.startTime = data.start;
    model.endTime = data.end;
    model.templateUrl = data.template;
    model.displayTime = Math.floor(data.start/60) + ":" + ("0"+Math.floor(data.start)%60).slice(-2);

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
        model.source = data.href;
        break;

      case "image":
        model.title = data.title;
        model.description = data.description;
        model.source = data.src;
        break;
    }

    return model;
  };

  return svc;
});
