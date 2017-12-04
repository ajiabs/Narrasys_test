/**
 * Created by githop on 6/16/16.
 */
const TEMPLATE = `
<div ng-mouseenter="$ctrl.mouseEvent(true)" ng-mouseleave="$ctrl.mouseEvent(false)">
	<span class="pencil__content" ng-transclude></span>
	<span style="text-indent: 0">
		<span class="edit-pencil" ng-click="$ctrl.sendEdit($event)" ng-if="$ctrl.showPencil || $ctrl.force"></span>
	</span>
</div>
`;

interface IEditPencilBindings extends ng.IComponentController {
  canAccess?: boolean;
  force?: boolean;
  onEdit: ($event: {$event: ng.IAngularEvent}) => { $event: ng.IAngularEvent };
}

class EditPencilController implements IEditPencilBindings {
  canAccess?: boolean;
  force?: boolean;
  onEdit: ($event: {$event: ng.IAngularEvent}) => { $event: ng.IAngularEvent };
  //
  showPencil: boolean = false;
  static $inject = [];
  sendEdit($event: ng.IAngularEvent) {
    this.showPencil = false;
    this.onEdit({ $event });
  }

  mouseEvent(bool: boolean) {
    if (this.canAccess) {
      this.showPencil = bool;
    }
  }

}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class EditPencil implements ng.IComponentOptions {
  transclude = true;
  bindings: IComponentBindings = {
    canAccess: '<?',
    force: '<?',
    onEdit: '&'
  };
  template: string = TEMPLATE;
  controller = EditPencilController;
  static Name: string = 'npEditPencil'; // tslint:disable-line
}


// export default function ittEditPencil() {
//   return {
//     restrict: 'EA',
//     transclude: true,
//     scope: {
//       canAccess: '=?',
//       force: '=?',
//       onEdit: '&'
//     },
//     template: [
//       '<div>',
//       '	<span class="pencil__content" ng-transclude></span>',
//       '	<span style="text-indent: 0">',
//       '		<span class="edit-pencil" ng-click="sendEdit($event)" ng-if="showPencil || force"></span>',
//       '	</span>',
//       '</div>'
//     ].join(' '),
//     link: function (scope, elm) {
//       scope.showPencil = false;
//
//       scope.sendEdit = sendEdit;
//       elm.mouseenter(mouseenter);
//       elm.mouseleave(mouseleave);
//
//       function sendEdit($ev) {
//         scope.showPencil = false;
//         scope.onEdit({$event: $ev});
//       }
//
//       function mouseenter() {
//         if (scope.canAccess === true) {
//           scope.$apply(function () {
//             scope.showPencil = true;
//           });
//         }
//       }
//
//       function mouseleave() {
//         if (scope.canAccess === true) {
//           scope.$apply(function () {
//             scope.showPencil = false;
//           });
//         }
//       }
//
//     }
//   };
// }

