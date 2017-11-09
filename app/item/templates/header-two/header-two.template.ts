

import textH2Html from './text-h2.html';

export class HeaderTwoTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = textH2Html;
  scope = true;
  static Name = 'npHeaderTwoTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new HeaderTwoTemplate();
  }
}
