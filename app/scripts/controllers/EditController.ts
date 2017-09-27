'use strict';
import { createInstance, IEpisode } from '../models';
import { IEpisodeTheme, IEpisodeEditService, IModelSvc, IDataSvc, ITimelineSvc } from '../interfaces';

EditController.$inject = [
  '$scope',
  '$rootScope',
  '$timeout',
  '$window',
  'selectService',
  'appState',
  'dataSvc',
  'modelSvc',
  'timelineSvc',
  'authSvc',
  'MIMES',
  'playbackService',
  'episodeTheme',
  'episodeEdit'
];

export default function EditController(
  $scope: ng.IScope,
  $rootScope: ng.IRootScopeService,
  $timeout: ng.ITimeoutService,
  $window,
  selectService,
  appState,
  dataSvc: IDataSvc,
  modelSvc: IModelSvc,
  timelineSvc: ITimelineSvc,
  authSvc,
  MIMES,
  playbackService,
  episodeTheme: IEpisodeTheme,
  episodeEdit: IEpisodeEditService) {
  $scope.uneditedScene = angular.copy($scope.item); // to help with diff of original scenes

  // HACK assetType below is optional, only needed when there is more than one asset to manage for a single object (for now, episode poster + master asset)
  // Poor encapsulation of the upload controls. Sorry about that.
  $scope.userHasRole = authSvc.userHasRole;
  $scope.canAccess = authSvc.userHasRole('admin') || authSvc.userHasRole('customer admin');
  $scope.selectService = selectService;

  if ($scope.item && MIMES[$scope.item.producerItemType]) {
    $scope.mimes = MIMES[$scope.item.producerItemType];
  } else {
    $scope.mimes = MIMES.default;
  }

  $scope.chooseAsset = function (assetType) {
    assetType = assetType || '';
    $scope.showAssetPicker = true;
    $scope.w1 = $rootScope.$on('UserSelectedAsset', function (e, id) {
      if (assetType === 'Poster') {
        $scope.attachPosterAsset(id); // in ittEpisodeEditor
      } else {
        $scope.attachChosenAsset(id); // in ittItemEditor or ittEpisodeEditor
      }
      $scope["showUploadButtons" + assetType] = false;
      $scope.endChooseAsset();
    });
    $scope.w2 = $rootScope.$on('userKeypress.ESC', $scope.endChooseAsset);
  };
  $scope.endChooseAsset = function () {
    $scope.w1();
    $scope.w2();
    $scope.showAssetPicker = false;
  };

  $scope.toggleUpload = function (assetType) {
    assetType = assetType || '';
    $scope["showUploadField" + assetType] = !$scope["showUploadField" + assetType];
  };

  $scope.addDistractor = function () {
    $scope.item.data._plugin.distractors.push({
      text: "",
      index: ($scope.item.data._plugin.distractors.length + 1)
    });
  };


  $scope.onFormativeChecked = onFormativeChecked;
  function onFormativeChecked(distractor) {
    angular.forEach($scope.item.data._plugin.distractors, function (_distractor) {
      if (_distractor !== distractor) {
        _distractor.correct = undefined;
      }
    });
  }



  $scope.addEvent = function (producerItemType) {
    if (producerItemType === 'scene') {
      var t = Math.round(playbackService.getMetaProp('time') * 100) / 100;
      if (modelSvc.isOnExistingSceneStart(t)) {
        return $scope.editCurrentScene(t);
      }
    }
    // console.log("itemEditController.addEvent");
    var newEvent = generateEmptyItem(producerItemType);


    newEvent.cur_episode_id = appState.episodeId;
    newEvent.episode_id = appState.episodeId;
    if (appState.user && appState.user.avatar_id) {
      newEvent.avatar_id = appState.user.avatar_id;
    }
    modelSvc.cache("event", newEvent);

    appState.editEvent = modelSvc.events["internal:editing"];
    appState.videoControlsActive = true; // TODO see playerController showControls; this may not be sufficient on touchscreens
    appState.videoControlsLocked = true;

    modelSvc.resolveEpisodeEvents(appState.episodeId);
    timelineSvc.injectEvents([modelSvc.events["internal:editing"]]);
    if (producerItemType === 'scene') {
      //to set the defaults on the first pass
      selectService.onSelectChange(appState.editEvent);
      timelineSvc.updateSceneTimes(appState.episodeId);
    }
    $rootScope.$emit('searchReindexNeeded'); // HACK
  };

  var isTranscript = function (item) {
    if (item._type === 'Annotation' && item.templateUrl.match(/transcript/)) {
      return true;
    } else {
      return false;
    }
  };

  var getTranscriptItems = function () {
    var episode = modelSvc.episodes[appState.episodeId];
    var allItems = angular.copy(episode.items);
    return allItems.filter(isTranscript);
  };
  var getItemIndex = function (items, item) {
    var centerIndex = 0;
    for (var i = 0, len = items.length; i < len; i++) {
      if (items[i]._id === item._id) {
        centerIndex = i;
        break;
      }
    }
    return centerIndex;
  };
  var filterToItemBefore = function (items, centerItem) {
    items = items.sort(sortByStartTime);
    var centerIndex = getItemIndex(items, centerItem);
    var itemBefore = [];
    if (centerIndex === 0) {
      return itemBefore;
    } else {
      if (centerIndex < items.length - 1) {
        if (centerIndex >= 1) {
          if (!isInternal(items[centerIndex - 1])) {
            itemBefore.push(items[centerIndex - 1]);
          }
        }
      }
    }
    return itemBefore;
  };

  var filterToBookends = function (items, centerItem) {
    items = items.sort(sortByStartTime);
    var centerIndex = getItemIndex(items, centerItem);
    var itemsBeforeAndAfter = [];

    if (centerIndex === 0) {
      if (centerIndex < items.length - 1) {
        if (!isInternal(items[centerIndex + 1])) {
          itemsBeforeAndAfter.push(items[centerIndex + 1]);
        }
      }
    } else {
      if (centerIndex < items.length - 1) {
        if (!isInternal(items[centerIndex + 1])) {
          itemsBeforeAndAfter.push(items[centerIndex + 1]);
        }
        if (centerIndex >= 1) {
          if (!isInternal(items[centerIndex - 1])) {
            itemsBeforeAndAfter.push(items[centerIndex - 1]);
          }
        }
      }
    }
    return itemsBeforeAndAfter;
  };

  // Editing some events has side effects on other events; this stores those side effects.
  // assuming that this is called after a resolve and that we are dealing with events that have been adjusted already
  var saveAdjustedEvents = function (item, operation, original) {
    if (isTranscript(item)) {
      var itemsToSave = [];
      var transcriptItems = getTranscriptItems();
      switch (operation) {
        case "create":
          itemsToSave = filterToBookends(transcriptItems, item);
          console.log('adjust for create');
          break;
        case "delete":
          itemsToSave = filterToItemBefore(transcriptItems, item);
          console.log('adjust for delete');
          break;
        case "update":
          // TODO this should be updating the adjusted events, not delete-and-create.
          if (original) {
            saveAdjustedEvents(original, "delete");
          }
          saveAdjustedEvents(item, "create");
          console.log('adjust for update');
          break;
      }
      angular.forEach(itemsToSave, function (item) {
        dataSvc.storeItem(item)
          .then(function () {
            console.log('updated transcript item', item);
          }, function (data) {
            console.error("FAILED TO STORE EVENT", data);
          });
      });
    }
  };

  $scope.saveEvent = function () {
    var toSave = angular.copy(appState.editEvent);
    $scope.blockDoubleClicks = true;
    //assign current episode_id
    toSave.cur_episode_id = appState.episodeId;
    if (toSave._type === 'Scene') {
      var adjusted = adjustScenes(toSave);
      angular.forEach(adjusted, function (scene) {
        dataSvc.storeItem(scene)
          .then(function () {
            // console.log("scene end_time updated");
          }, function (data) {
            console.error("FAILED TO STORE EVENT", data);
          });
      });
    }

    dataSvc.storeItem(toSave)
      .then(function (data) {
        data.cur_episode_id = appState.episodeId;

        var saveOperation = 'update';
        if (appState.editEvent._id === 'internal:editing') {
          // update the new item with its real ID (and remove the temp version)
          timelineSvc.removeEvent("internal:editing");
          delete(modelSvc.events["internal:editing"]);
          modelSvc.cache("event", dataSvc.resolveIDs(data));
          modelSvc.resolveEpisodeEvents(appState.episodeId);
          saveOperation = 'create';
          var assetId = data.asset_id || data.link_image_id || data.annotation_image_id;
          if (assetId && toSave.asset && toSave.asset._id === assetId) {
            modelSvc.assocEventWithAsset(data._id, assetId);
          }
        }

        if (data._type === 'Scene') {
          timelineSvc.timelineEvents = [];
          timelineSvc.injectEvents(modelSvc.episodeEvents(appState.episodeId), 0);
          // sometimes the scene prior to the new onne being created is set to be the current scene
          modelSvc.episodes[appState.episodeId].setCurrentScene(modelSvc.events[data._id]);
        } else {
          modelSvc.resolveEpisodeEvents(appState.episodeId);
          timelineSvc.updateEventTimes(modelSvc.events[data._id]);
        }

        // currently only runs on transcript items
        saveAdjustedEvents(data, saveOperation);

        // Delete attached asset(s)  (this should only occur for sxs items, for now)
        // yes we could combine these into one call I suppose but there will almost always only be one
        // unless the user was very indecisive and uploaded/detached a bunch of assets to the same event.
        // It was probably already a premature optimization to use an array here in the first place

        // see ittItemEditor to see where toSave.removedAssets is setup as below is the only
        // reference in this file.
        angular.forEach(toSave.removedAssets, function (id) {
          dataSvc.deleteAsset(id);
        });
        appState.editEvent = false;
        $rootScope.$emit('searchReindexNeeded'); // HACK
      }, function (data) {
        console.error("FAILED TO STORE EVENT", data);
      });
  };

  var getScenes = modelSvc.getEpisodeScenes;

  var isInternal = function (item) {
    return (item._id && item._id.match(/internal/));
  };

  $scope.getItemsAfter = function (items, after) {
    var itemsAfter = [];
    for (var i = 0, len = items.length; i < len; i++) {
      if (!isInternal(items[i])) {
        if (after < items[i].start_time || after < items[i].end_time) {
          itemsAfter.push(items[i]);
        }
      }
    }
    return itemsAfter;
  };

  $scope.saveEpisode = function () {
    var toSave = angular.copy(appState.editEpisode);

    dataSvc.storeEpisode(toSave)
      .then(function (data) {
        modelSvc.cache("episode", dataSvc.resolveIDs(data));
        if (appState.editEpisode._master_asset_was_changed) {
          delete modelSvc.episodes[data._id]._master_asset_was_changed; // probably unnecessary
          var duration = modelSvc.assets[data.master_asset_id].duration;
          var endTime = duration - 0.01;
          modelSvc.episodes[appState.episodeId].masterAsset = modelSvc.assets[$scope.episode.master_asset_id];
          modelSvc.episodes[appState.episodeId].master_asset_id = data.master_asset_id;

          /*
           iterate through episode.scenes.
           if start time > duration, delete the scene.
           if end time > duration, set end time to duration.
           iterate through episode.items.
           if start or end time > duration, set to duration.

           update ending scene
           resolveEpisode and resolveEpisodeEvents

           */
          var modifiedEvents = [];
          var deletedScenes = [];

          var episode = modelSvc.episodes[toSave._id];
          angular.forEach(episode.scenes, function (scene) {

            if (scene.start_time > duration) {
              deletedScenes.push(scene);
            } else if (scene.end_time > duration) {
              scene.end_time = endTime;
              modifiedEvents.push(scene);
            }
          });
          angular.forEach(episode.items, function (item) {
            if (item.start_time > duration) {
              item.start_time = endTime;
            }
            if (item.end_time > duration) {
              item.end_time = endTime;
            }
            modifiedEvents.push(item);
          });

          var endingScene = modelSvc.events["internal:endingscreen:" + toSave._id];
          if (endingScene) { // if episode was shortened, this might have been one that was deleted
            endingScene.start_time = endTime;
            endingScene.end_time = endTime;
          } else {
            modelSvc.addEndingScreen(toSave._id);
          }

          modelSvc.resolveEpisodeEvents(appState.episodeId);
          // modelSvc.resolveEpisodeContainers(appState.episodeId); // only needed for navigation_depth changes
          modelSvc.resolveEpisodeAssets(appState.episodeId); // TODO I suspect this is unnecessary...
          playbackService.setMetaProp('duration', duration);
          appState.editEpisode = false;
          appState.videoControlsLocked = false;
          timelineSvc.init(appState.episodeId);

          // push each of modifiedEvents to server (TODO combine these into one call!)
          angular.forEach(modifiedEvents, function (event) {
            if (event._id.indexOf('internal') < 0) {
              dataSvc.storeItem(event);
            }
          });
          // ditto for orphaned scenes
          angular.forEach(deletedScenes, function (scene) {
            if (scene._id.indexOf('internal') < 0) {
              dataSvc.deleteItem(scene._id);
            }
          });

          // HACK HACK HACK super brute force -- something is going screwy with the timeline and video here,
          // especially when we switch from youtube to native or vv.  Force it with a full reload.
          // (Note this makes a lot of the above re-init code redundant, but I'm hopeful I'll someday have time to fix this prOH HA HA HA I COULDNT SAY IT WITH A STRAIGHT FACE)
          $timeout(function () {
            $window.location.reload();
          }, 500);

        } else {
          // modelSvc.resolveEpisodeContainers(appState.episodeId); // only needed for navigation_depth changes
          modelSvc.resolveEpisodeEvents(appState.episodeId);
          modelSvc.resolveEpisodeAssets(appState.episodeId);
          appState.editEpisode = false;
          appState.videoControlsLocked = false;

        }
      }, function (data) {
        console.error("FAILED TO STORE EPISODE", data);
      });
  };

  var resetScenes = function (updatedScenes, originalScene) {
    for (var i = 0; i < updatedScenes.length; i++) {
      if (typeof (updatedScenes[i]._id) === 'undefined' || updatedScenes[i]._id === 'internal:editing') {
        updatedScenes.splice(i, 1);
        break;
      }
      if (originalScene) {
        if (updatedScenes[i]._id === originalScene._id) {
          updatedScenes[i] = originalScene;
          break;
        }
      }
    }
    return updatedScenes;
  };

  var fixEndTimes = function (scenes, duration) {
    for (var i = 1, len = scenes.length; i < len; i++) {
      if (i === len - 1) {
        scenes[i].end_time = duration;
      } else {
        if (scenes[i].end_time !== scenes[i + 1].start_time) {
          scenes[i].end_time = scenes[i + 1].start_time;
        }
      }
    }
  };
  var pushScene = function (scenes, scene) {
    var exists = false;
    for (var i = 0, len = scenes.length; i < len; i++) {
      if (scenes[i]._id === scene._id) {
        exists = true;
        //do nothing, as already exists
        break;
      }
    }
    if (!exists) {
      scenes.push(scene);
    }
  };
  var removeScene = function (scenes, id) {
    for (var i = 0, len = scenes.length; i < len; i++) {
      if (scenes[i]._id === id) {
        scenes.splice(i, 1);
        break;
      }
    }
  };
  var sortByStartTime = function (a, b) {
    return a.start_time - b.start_time;
  };

  var adjustScenes = function (modifiedScene, isDelete) {
    var duration = playbackService.getMetaProp('duration');
    var scenes = angular.copy(getScenes());
    var adjusted = [];
    // get scenes back into original state (before editing,adding,deleting)
    if (isDelete) {
      pushScene(scenes, $scope.uneditedScene);
    } else {
      resetScenes(scenes, $scope.uneditedScene);
    }
    scenes = scenes.sort(sortByStartTime);
    fixEndTimes(scenes, duration);

    // now scenes is back to pre edit state.  let's drop in our new scene and then see what is impacted (and needs updating)
    removeScene(scenes, modifiedScene._id);
    if (!isDelete) {
      scenes.push(modifiedScene);
    }
    scenes = scenes.sort(sortByStartTime);

    for (var i = 1, len = scenes.length; i < len; i++) {
      if (i === len - 1) {
        if (scenes[i].end_time !== duration) {
          scenes[i].end_time = duration;
          adjusted.push(scenes[i]);
        }
      } else {
        if (scenes[i].end_time !== scenes[i + 1].start_time) {
          scenes[i].end_time = scenes[i + 1].start_time;
          adjusted.push(scenes[i]);
        }
      }

    }
    return adjusted;
  };

  $scope.editCurrentScene = function (t) {
    var scene = modelSvc.sceneAtEpisodeTime(appState.episodeId, t);
    appState.editEvent = modelSvc.events[scene._id];
    appState.editEvent.templateOpts = selectService.getTemplates('scene');
    appState.editEvent.cur_episode_id = appState.episodeId;
    appState.editEvent.episode_id = appState.episodeId;
    appState.editEvent.producerItemType = 'scene';
    appState.videoControlsActive = true; // TODO see playerController showControls; this may not be sufficient on touchscreens
    appState.videoControlsLocked = true;
    selectService.onSelectChange(appState.editEvent);
  };

  $scope.editEpisode = function () {
    appState.editEpisode = modelSvc.episodes[appState.episodeId];
    appState.editEpisode.templateOpts = selectService.getTemplates('episode');
    appState.videoControlsActive = true; // TODO see playerController showControls; this may not be sufficient on touchscreens
    appState.videoControlsLocked = true;
  };

  $scope.deleteEvent = function (eventId) {
    if (window.confirm("Are you sure you wish to delete this item?")) {
      //fabricate scene event
      var event = {};
      event._id = eventId;
      var eventType = modelSvc.events[eventId]._type;
      if (eventType === 'Scene') {
        var adjusted = adjustScenes(event, true);
        angular.forEach(adjusted, function (scene) {
          dataSvc.storeItem(scene)
            .then(function () {
              // console.log("scene end_time updated");
            }, function (data) {
              console.error("FAILED TO STORE EVENT", data);
            });
        });
      }

      dataSvc.deleteItem(eventId)
        .then(function () {
          if (appState.product === 'sxs' && modelSvc.events[eventId].asset) {
            dataSvc.deleteAsset(modelSvc.events[eventId].asset._id);
          }
          timelineSvc.removeEvent(eventId);
          delete modelSvc.events[eventId];
          modelSvc.resolveEpisodeEvents(appState.episodeId);

          if (eventType === 'Scene' || eventType === 'Chapter') {
            timelineSvc.updateSceneTimes(appState.episodeId);
          }
          saveAdjustedEvents(event, "delete");
          appState.editEvent = false;
          appState.videoControlsLocked = false;
        }, function (data) {
          console.warn("failed to delete:", data);
        });
    }
  };

  $scope.cancelEventEdit = function (originalEvent) {
    var episodeId = originalEvent.cur_episode_id ? originalEvent.cur_episode_id : originalEvent.episode_id;
    if (appState.editEvent._id === 'internal:editing') {
      delete(modelSvc.events['internal:editing']);
      timelineSvc.removeEvent("internal:editing");
    } else {
      modelSvc.events[appState.editEvent._id] = originalEvent;
    }
    modelSvc.resolveEpisodeEvents(episodeId);

    if (originalEvent._type === 'Scene') {
      timelineSvc.updateSceneTimes(episodeId);
    } else {
      timelineSvc.updateEventTimes(originalEvent);
    }

    appState.editEvent = false;
    appState.videoControlsLocked = false;
  };

  $scope.cancelEpisodeEdit = function (originalEvent: IEpisode) {

    modelSvc.episodes[appState.episodeId] = originalEvent;

    modelSvc.deriveEpisode(modelSvc.episodes[originalEvent._id]);
    modelSvc.resolveEpisodeContainers(originalEvent._id); // only needed for navigation_depth changes
    modelSvc.resolveEpisodeEvents(originalEvent._id); // needed for template or style changes
    // console.log("Episode StyleCss is now ", modelSvc.episodes[originalEvent._id].styleCss);
    episodeTheme.setTheme(originalEvent.template);
    appState.editEpisode = false;
    appState.videoControlsLocked = false;
  };

  var generateEmptyItem = function (type) {
    var base = {
      "_id": "internal:editing",
      "start_time": playbackService.getMetaProp('time'),
      "episode_id": appState.episodeId,
      // "type": type,  <-- NOPE that's a bug.  Confusing, so I'm leaving in this comment:  API types are Plugin, Scene, Upload, Link; these producer item types are different
      "isCurrent": true,
      "producerItemType": type,
      "layouts": ["inline"],
      "styles": []
    };
    /*
     Item types:

     producer only
     scene
     transcript
     annotation

     sxs only
     comment

     sxs and producer
     image
     file
     link
     question
     video (injected episode) TODO
     */

    var stub = Object.create(null);
    if (type === 'scene') {
      stub = {
        "_type": "Scene",
        "title": {},
        "description": {}
      };
    }
    if (type === 'chapter') {
      stub = {
        '_type': 'Chapter',
        'title': {},
        'description': {}
      };
    }
    if (type === 'video') {
      // TODO: this should be an injected episode with the linked/uploaded video as its master asset.
      // For now we're faking it as a link item.
      stub = {
        "_type": "Link",
        "link_image_id": "",
        "url": "",
        "title": {},
        "description": {}
      };
    }

    if (type === 'comment' || type === 'transcript' || type === 'annotation') {
      stub = {
        "_type": "Annotation",
        "annotation": {},
        "annotator": {},
        "annotation_image_id": ""
      };
    }

    if (type === 'file' || type === 'image') {
      stub = {
        "_type": "Upload",
        "asset_id": "",
        "title": {},
        "description": {}
      };
    }

    if (type === 'link') {
      stub = {
        "_type": "Link",
        "link_image_id": "",
        "url": "https://",
        "title": {},
        "target": "_self",
        "description": {},
        "url_status": {}
      };
    }

    if (type === 'question') {
      // TODO i18n
      stub = {
        "_type": "Plugin",
        "title": {},
        "data": {
          "_pluginType": "question",
          "_version": 2,
          "_plugin": {
            "questiontext": "",
            "questiontype": "mc-formative",
            "distractors": [{
              "index": 1,
              "text": ""
            }, {
              "index": 2,
              "text": ""
            }, {
              "index": 3,
              "text": ""
            }, {
              "index": 4,
              "text": ""
            }],
            "correctfeedback": "",
            "incorrectfeedback": ""
          }
        }
      };
      stub.plugin = stub.data._plugin;
    }

    if (appState.product === 'sxs') {
      // SxS overrides a lot of the item options:
      stub.sxs = true; // temporary?
      stub.annotator = {
        en: appState.user.name
      };
      stub.layouts = ["windowFg"];
      stub.end_time = appState.time;
      stub.stop = true;
      stub.templateUrl = 'templates/item/sxs-' + type + '.html';
    } else {
      var defaultTemplateUrls = {
        "scene": "templates/scene/centered.html",
        "transcript": "templates/item/transcript.html",
        "annotation": "templates/item/text-h2.html",
        "link": "templates/item/link.html",
        "image": "templates/item/image-plain.html",
        "file": "templates/item/file.html",
        "question": "templates/item/question-mc.html",
        "video": "TODO:VIDEO"
      };

      stub.templateOpts = selectService.getTemplates(type);
      stub.templateUrl = defaultTemplateUrls[type];
    }
    angular.extend(base, stub);
    return createInstance(stub._type, base);
  };

  $scope.updateEpisodeTemplate = updateEpisodeTemplate;
  function updateEpisodeTemplate($data: { episode: IEpisode, templateId: string }) {
    console.log('what the fucK', $data);
    $scope.episode = episodeEdit.updateEpisodeTemplate($data.episode, $data.templateId);

  }

}
