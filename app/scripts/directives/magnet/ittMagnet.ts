// Sends magnet signal whenever becomes visible.
// In watch mode (only), also watches the window size and tries to keep the video from overflowing the window height

import {CHANGE_MAGNET, JUMP_TO_MAGNET, UPDATE_MAGNET} from '../../constants';

class MagnetStore {
  constructor(private _bcr: ClientRect) {}

  static of(bcr) {
    return new MagnetStore(bcr);
  }

  get bcr() {
    return this._bcr;
  }
}

// TODO: remove dependence on jQuery?  (.is(:visible))
ittMagnet.$inject = ['$rootScope', '$timeout', 'appState', 'playbackService'];

export default function ittMagnet($rootScope, $timeout, appState, playbackService) {
  return {
    restrict: 'A',
    replace: true,
    scope: true,
    link: function mangetLinkFn(scope, element) {

      const $watches = {
        magnetBoundingClientRect: null,
        size: null
      };

      $rootScope.$on(UPDATE_MAGNET, () => changeMagnet());

      onInit();

      function onInit() {
        window.addEventListener('resize', onResize);
        $watches.magnetBoundingClientRect = scope.$watchCollection(watchBcr, handleNewMagnetBcr, true);

        if (element.attr('id') === 'watchModeVideoMagnet') {
          $watches.size = scope.$watch(watchSize, handleSize, true);
        }
      }

      function onDestroy() {
        window.removeEventListener('resize', onResize);
        Object.keys($watches).forEach((fn) => {
          if ($watches[fn]) {
            $watches[fn]();
          }
        });
      }

      function onResize() {
        changeMagnet();
        scope.$digest();
      }

      function watchBcr() {
        const { top, left, width } = element[0].getBoundingClientRect();

        let documentOffset = top;

        if (appState.viewMode !== 'review') {
          // for IE compatibility
          const yOffset = (window.pageYOffset !== undefined)
            ? window.pageYOffset
            : (document.documentElement || document.body.parentNode || document.body).scrollTop;
          documentOffset = documentOffset + yOffset;
        }

        return { top: documentOffset, left, width };
      }

      function handleNewMagnetBcr(newV) {
        if (newV) {
          changeMagnet(newV);
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
        changeMagnet();
      }

      function getMagnetBcr(): ng.IPromise<ClientRect> {
        return $timeout(() => {
          return element[0].getBoundingClientRect();
        }, 100);
      }

      function changeMagnet (preCalcedBcr?) {

        if (preCalcedBcr) {
          const magnetStore = MagnetStore.of(preCalcedBcr);
          if (playbackService.getMetaProp('time') === 0) {
            $rootScope.$emit(JUMP_TO_MAGNET, magnetStore.bcr);
            return;
          }

          $rootScope.$emit(CHANGE_MAGNET, magnetStore.bcr);
          return;
        }

        getMagnetBcr().then((bcr) => {
          const magnetStore = MagnetStore.of(bcr);
          if (playbackService.getMetaProp('time') === 0) {
            $rootScope.$emit(JUMP_TO_MAGNET, magnetStore.bcr);
            return;
          }

          $rootScope.$emit(CHANGE_MAGNET, magnetStore.bcr);
        });
      }

      // cleanup watchers on destroy
      scope.$on('$destroy', onDestroy);
    }
  };
}
