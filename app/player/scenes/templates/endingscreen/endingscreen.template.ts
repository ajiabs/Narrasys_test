
import endingscreenHtml from './endingscreen.html';

export class EndingscreenTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = endingscreenHtml;
  scope = true;
  static Name = 'npEndingscreenTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new EndingscreenTemplate();
  }
}
