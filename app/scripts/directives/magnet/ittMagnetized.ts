'use strict';

// TODO: remove dependence on jQuery? (lots of it here)
ittMagnetized.$inject = ['$rootScope', '$timeout', 'appState'];
export default function ittMagnetized($rootScope, $timeout: ng.ITimeoutService, appState) {

  return {
    restrict: 'A',
    replace: true,
    scope: true,
    link: function (scope, element) {
      const WIDTH = 854;
      const HEIGHT = 478;
      const TRANSITION_DURATION = '0.25s';
      element.css('top', 0);
      element.css('left', 0);
      element.css('position', 'absolute');
      element.css('will-change', 'transform');
      element.css('transform-origin', 'top left');
      element.width(WIDTH);
      element.height(HEIGHT);

      $rootScope.$on('magnet.changeMagnet', (evt, magnet) => jumpToMagnet(magnet, true));
      $rootScope.$on('magnet.jumpToMagnet', (evt, magnet) => jumpToMagnet(magnet, false));
      function jumpToMagnet (magnet, animateTransition: boolean) {

        if (magnet == null) {
          return;
        }
        $timeout(() => {
          if (appState.viewMode === 'review') {
            element.css('position', 'fixed');
          } else {
            element.css('position', 'absolute');
          }

          const {top, left, width} = magnet[0].getBoundingClientRect();

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

          // element.width(Math.ceil(width));
          // element.height(Math.ceil(width / aspectRatio));

        }, 100); //100ms timeout to allow the appropriate height value to be set when coming out of search mode

      }

      // cleanup watchers on destroy
      scope.$on('$destroy', function () {
        if (scope.unwatch) {
          scope.unwatch();
        }
      });
    }
  };
}
