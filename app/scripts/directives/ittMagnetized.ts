'use strict';

// TODO: remove dependence on jQuery? (lots of it here)
ittMagnetized.$inject = ['$rootScope', '$timeout'];
export default function ittMagnetized($rootScope, $timeout) {
  return {
    restrict: 'A',
    replace: true,
    scope: true,
    link: function (scope, element) {
      const WIDTH = 854;
      const HEIGHT = 480;
      const TRANSITION_DURATION = '0.25s';
      element.css('top', 0);
      element.css('left', 0);
      element.css('position', 'fixed');
      element.css('will-change', 'transform');
      element.css('transform-origin', 'top left');
      element.width(WIDTH);
      element.height(HEIGHT);

      $rootScope.$on('magnet.changeMagnet', (evt, magnet) => jumpToMagnet(magnet, false));
      $rootScope.$on('magnet.jumpToMagnet', (evt, magnet) => jumpToMagnet(magnet, true));

      function jumpToMagnet (magnet, animateTransition: boolean) {
        if (magnet == null) {
          return;
        }
        $timeout(() => {
          const {top, left, width} = magnet[0].getBoundingClientRect();

          if (animateTransition === true) {
            element.css('transition-duration', TRANSITION_DURATION);
          }

          const scaleX = width / WIDTH;

          element.css('transform', `translate(${left}px, ${top}px) scale(${scaleX})`);

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
