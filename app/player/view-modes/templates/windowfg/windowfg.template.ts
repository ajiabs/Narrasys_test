
import windowfgHtml from './windowfg.html';

export class WindowfgTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = windowfgHtml;
  scope = true;
  static Name = 'npWindowfgTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new WindowfgTemplate();
  }
}
