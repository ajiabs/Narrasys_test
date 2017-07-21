'use strict';

// TODO: remove dependence on jQuery? (lots of it here)
ittMagnetized.$inject = ['$rootScope', '$timeout', 'appState'];
export default function ittMagnetized($rootScope, $timeout, appState) {
  return {
    restrict: 'A',
    replace: true,
    scope: true,
    link: function (scope, element) {
      const aspectRatio = 16 / 9;
      const WIDTH = 854;
      const HEIGHT = 480;
      element.css('top', 0);
      element.css('left', 0);
      element.css('position', 'fixed');
      element.css('will-change', 'transform');
      // element.css('transform-origin', 'top left');
      element.width(WIDTH);
      element.height(HEIGHT);

      $rootScope.$on('magnet.changeMagnet', (evt, magnet) => jumpToMagnet(magnet, false));
      $rootScope.$on('magnet.jumpToMagnet', (evt, magnet) => jumpToMagnet(magnet, true));

      function jumpToMagnet (magnet, jump: boolean) {
        if (magnet == null) {
          return;
        }
        $timeout(() => {
          const {top, left, width} = magnet[0].getBoundingClientRect();

          if (jump === true) {
            element.css('transition-duration', '0.25s');
          }

          // const scaleX = width / WIDTH;
          // const scaleY = height / HEIGHT;
          // console.log('magnet w', width, 'el width', WIDTH);
          // console.log('magnet H', height, 'el H', HEIGHT);
          // console.log('aspect W', width / aspectRatio);
          // console.log('scales', scaleX, scaleY);
          // console.log('bcr', left, top);

          element.css('transform', `translate(${left}px, ${top}px)`);
          // element.css('transform', `scale(${scaleX}) translate(${left}px, ${top}px)`);

          element.width(Math.ceil(width));
          element.height(Math.ceil(width / aspectRatio));
        }, 20);

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
