
import linkModalThumbHtml from './link-modal-thumb.html';

export class LinkModalThumbTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = linkModalThumbHtml;
  scope = true;
  static Name = 'npLinkModalThumbTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new LinkModalThumbTemplate();
  }
}
