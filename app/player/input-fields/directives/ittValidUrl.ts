// @npUpgrade-inputFields-true
import { isValidURL } from '../../../shared/services/ittUtils';

/**
 * Created by githop on 6/24/16.
 */


export class ValidUrl implements ng.IDirective {
  restrict: string = 'A';
  require = '?ngModel';
  static Name = 'npValidUrl'; // tslint:disable-line
  constructor() {
    //
  }

  static factory(): ng.IDirectiveFactory {
    const directiveInstance = () => new ValidUrl();
    directiveInstance.$inject = ValidUrl.$inject;
    return directiveInstance;
  }

  link(scope: ng.IScope, elm: JQuery, attrs: ng.IAttributes, ngModel): void {
    if (ngModel) {
      ngModel.$validators.supportUrl = function (modelVal) {
        return ngModel.$isEmpty(modelVal) || isValidURL(modelVal);
      };
    }
  }
}
