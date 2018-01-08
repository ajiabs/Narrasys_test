// @npUpgrade-shared-true
/**
 * Created by githop on 9/28/16.
 */

const TEMPLATE = `
<span class="ittTooltip" ng-mouseenter="$ctrl.mouseAction(true)" ng-mouseleave="$ctrl.mouseAction(false)">
	<ng-transclude></ng-transclude>
	<span
	  ng-if="$ctrl.showTip" ng-class="$ctrl.css" style="text-indent: 0;">{{$ctrl.tipText}}</span>
</span>
`;

interface ITooltipBindings extends ng.IComponentController {
  tipText: string;
  css?: string;
}

class TooltipController implements ITooltipBindings {
  tipText: string;
  css?: string;
  //
  showTip: boolean;

  $onInit() {
    if (this.css == null) {
      this.css = 'ittTooltip__text';
    }
  }

  mouseAction(bool: boolean) {
    this.showTip = bool;
  }
}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class Tooltip implements ng.IComponentOptions {
  transclude = true;
  bindings: IComponentBindings = {
    tipText: '@',
    css: '@?'
  };
  template: string = TEMPLATE;
  controller = TooltipController;
  static Name: string = 'npTooltip'; // tslint:disable-line
}
/* tslint:disable */
// export default function ittTooltip() {
//   return {
//     restrict: 'EA',
//     transclude: true,
//     scope: {
//       tipText: '@',
//       css: '@?'
//     },
//     template: [
//       '<span class="ittTooltip">',
//       '	<ng-transclude></ng-transclude>',
//       '	<span ng-if="showTip" class="{{css ? css : \'ittTooltip__text\'}}" style="text-indent: 0;">{{tipText}}</span>',
//       '</span>'
//     ].join(''),
//     link: function (scope, elm) {
//       elm.mouseenter(onMouseenter);
//       function onMouseenter() {
//         scope.$apply(function () {
//           scope.showTip = true;
//         });
//       }
//
//       elm.mouseleave(onMouseleave);
//       function onMouseleave() {
//         scope.$apply(function () {
//           scope.showTip = false;
//         });
//       }
//     }
//   };
// }
