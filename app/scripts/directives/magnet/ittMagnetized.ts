'use strict';

import { CHANGE_MAGNET, JUMP_TO_MAGNET } from '../../constants';

// TODO: remove dependence on jQuery? (lots of it here)
ittMagnetized.$inject = ['$rootScope', '$timeout', 'appState'];
export default function ittMagnetized($rootScope, $timeout: ng.ITimeoutService, appState) {

  return {
    restrict: 'A',
    replace: true,
    scope: true,
    link: function (scope, element) {
      const WIDTH = 854;
      const TRANSITION_DURATION = '0.25s';

      $rootScope.$on(CHANGE_MAGNET, (evt, magnetElmBcr: ClientRect) => jumpToMagnet(magnetElmBcr, true));
      $rootScope.$on(JUMP_TO_MAGNET, (evt, magnetElmBcr: ClientRect) => jumpToMagnet(magnetElmBcr, false));

      function jumpToMagnet (magnetElmBcr: ClientRect, animateTransition: boolean) {

        if (magnetElmBcr == null) {
          return;
        }

        if (appState.viewMode === 'review') {
          element.css('position', 'fixed');
        } else {
          element.css('position', 'absolute');
        }

        const { top, left, width } = magnetElmBcr;

        if (animateTransition === true) {
          element.css('transition-timing-function', 'cubic-bezier(0.4, 0, 1, 1)');
          element.css('transition-duration', TRANSITION_DURATION);
        } else {
          element.css('transition-duration', 'unset');
          element.css('transition-timing-function', 'unset');
        }

        const scaleFactor = width / WIDTH;
        if (scaleFactor === 0) {
          return;
        }

        element.css('transform', `translate(${Math.abs(left)}px, ${Math.abs(top)}px) scale(${scaleFactor})`);
      }

      // cleanup watchers on destroy
      scope.$on('$destroy', () => {
        if (scope.unwatch) {
          scope.unwatch();
        }
      });
    }
  };
}
