// @npUpgrade-player-true
// Sends magnet signal whenever becomes visible.
// In watch mode (only), also watches the window size and tries to keep the video from overflowing the window height

import { CHANGE_MAGNET, JUMP_TO_MAGNET, UPDATE_MAGNET } from '../../constants';

class MagnetStore {
  constructor(private _bcr: ClientRect) {}

  static of(bcr) {
    return new MagnetStore(bcr);
  }

  get bcr() {
    return this._bcr;
  }
}

export class Magnet implements ng.IDirective {
  restrict: string = 'A';
  static Name = 'ittMagnet'; // tslint:disable-line
  static $inject = ['$rootScope', '$timeout', 'appState', 'playbackService'];
  constructor(
    private $rootScope: ng.IRootScopeService,
    private $timeout: ng.ITimeoutService,
    private appState,
    private playbackService) {

  }

  static factory(): ng.IDirectiveFactory {
    const directiveInstance =
      ($rootScope, $timeout, appState, playbackService) => new Magnet($rootScope, $timeout, appState, playbackService);
    directiveInstance.$inject = Magnet.$inject;
    return directiveInstance;
  }

  link(scope: ng.IScope, element: JQuery, attrs: ng.IAttributes): void {

    const $watches = {
      magnetBoundingClientRect: null,
      size: null,
      appState: null
    };

    const _adjustBcrOffset = (top): number => {
      const yOffset = (window.pageYOffset !== undefined)
        ? window.pageYOffset
        : (document.documentElement || document.body.parentNode || document.body).scrollTop;
      return top + yOffset;
    };

    const watchBcr = () => {
      const { top, left, width } = element[0].getBoundingClientRect();

      let documentOffset = top;

      if (this.appState.viewMode !== 'review') {
        // for IE compatibility
        documentOffset = _adjustBcrOffset(top);
      }

      return {  left, width, top: documentOffset };
    };

    const watchAppState = () => {
      return {
        viewMode: this.appState.viewMode,
        videoPosition: this.appState.editEvent.styleCss
      };
    };

    const watchSize = () => {
      return {
        w: angular.element(window).width(),
        h: angular.element(window).height(),
        v: element.is(':visible')
      };
    };

    const changeMagnet  = (preCalcedBcr?) => {
      if (preCalcedBcr) {
        const magnetStore = MagnetStore.of(preCalcedBcr);
        if (this.playbackService.getMetaProp('time') === 0) {
          this.$rootScope.$emit(JUMP_TO_MAGNET, magnetStore.bcr);
          return;
        }

        this.$rootScope.$emit(CHANGE_MAGNET, magnetStore.bcr);
        return;
      }

      getMagnetBcr().then((bcr) => {
        const bcrCopy = Object.assign({}, bcr);
        if (this.appState.viewMode !== 'review') {
          // for IE compatibility
          bcrCopy.top = _adjustBcrOffset(bcrCopy.top);
        }

        const magnetStore = MagnetStore.of(bcrCopy);

        if (this.playbackService.getMetaProp('time') === 0) {
          this.$rootScope.$emit(JUMP_TO_MAGNET, magnetStore.bcr);
          return;
        }

        this.$rootScope.$emit(CHANGE_MAGNET, magnetStore.bcr);
      });
    };

    const handleSize = () => {
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
    };

    const getMagnetBcr = (timeoutDur = 100): ng.IPromise<ClientRect> => {
      return this.$timeout(
        () => {
          const readOnly = element[0].getBoundingClientRect();
          return {
            top: readOnly.top,
            bottom: readOnly.bottom,
            left: readOnly.left,
            right: readOnly.right,
            width: readOnly.width
          };
        },
        timeoutDur
      ).then((bcr: ClientRect) => bcr);
    };

    const handleNewMagnetBcr = (newV) => {
      if (newV) {
        changeMagnet(newV);
      }
    };

    const onResize = () =>  {
      if (this.appState.isIOS() && this.appState.viewMode === 'review') {
        // for some reason a resize event is fired when scrolling
        // in review mode
        return;
      }
      changeMagnet();
    };

    const onDestroy = () => {
      window.removeEventListener('resize', onResize);
      Object.keys($watches).forEach((fn) => {
        if ($watches[fn]) {
          $watches[fn]();
        }
      });
    };

    const onInit = () => {
      window.addEventListener('resize', onResize);


      if (!this.appState.isIOS()) {
        $watches.magnetBoundingClientRect = scope.$watchCollection(watchBcr, handleNewMagnetBcr);
      } else {
        // for iOS, watching the BCR seems to cause cause the video to bounce around when scrolling in longer
        // layouts and when scrolling in review mode.
        // for iOS devices, rely on onInit() to set BCR on layout changes and watch the view mode instead
        // to handle repositioning the video when changing view modes, changing video position in producer etc....

        getMagnetBcr(500).then((bcr: ClientRect) => changeMagnet(bcr));
        $watches.appState = scope.$watchCollection(
          watchAppState,
          (newMode: any, oldMode: any) => {
            if (newMode.videoPosition !== oldMode.videoPosition) {
              this.$timeout(() => changeMagnet(), 500);
              return;
            }

            if (newMode.viewMode) {
              changeMagnet();
            }
          }
        );
      }


      if (element.attr('id') === 'watchModeVideoMagnet') {
        $watches.size = scope.$watch(watchSize, handleSize, true);
      }
    };

    this.$rootScope.$on(UPDATE_MAGNET, () => changeMagnet());

    onInit();
    // cleanup watchers on destroy
    scope.$on('$destroy', onDestroy);
  }
}
