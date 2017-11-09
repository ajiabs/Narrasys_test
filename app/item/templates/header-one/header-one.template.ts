
import textH1Html from './text-h1.html';

export class HeaderOneTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = textH1Html;
  scope = true;
  static Name = 'npHeaderOneTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new HeaderOneTemplate();
  }
}
