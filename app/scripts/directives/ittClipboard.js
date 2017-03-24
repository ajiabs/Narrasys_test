/**
 * Created by githop on 3/22/17.
 */

(function () {
  'use strict';

  angular.module('com.inthetelling.story')
    .directive('ittClipboard', ittClipboard);

  function ittClipboard() {
    return {
      restrict: 'EA',
      transclude: true,
      template: [
        '<itt-tooltip tip-text="{{$ctrl.sourceText}}" ng-click="$ctrl.bubbleEvent($event)">',
        '<ng-transclude></ng-transclude>',
        '</itt-tooltip>'
      ].join(''),
      scope: {
        sourceText: '@',
        onCopy: '&'
      },
      controller: [function() {
        var ctrl = this;
        angular.extend(ctrl, {
          bubbleEvent: bubbleEvent
        });

        function bubbleEvent($event) {
          copyText(ctrl.sourceText);
          ctrl.onCopy({$event: $event});
        }

        function copyText(text) {
          var textArea = document.createElement('textarea');
          textArea.value = text;
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.setSelectionRange(0, textArea.value.length);
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }

      }],
      controllerAs: '$ctrl',
      bindToController: true
    };
  }


})();