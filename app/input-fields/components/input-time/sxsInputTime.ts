// @npUpgrade-inputFields-false
/*For form fields: displays m:ss, sets model as number of seconds. accepts s or m:ss as input. */
sxsInputTime.$inject = ['$rootScope', '$timeout', 'appState', 'modelSvc', 'timelineSvc', 'playbackService', 'ittUtils'];

export default function sxsInputTime($rootScope, $timeout, appState, modelSvc, timelineSvc, playbackService, ittUtils) {
  return {
    require: '?^^form',
    scope: {
      item: '=sxsInputTime'
    },
    templateUrl: 'input-fields/input-time/inputtime.html',
    link: function (scope, elem, attrs, ngForm) {

      var _existy = ittUtils.existy;

      angular.extend(scope, {
        fieldname: angular.copy(attrs.inputField), // start_time or end_time
        realValue: angular.copy(scope.item[attrs.inputField]), // internal representation of the selected time.  Don't parse or format this, it causes rounding errors,
        playbackService: playbackService,
        model: format(angular.copy(scope.item[attrs.inputField])), // user input
        appState: appState,
        parse: parse,
        format: format,
        nudge: nudge,
        setTime: setTime,
        showTools: showTools,
        isTranscript: isTranscript
      });

      onInit();

      function onInit() {
        if (scope.item._type === 'Scene') {
          scope.scene = function () {
            return scope.item;
          };
        } else {
          scope.scene = function () {
            return modelSvc.sceneAtEpisodeTime(scope.item.cur_episode_id, playbackService.getMetaProp('time'));
          };
        }
      }

      // Watch for user input, send it to item if different
      scope.$watch(watchModel, handleUpdates);

      function watchModel() {
        return parse(scope.model);
      }

      function handleUpdates(parsedTime) {

        setTime(parsedTime);

        // Stop questions should always have the same start + end
        if (attrs.inputField === 'start_time' && scope.item.stop) {
          scope.item.end_time = parsedTime;
        }
      }

      function handelValidation(t) {
        scope.item.validationMessage = null;
        ngForm.time.$setValidity('time', true);

        //these validations are specific to scenes.
        if (scope.item._type !== 'Scene') {
          return true;
        }

        var isValidInput = false;
        var validStartTime = validateStartTime(t);
        var isOnExistingScene = validateSceneStartTime(t);

        isValidInput = validStartTime && isOnExistingScene;

        if (!isValidInput) {
          if (ngForm) {
            ngForm.time.$setValidity('time', false);
            ngForm.time.$setViewValue(format(t));
            ngForm.time.$render();


            if (!isOnExistingScene) {
              scope.item.validationMessage = 'Scenes cannot share the same start time.';
            }

            if (!validStartTime) {
              scope.item.validationMessage = 'For a start time <=0:00.1, please edit the first layout';
            }

          }
        }

        return isValidInput;
      }

      function validateSceneStartTime(t) {
        var isOnSameStartTime;
        var isValid = true;
        //don't check the current scene
        if (scope.item.start_time !== t) {
          isOnSameStartTime = modelSvc.isOnExistingSceneStart(t);
          isValid = !isOnSameStartTime;
        }

        return isValid;
      }

      function validateStartTime(t) {
        return (_existy(t) && t > 0.1);
      }

      function setTime(t) { // pass in parsed values only!

        if (handelValidation(t) === false) {
          return;
        }

        if (t > episodeDuration) {
          t = episodeDuration;
        }
        if (scope.item.stop) {
          scope.item.end_time = t;
        }
        scope.realValue = t;
        scope.item[attrs.inputField] = scope.realValue;
        scope.model = scope.format(t);

        scope.item.invalid_end_time = (scope.item.start_time > scope.item.end_time);
      }

      function parse(data) {
        // console.log("Converting view ", data, " to model");
        var ret;
        if (data === undefined || data === '') {
          ret = playbackService.getMetaProp('time');
        } else if (isNaN(data)) {
          var mss = data.split(':');
          if (mss.length === 2) {
            if (isNaN(mss[0])) {
              mss[0] = 0;
            }
            if (isNaN(mss[1])) {
              mss[1] = 0;
            }
            ret = (Number(mss[0]) * 60 + Number(mss[1]));
          } else {
            ret = playbackService.getMetaProp('time');
          }
        } else {
          ret = data;
        }
        // HACK First scene is bumped a bit after the landing screen...
        if (ret < 0.01) {
          ret = 0.01;
        }
        $rootScope.$emit('searchReindexNeeded'); // HACK
        return ret;
      }

      function format(data) {
        // convert model value to view value
        // in a way which is not completely borken, for a change
        // srsly how was that even working before
        var mins = Math.floor(data / 60);
        var secs = Math.round((data % 60) * 100) / 100;
        if (secs < 10) {
          secs = "0" + secs;
        }
        return mins + ":" + secs;
      }

      // console.log("initing inputTime: ", scope.realValue, scope.model);
      // TODO this will break in multi-episode timelines
      var episodeDuration = modelSvc.episodes[scope.item.cur_episode_id].masterAsset.duration;

      function nudge(amt) {
        // keep the tooltip panel open:
        $timeout.cancel(tooltipHider);
        elem.find('.inputfield').focus();

        // This ends up triggering setTime twice (it changes scope.model, which triggers the $watch)  Oh Well
        var diff = amt / 30; // pretend 1 frame is always 1/30s for now
        setTime(scope.item[attrs.inputField] + diff);
        if (attrs.inputField === 'start_time') {
          timelineSvc.seek(scope.item[attrs.inputField] + diff);
        }
      }

      var tooltipHider;

      function showTools(x) {
        if (x) {
          scope.tooltip = true;
        } else {
          // allow time for clicks before we unload the thing being clicked on:
          tooltipHider = $timeout(function () {
            scope.tooltip = false;
          }, 300);
        }
      }

      function isTranscript() {
        // TODO
        return false;
      }

    }
  };
}
