// @npUpgrade-shared-true
/**
 * Created by githop on 6/1/16.
 */

const TEMPLATE = `
<div ng-class="$ctrl.wrapperClass">
  <div ng-class="$ctrl.modalClass">
    <ng-transclude></ng-transclude>
  </div>
</div>
`;

interface IModalBindings extends ng.IComponentController {
  modalClass?: string;
  wrapperClass?: string;
}

class ModalController implements IModalBindings {
  modalClass?: string;
  wrapperClass?: string;

  $onInit() {
    if (this.wrapperClass == null) {
      this.wrapperClass = 'itt__modal';
    }
  }
}

interface IComponentBindings {
  [binding: string]: '<' | '<?' | '&' | '&?' | '@' | '@?' | '=' | '=?';
}

export class Modal implements ng.IComponentOptions {
  transclude = true;
  bindings: IComponentBindings = {
    modalClass: '@?',
    wrapperClass: '@?'
  };
  template: string = TEMPLATE;
  controller = ModalController;
  static Name: string = 'npModal'; // tslint:disable-line
}

