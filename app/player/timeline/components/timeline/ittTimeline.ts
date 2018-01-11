// @npUpgrade-timeline-false
// jQuery dependencies: offset(), animate(), namespaced .bind and .unbind
// TODO some events need to be unbound on destroy, which I'll get around to implementing if this ever needs to be destroyed
// TODO for now simply hiding volume controls on touchscreen devices (they'll use native buttons). Future, see if we can include those and have them work properly...
import timelineStoryHtml from './timeline-story.html';
ittTimeline.$inject = ['$timeout', 'appState', 'timelineSvc', 'modelSvc', 'playbackService'];

export default function ittTimeline($timeout, appState, timelineSvc, modelSvc, playbackService) {
  return {
    restrict: 'A',
    replace: true,
    scope: true,
    template: timelineStoryHtml,
    controller: 'TimelineController',
    link: function (scope, element) {
      // console.log('ittTimeline', scope, element);
      scope.appState = appState;

      scope.timeline = timelineSvc;
      scope.handlePosition = 0; // position of draghandle (as a fraction of full timeline)
      scope.zoomLevel = 1; // multiples by which the timeline is zoomed in
      scope.zoomOffset = 0; // multiple by which the timeline is offset to the left

      // Prevent this from being visible on touchscreens before playback, to allow youtube to init from direct user input
      if (appState.isTouchDevice && !playbackService.getMetaProp('hasBeenPlayed')) {
        scope.isSuppressed = true;
      }

      var watch = scope.$watch(function () {
        return playbackService.getMetaProp('hasBeenPlayed');
      }, function (wasPlayed) {
        if (wasPlayed === true) {
          scope.isSuppressed = false;
          watch();
        }
      });

      // these classnames and variable names aren't confusing AT ALL.  Curse you, past Daniel
      var timelineNode, timelineContainer;
      $timeout(function () { // HACK need to wait for template url to resolve before doing element.find
        timelineNode = element.find('.progressbarContainer');
        timelineContainer = element.find('.progressbar');
        initPlayheadEvents();
      });

      // zoom in on item edit:
      scope.autoZoom = function (item) {
        // console.log("autoZoom");

        scope.savedZoomLevel = scope.zoomLevel;
        var itemLength = item.end_time - item.start_time;
        var toEnd = (playbackService.getMetaProp('duration') - item.end_time);

        // toEnd/itemLength puts the item end at the right edge of the visible playhead.
        // trim it back by 40% for some wiggle room, and cap it at 2000% zoom so we don't go nuts on short-duration events
        scope.zoomLevel = Math.min(Math.max(Math.round(0.6 * toEnd / itemLength), 1), 20);

        zoom();
      };

      scope.endAutoZoom = function () {
        if (scope.savedZoomLevel) {
          scope.zoomLevel = scope.savedZoomLevel;
          zoom();
          delete scope.savedZoomLevel;
        }
      };

      let editWatcher = scope.$watch(
        () => appState.editEvent,
        (item) => {
          if (appState.product === 'producer') {
            if (item) {
              scope.autoZoom(item);
            } else {
              scope.endAutoZoom();
            }
          }
        },
        true
      );

      scope.appState = appState;

      scope.setNewLanguage = function () {
        modelSvc.setLanguageStrings();
      };

      scope.showSceneMenuTooltip = function (makeVisible) {
        if (makeVisible && !(appState.isTouchDevice)) {
          scope.sceneMenuToolTip = true;
        } else {
          scope.sceneMenuToolTip = false;
        }
      };

      scope.prevScene = function () {
        // console.log("prevScene");
        timelineSvc.prevScene();
      };
      scope.nextScene = function () {
        // console.log("nextScene");
        timelineSvc.nextScene();
      };

      scope.userChangingVolume = function (evt) {
        if (playbackService.getMetaProp('muted')) {
          scope.toggleMute();
        }
        var volumeNode = angular.element(evt.currentTarget);
        var updateVolume = function (movement, noApplyNeeded) {
          var newVolume = (movement.clientX - volumeNode.offset()
              .left) / volumeNode.width() * 100;
          if (newVolume > 98) {
            newVolume = 100;
          }
          if (newVolume < 3) {
            newVolume = 0;
          }
          if (noApplyNeeded) {
            scope.setVolume(newVolume); // mousedown
          } else {
            scope.$apply(scope.setVolume(newVolume)); // mousemove
          }
        };
        updateVolume(evt, true); //mousedown
        volumeNode.bind('mousemove.volume', updateVolume); // mousemove
        angular.element(document)
          .bind('mouseup.volume', function () {
            angular.element(document)
              .unbind('mouseup.volume');
            volumeNode.unbind('mousemove.volume');
          });
      };
      var KeyCodes = {
        PAGEUP: 33,
        PAGEDOWN: 34,
        END: 35,
        HOME: 36,
        LEFTARROW: 37,
        UPARROW: 38,
        RIGHTARROW: 39,
        DOWNARROW: 40
      };

      scope.onVolumeKeyDown = function ($event) {
        var e = $event;
        // var $target = $(e.target);
        // var nextTab;
        var passThrough = true;
        switch (e.keyCode) {
          case KeyCodes.LEFTARROW:
            decrementVolume(1);
            passThrough = false;
            break;
          case KeyCodes.RIGHTARROW:
            incrementVolume(1);
            passThrough = false;
            break;
          case KeyCodes.UPARROW:
            incrementVolume(1);
            passThrough = false;
            break;
          case KeyCodes.DOWNARROW:
            decrementVolume(1);
            passThrough = false;
            break;
          case KeyCodes.PAGEUP:
            incrementVolume(10);
            passThrough = false;
            break;
          case KeyCodes.PAGEDOWN:
            decrementVolume(10);
            passThrough = false;
            break;
          case KeyCodes.HOME:
            decrementVolume(100);
            passThrough = false;
            break;
          case KeyCodes.END:
            incrementVolume(100);
            passThrough = false;
            break;
          default:
            passThrough = true;
            break;
        }
        if (!passThrough) {
          // console.log("stop propagation");
          $event.stopPropagation();
          $event.preventDefault();
        }
      };

      function adjustHigh(volume) {
        return volume > 98 ? 100 : volume;
      }

      function adjustLow(volume) {
        return volume < 3 ? 0 : volume;
      }

      function incrementVolume(chunk) {
        var volume = scope.currentVolume() + chunk;
        volume = adjustHigh(volume);
        if (typeof scope.setVolume === "function") {
          scope.setVolume(volume);
        }
      }

      function decrementVolume(chunk) {
        var volume = scope.currentVolume() - chunk;
        volume = adjustLow(volume);
        if (typeof scope.setVolume === "function") {
          scope.setVolume(volume);
        }
      }

      scope.currentVolume = function () {
        if (playbackService.getMetaProp('muted')) {
          return 0;
        } else {
          return playbackService.getMetaProp('volume');
        }
      };

      scope.audioIcon = function () {
        if (playbackService.getMetaProp('muted')) {
          return "muted";
        } else {
          return "vol" + Math.floor(playbackService.getMetaProp('volume') / 34);
        }
      };

      scope.showTooltip = function (event) {
        // console.log("tip: ", event);
        event.showTooltip = true;
      };
      scope.hideTooltip = function (event) {

        event.showTooltip = false;
      };

      scope.zoomIn = function () {
        scope.stopWatching = true;
        scope.zoomLevel = scope.zoomLevel + 1;
        zoom();
      };
      scope.zoomOut = function () {
        scope.stopWatching = true;
        if (scope.zoomLevel <= 2) {
          scope.zoomLevel = 1;
        } else if (scope.zoomLevel <= 3) {
          scope.zoomLevel = 1.5;
        } else {
          scope.zoomLevel = scope.zoomLevel / 2;
        }
        zoom();
      };

      // adjust the position of the playhead after a scale change:
      var zoom = function () {
        scope.zoomOffset = -((scope.zoomLevel - 1) * (playbackService.getMetaProp('time') / playbackService.getMetaProp('duration')));
        // console.log("zoom().scope.zoomOffset = ", scope.zoomOffset);
        // console.log("zoom().scope.zoomLevel = ", scope.zoomLevel);
        timelineNode.stop().animate({
          "left": (scope.zoomOffset * 100) + "%",
          "width": (scope.zoomLevel * 100) + "%"
        }, 1000, function () {
          scope.stopWatching = false; // so we don't try to update the playhead during a zoom animation
        });
      };

      // at all times keep playhead position at the same % of the visible progress bar as the time is to the duration
      // cosmetic: stop watching while zoom-animation is in progress
      scope.$watch(function () {
        return {
          t: playbackService.getMetaProp('time'),
          d: playbackService.getMetaProp('duration')
        };
      }, function () {
        if (!scope.stopWatching) {
          scope.zoomOffset = -((scope.zoomLevel - 1) * (playbackService.getMetaProp('time') / playbackService.getMetaProp('duration')));
          if (timelineNode) {
            timelineNode.css({
              "left": (scope.zoomOffset * 100) + '%'
            });
          }
        }
      }, true);

      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // BEGIN handling of seek: mouse/touch interactions with the playhead
      // startSeek when they mousedown or touchdown (binds the finish and cancel events)
      // seeking on mousemove or touchmove (sets the time they will be seeking to)
      // finishSeek when they mouseup or touchend inside the playhead (triggers the actual seek)
      // cancelSeek when they mouseup or touchend outside the playhead (cancels)

      var startSeek = function (evt) {
        // console.log('startSeek');
        playbackService.pauseOtherPlayers();
        $timeout(function () {
          // short delay for visibility of handle (don't want it when just clicking)
          scope.seekHandleVisible = true;
        }, 250);
        scope.isSeeking = true;

        var userEventName = (appState.isTouchDevice) ? 'touchend.timeline' : 'mouseup.timeline';
        timelineContainer.bind(userEventName, function () {
          finishSeek();
        });
        angular.element(document)
          .bind(userEventName, function () {
            cancelSeek();
          });
        seeking(evt);
      };

      /* SxS. Needed to position the edit handle when not actively dragging timeline */
      scope.$watch(function () {
        return playbackService.getMetaProp('time');
      }, function () {
        if (appState.editEvent) {
          scope.willSeekTo = playbackService.getMetaProp('time');
        }
      });

      /* end SxS */

      // triggered on mousemove:
      var seeking = function (evt) {
        if (!scope.isSeeking) {
          return;
        }
        var currentDuration = playbackService.getMetaProp('duration');
        // timelineNode is the full timeline, including offscreen portions if zoomed in.
        // So this math gives how far the pointer is in the full timeline as a percentage,
        // multiplied by the real duration, which gives the real time.
        scope.willSeekTo = (evt.clientX - timelineNode.offset()
            .left) / timelineNode.width() * currentDuration;

        // ios is still registering drags outside the visible boundaries of the timeline,
        // so need to do some sanity checking here:
        if (scope.willSeekTo < 0) {
          scope.willSeekTo = 0;
        }
        if (scope.willSeekTo > currentDuration) {
          scope.willSeekTo = currentDuration;
        }
      };

      var finishSeek = function () {
        // console.log("timeline mouseup or touchend");
        scope.stopWatching = true;
        scope.enableAutoscroll(); // in playerController
        timelineSvc.seek(scope.willSeekTo, 'scrubTimeline');
        zoom();
      };

      var cancelSeek = function () {
        // console.log("doc mouseup or touchend");
        // kill all events on  mouse up (anywhere).
        angular.element(document)
          .off('mouseup.timeline');
        angular.element(document)
          .off('touchend.timeline');
        timelineContainer.off('mouseup.timeline');
        timelineContainer.off('touchend.timeline');
        $timeout(function () {
          scope.isSeeking = false;
          scope.seekHandleVisible = false;
        });
      };

      var initPlayheadEvents = function () {
        // bind playhead events:
        var playhead = $(element.find('.playhead')); // WARN template url needs to have resolved first!
        // console.log("ittTimeline initPlayheadEvents", playhead);
        if (appState.isTouchDevice) {
          playhead.on('touchstart.timeline', function (e) {
            startSeek(e.originalEvent.targetTouches[0]);
            e.preventDefault();
          });
          playhead.on('touchmove.timeline', function (e) {
            seeking(e.originalEvent.targetTouches[0]);
            e.preventDefault();
          });
        } else {
          playhead.on('mousedown.timeline', function (e) {
            startSeek(e);
            e.preventDefault();
          });
          playhead.on('mousemove.timeline', function (e) {
            seeking(e);
            e.preventDefault();
          });
        }
      };

      scope.$on('$destroy', function () {
        cancelSeek(); // unbinds playhead events
        editWatcher(); // stop watching for event edits
      });

    }
  };
}
