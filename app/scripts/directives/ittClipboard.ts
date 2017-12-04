/**
 * Created by githop on 3/22/17.
 */

const TEMPLATE = `
<np-tooltip tip-text="{{$ctrl.tipText}}" ng-click="$ctrl.bubbleEvent($event)">
   <a class="icon__button" ng-class="$ctrl.light ? 'button__clipboard--light' : 'button__clipboard'"></a>
</np-tooltip>
`;

interface IClipboardBindings extends ng.IComponentController {
  sourceText: string;
  tipText?: string;
  light?: boolean;
  customNotice?: boolean;
  onCopy: ($event: { $event: ng.IAngularEvent }) => { $event: ng.IAngularEvent };
}

class ClipboardController implements IClipboardBindings {
  sourceText: string;
  tipText?: string;
  light?: boolean;
  customNotice?: boolean;
  onCopy: ($event: { $event: ng.IAngularEvent }) => { $event: ng.IAngularEvent };
  //
  private _defaultText: string;
  static $inject = ['$timeout'];
  constructor(private $timeout: ng.ITimeoutService) {

  }

  static copyText(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.setSelectionRange(0, textArea.value.length);
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }

  $onInit() {
    if (this.tipText == null) {
      this.tipText = 'Click to copy URL';
    }
    this._defaultText = this.tipText;
  }

  bubbleEvent($event: ng.IAngularEvent) {
    ClipboardController.copyText(this.sourceText);
    this.onCopy({ $event });
    if (this.customNotice == null) {
      this.tipText = 'Copied';
      this.$timeout(
        () => {
          this.tipText = this._defaultText;
        },
        1500
      );
    }
  }

}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class Clipboard implements ng.IComponentOptions {
  transclude = true;
  bindings: IComponentBindings = {
    sourceText: '@',
    tipText: '@?',
    light: '<?',
    customNotice: '<?',
    onCopy: '&'
  };
  template: string = TEMPLATE;
  controller = ClipboardController;
  static Name: string = 'npClipboard'; // tslint:disable-line
}

// ittClipboard.$inject = ['ittUtils'];
//
// export default function ittClipboard(ittUtils) {
//   return {
//     restrict: 'EA',
//     transclude: true,
//     template: `
//     <np-tooltip tip-text="{{$ctrl.tipText}}" ng-click="$ctrl.bubbleEvent($event)">
//        <a class="icon__button" ng-class="$ctrl.light ? 'button__clipboard--light' : 'button__clipboard'"></a>
//       </np-tooltip>
//     `,
//     scope: {
//       sourceText: '@',
//       tipText: '@?',
//       onCopy: '&',
//       light: '<?',
//       customNotice: '<?'
//     },
//     controller: [function () {
//       var ctrl = this;
//       var _ngTimeout = ittUtils.ngTimeout;
//       var _defaultText = ctrl.tipText || 'Click to copy URL';
//       angular.extend(ctrl, {
//         tipText: _defaultText,
//         bubbleEvent: bubbleEvent
//       });
//
//       function bubbleEvent($event) {
//         copyText(ctrl.sourceText);
//         ctrl.onCopy({$event: $event});
//         if (ctrl.customNotice == null) {
//           ctrl.tipText = 'Copied!';
//           _ngTimeout(function () {
//             ctrl.tipText = _defaultText;
//           }, 1500);
//         }
//       }
//
//       function copyText(text) {
//         var textArea = document.createElement('textarea');
//         textArea.value = text;
//         document.body.appendChild(textArea);
//         textArea.focus();
//         textArea.setSelectionRange(0, textArea.value.length);
//         document.execCommand('copy');
//         document.body.removeChild(textArea);
//       }
//
//     }],
//     controllerAs: '$ctrl',
//     bindToController: true
//   };
// }

