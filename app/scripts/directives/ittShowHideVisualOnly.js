'use strict';

angular.module('com.inthetelling.story')
  .directive('ittShowHideVisualOnly', ittShowHideVisualOnly)
  .animation(".visual-hide", visualHideAnimation);


ittShowHideVisualOnly.$inject = ['$animate'];


function ittShowHideVisualOnly($animate) {
  return {
    restrict: 'A',
    multiElement: true,
    link: function (scope, element, attr) {
      scope.$watch(attr.ittShowHideVisualOnly, function ngShowWatchAction(value) {
        if (value) {
          $animate.removeClass(element, 'visual-hide');
        } else {
          $animate.addClass(element, 'visual-hide');
        }
      });
    }
  };
}

function visualHideAnimation() {
  return {
    addClass: function (element) {
      //we'll use opacity, so we aren't hidden from screen readers, just hidden from eyes.
      element.fadeTo("slow", 0, function () {
      });
    },
    removeClass: function (element) {
      element.fadeTo("slow", 1, function () {
      });
    }
  };
}


