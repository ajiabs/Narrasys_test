// Sends magnet signal whenever becomes visible.
// In watch mode (only), also watches the window size and tries to keep the video from overflowing the window height

import {CHANGE_MAGNET, JUMP_TO_MAGNET, UPDATE_MAGNET} from '../../constants';


// TODO: remove dependence on jQuery?  (.is(:visible))
ittMagnet.$inject = ['$rootScope', 'appState', 'playbackService'];

export default function ittMagnet($rootScope, appState, playbackService) {
  return {
    restrict: 'A',
    replace: true,
    scope: true,
    link: function mangetLinkFn(scope, element) {

      window.addEventListener('resize', () => {
        $rootScope.$emit(JUMP_TO_MAGNET, element);
        scope.$digest();
      });

      $rootScope.$on(UPDATE_MAGNET, () => changeMagnet(element));

      scope.changeMagnet = changeMagnet;
      scope.unwatchVisibility = scope.$watch(watchVisibility, handleVisibility);

      if (element.attr('id') === 'watchModeVideoMagnet') {
        scope.unwatchSize = scope.$watch(watchSize, handleSize, true);
      }

      function watchVisibility() {
        return element.is(':visible');
      }

      function handleVisibility(newV) {
        if (newV) {
          changeMagnet(element);
        }
      }

      function watchSize() {
        return {
          w: angular.element(window).width(),
          h: angular.element(window).height(),
          v: element.is(':visible')
        };
      }

      function handleSize() {
        // console.log('watch mode guy');
        // we want the video to be as wide as possible without overflowing the window.
        // And dont' want to set the height directly, just the width. So math:
        const win = angular.element(window);
        const maxAllowableHeight = win.height() - 46; // TOOLBAR HEIGHT (plus some slop)
        if (win.width() / maxAllowableHeight > (16 / 9)) {
          element.width(16 / 9 * maxAllowableHeight);
        } else {
          element.width(win.width());
        }
        changeMagnet(element);
      }

      function changeMagnet (elm) {
        if (appState.isTouchDevice || playbackService.getMetaProp('time') === 0) {
          $rootScope.$emit(JUMP_TO_MAGNET, elm);
          return;
        }

        $rootScope.$emit(CHANGE_MAGNET, elm);
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
