

import linkHtml from './link.html';

export class LinkTemplate implements ng.IDirective {
  restrict: string = 'EA';
  template = linkHtml;
  scope = true;
  static Name = 'npLinkTemplate'; // tslint:disable-line

  static factory(): ng.IDirectiveFactory {
    return () => new LinkTemplate();
  }
}
