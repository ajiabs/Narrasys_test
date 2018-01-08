
import rootHtml from './root.html';

export class RootTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = rootHtml;
  scope = true;
  static Name = 'npRootTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new RootTemplate();
  }
}
