
import pipHtml from './pip.html';

export class PipTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = pipHtml;
  scope = true;
  static Name = 'npPipTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new PipTemplate();
  }
}
