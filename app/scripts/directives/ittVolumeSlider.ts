ittVolumeSlider.$inject = ['playbackService'];

export default function ittVolumeSlider(playbackService) {
  return {
    restrict: 'E',
    scope: true,
    template: '<div ng-focus="showControls()" role="slider" aria-label="volume" aria-valuemin="0" aria-valuemax="100" aria-valuenow="{{currentVolume()}}" aria-valuetext="{{currentVolume()}}" tabindex="0" class="volumebar" ng-mousedown="userChangingVolume($event)" ng-keydown="onVolumeKeyDown($event)" aria-labelledby="volumeControlDescription"> <div class="volume" ng-style="{width: currentVolume()+\'%\'}"></div> <div id="volumeControlDescription" class="screen-reader-offscreen"> Use left and right arrows to increase or decrease the volume by 1. Use page up and page down to increase or decrease the volume by 10. Use home and end to move to the volume to the lowest and highest setting.  </div> ',
    multiElement: false,
    link: function (scope) {

      scope.userChangingVolume = function (evt) {
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

    }
  };
}
