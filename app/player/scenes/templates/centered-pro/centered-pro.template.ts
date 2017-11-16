
import centeredProHtml from './centeredPro.html';

export class CenteredProTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = centeredProHtml;
  scope = true;
  static Name = 'npCenteredProTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new CenteredProTemplate();
  }
}
