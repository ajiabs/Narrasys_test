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

// var pageWidth, pageHeight;
//
// var basePage = {
//   width: 800,
//   height: 600,
//   scale: 1,
//   scaleX: 1,
//   scaleY: 1
// };
//
// $(function(){
//   var $page = $('.page_content');
//
//   getPageSize();
//   scalePages($page, pageWidth, pageHeight);
//
//   //using underscore to delay resize method till finished resizing window
//   $(window).resize(_.debounce(function () {
//     getPageSize();
//     scalePages($page, pageWidth, pageHeight);
//   }, 150));
//
//
//   function getPageSize() {
//     pageHeight = $('#container').height();
//     pageWidth = $('#container').width();
//   }
//
//   function scalePages(page, maxWidth, maxHeight) {
//     var scaleX = 1, scaleY = 1;
//     scaleX = maxWidth / basePage.width;
//     scaleY = maxHeight / basePage.height;
//     basePage.scaleX = scaleX;
//     basePage.scaleY = scaleY;
//     basePage.scale = (scaleX > scaleY) ? scaleY : scaleX;
//
//     var newLeftPos = Math.abs(Math.floor(((basePage.width * basePage.scale) - maxWidth)/2));
//     var newTopPos = Math.abs(Math.floor(((basePage.height * basePage.scale) - maxHeight)/2));
//
//     page.attr('style', '-webkit-transform:scale(' + basePage.scale + ');left:' + newLeftPos + 'px;top:' + newTopPos + 'px;');
//   }
// });
