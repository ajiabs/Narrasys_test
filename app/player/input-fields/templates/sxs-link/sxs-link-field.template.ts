
import sxsLinkHtml from './sxs-link.html';

export class SxsLinkFieldTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = sxsLinkHtml;
  scope = true;
  static Name = 'npSxsLinkFieldTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new SxsLinkFieldTemplate();
  }
}
