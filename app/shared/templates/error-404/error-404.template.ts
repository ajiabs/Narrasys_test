

import error404Html from './error-404.html';

export class Error404Template implements ng.IDirective {
  restrict: string = 'EA';
  template = error404Html;
  scope = true;
  static Name = 'npError404Template'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new Error404Template();
  }
}
