
import centeredHtml from './centered.html';

export class CenteredTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = centeredHtml;
  scope = true;
  static Name = 'npCenteredTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new CenteredTemplate();
  }
}
