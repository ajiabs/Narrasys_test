/**
 * Created by githop on 3/22/17.
 */
ittClipboard.$inject = ['ittUtils'];

export default function ittClipboard(ittUtils) {
  return {
    restrict: 'EA',
    transclude: true,
    template: [
      '<itt-tooltip tip-text="{{$ctrl.tipText}}" ng-click="$ctrl.bubbleEvent($event)">',
      ' <a class="icon__button button__clipboard"></a>',
      '</itt-tooltip>'
    ].join(''),
    scope: {
      sourceText: '@',
      tipText: '@?',
      onCopy: '&'
    },
    controller: [function () {
      var ctrl = this;
      var _ngTimeout = ittUtils.ngTimeout;
      var _defaultText = ctrl.tipText || 'Click to copy URL';
      angular.extend(ctrl, {
        tipText: _defaultText,
        bubbleEvent: bubbleEvent
      });

      function bubbleEvent($event) {
        copyText(ctrl.sourceText);
        ctrl.onCopy({$event: $event});
        ctrl.tipText = 'Copied!';
        _ngTimeout(function () {
          ctrl.tipText = _defaultText;
        }, 1500);
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

