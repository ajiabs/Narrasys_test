
import sxsLinkHtml from './sxs-link.html';

export class SxsLinkTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = sxsLinkHtml;
  scope = true;
  static Name = 'npSxsLinkTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new SxsLinkTemplate();
  }
}
