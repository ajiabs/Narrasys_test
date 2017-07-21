// Sends magnet signal whenever becomes visible.
// In watch mode (only), also watches the window size and tries to keep the video from overflowing the window height

// TODO: remove dependence on jQuery?  (.is(:visible))
ittMagnet.$inject = ['$rootScope', '$timeout', 'appState', 'playbackService'];

export default function ittMagnet($rootScope, $timeout, appState, playbackService) {
  return {
    restrict: 'A',
    replace: true,
    scope: true,
    link: function (scope, element) {

      let resizeTimer;

      window.addEventListener('resize', () => {
        console.log('resize event!');

        $timeout.cancel(resizeTimer);
        resizeTimer = $timeout(() => $rootScope.$emit('magnet.changeMagnet', element), 250);
      });

      scope.changeMagnet = function (element) {
        $rootScope.$emit('magnet.changeMagnet', element);
        // skip the animation on first load, and when on mobile
        if (appState.isTouchDevice || playbackService.getMetaProp('time') === 0) {
          $rootScope.$emit('magnet.jumpToMagnet', element);
        }
      };

      scope.unwatchVisibility = scope.$watch(function () {
        return element.is(':visible');
      }, function (newV) {
        if (newV) {
          scope.changeMagnet(element);
        }
      });

      if (element.attr("id") === 'watchModeVideoMagnet') {
        scope.unwatchSize = scope.$watch(function () {
          return {
            w: angular.element(window).width(),
            h: angular.element(window).height(),
            v: element.is(':visible')
          };
        }, function () {
          // console.log('watch mode guy');
          // we want the video to be as wide as possible without overflowing the window.
          // And dont' want to set the height directly, just the width. So math:
          var win = angular.element(window);
          var maxAllowableHeight = win.height() - 46; // TOOLBAR HEIGHT (plus some slop)
          if (win.width() / maxAllowableHeight > (16 / 9)) {
            element.width(16 / 9 * maxAllowableHeight);
          } else {
            element.width(win.width());
          }
          scope.changeMagnet(element);
        }, true);
      }

      // cleanup watchers on destroy
      scope.$on('$destroy', function () {
        scope.unwatchVisibility();
        if (scope.unwatchSize) {
          scope.unwatchSize();
        }
      });
    }
  };
}
